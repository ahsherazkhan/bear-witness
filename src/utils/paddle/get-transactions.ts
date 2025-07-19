'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getErrorMessage, parseSDKResponse } from '@/utils/paddle/data-helpers';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { TransactionResponse } from '@/lib/api.types';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/get-user';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function getTransactions(subscriptionId: string, after: string): Promise<TransactionResponse> {
  try {
    const customerId = await getCustomerId();
    if (customerId) {
      const transactionCollection = getPaddleInstance().transactions.list({
        customerId: [customerId],
        after: after,
        perPage: 10,
        status: ['billed', 'paid', 'past_due', 'completed', 'canceled'],
        subscriptionId: subscriptionId ? [subscriptionId] : undefined,
      });
      const transactionData = await transactionCollection.next();
      return {
        data: parseSDKResponse(transactionData ?? []),
        hasMore: transactionCollection.hasMore,
        totalRecords: transactionCollection.estimatedTotal,
        error: undefined,
      };
    } else {
      return { data: [], hasMore: false, totalRecords: 0 };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Fallback to database
    try {
      // Use service role to bypass RLS
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // Get the current user from auth
      const authClient = await createClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      if (!user) {
        return { data: [], hasMore: false, totalRecords: 0, error: 'User not found' };
      }

      // The customer ID is the same as the user ID
      const customerId = user.id;

      // Always show all transactions for the customer, regardless of subscription linking
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      const { data: transactions, error } = await query;

      if (error) {
        return { data: [], hasMore: false, totalRecords: 0, error: error.message };
      }

      // Format transactions to match Paddle API response
      const formattedTransactions =
        transactions?.map(
          (transaction: any) =>
            ({
              id: transaction.paddle_transaction_id,
              status: transaction.status,
              customerId: transaction.customer_id,
              currencyCode: transaction.currency,
              // Convert amount to cents (lowest unit) for parseMoney function
              details: {
                totals: {
                  total: (parseFloat(transaction.amount) * 100).toString(), // Convert to cents
                },
                lineItems: [
                  {
                    product: {
                      name: transaction.subscription_id ? 'Subscription Payment' : 'Payment',
                    },
                  },
                ],
              },
              origin: 'subscription',
              billedAt: transaction.created_at,
              billingPeriod:
                transaction.billing_period_start && transaction.billing_period_end
                  ? {
                      startsAt: transaction.billing_period_start,
                      endsAt: transaction.billing_period_end,
                    }
                  : undefined,
              createdAt: transaction.created_at,
              updatedAt: transaction.updated_at,
              // Add empty payments array to prevent errors
              payments: [],
            }) as any,
        ) || [];

      return {
        data: formattedTransactions,
        hasMore: false,
        totalRecords: formattedTransactions.length,
        error: undefined,
      };
    } catch (dbError) {
      console.error('Database fallback error:', dbError);
      return getErrorMessage();
    }
  }
}
