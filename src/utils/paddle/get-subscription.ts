'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { ErrorMessage, parseSDKResponse } from '@/utils/paddle/data-helpers';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { SubscriptionDetailResponse } from '@/lib/api.types';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/get-user';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function getSubscription(subscriptionId: string): Promise<SubscriptionDetailResponse> {
  try {
    const customerId = await getCustomerId();
    if (customerId) {
      const subscription = await getPaddleInstance().subscriptions.get(subscriptionId, {
        include: ['next_transaction', 'recurring_transaction_details'],
      });

      return { data: parseSDKResponse(subscription) };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log('Paddle API failed, falling back to database:', e);

    // Fallback to database
    try {
      const authClient = await createClient();
      const {
        data: { user },
      } = await authClient.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return { error: 'User not found' };
      }

      // Use service role to bypass RLS
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // Check if subscriptionId is a Paddle ID (starts with 'sub_') or a UUID
      let dbSubscriptionId = subscriptionId;
      if (subscriptionId.startsWith('sub_')) {
        // It's a Paddle subscription ID, we need to find the database subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('paddle_subscription_id', subscriptionId)
          .single();

        if (subscription) {
          console.log('Found database subscription for Paddle ID:', subscriptionId);
          dbSubscriptionId = subscription.id;
        } else {
          console.log('No database subscription found for Paddle ID:', subscriptionId);
          return { error: 'Subscription not found' };
        }
      }

      // Get subscription from database
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', dbSubscriptionId)
        .single();

      if (error) {
        console.error('Database error:', error);
        return { error: error.message };
      }

      // Format subscription to match Paddle API response
      const formattedSubscription = {
        id: subscription.paddle_subscription_id,
        status: subscription.status,
        customerId: subscription.customer_id,
        currencyCode: 'USD',
        billingCycle: {
          frequency: 1,
          interval: subscription.billing_cycle,
        },
        startedAt: subscription.created_at,
        nextBilledAt: subscription.next_billing_date,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at,
        recurringTransactionDetails: {
          totals: {
            subtotal: (
              parseFloat(
                (() => {
                  const amountMap: { [key: string]: { [key: string]: string } } = {
                    'Free Plan': { monthly: '0.00', yearly: '0.00' },
                    'Starter Plan': { monthly: '29.00', yearly: '24.00' },
                    'Pro Plan': { monthly: '79.00', yearly: '99.00' },
                    'Unknown Plan': { monthly: '79.00', yearly: '99.00' },
                  };
                  return amountMap[subscription.plan_name]?.[subscription.billing_cycle] || '0.00';
                })(),
              ) * 100
            ).toString(), // Convert to cents
            tax: '0',
            total: (
              parseFloat(
                (() => {
                  const amountMap: { [key: string]: { [key: string]: string } } = {
                    'Free Plan': { monthly: '0.00', yearly: '0.00' },
                    'Starter Plan': { monthly: '29.00', yearly: '24.00' },
                    'Pro Plan': { monthly: '79.00', yearly: '99.00' },
                    'Unknown Plan': { monthly: '79.00', yearly: '99.00' },
                  };
                  return amountMap[subscription.plan_name]?.[subscription.billing_cycle] || '0.00';
                })(),
              ) * 100
            ).toString(),
          },
          lineItems: [
            {
              priceId: subscription.plan_price_id,
              product: {
                name: subscription.plan_name,
                description: subscription.plan_name,
                imageUrl: null,
              },
              quantity: 1,
              taxRate: '0',
              totals: {
                subtotal: (
                  parseFloat(
                    (() => {
                      const amountMap: { [key: string]: { [key: string]: string } } = {
                        'Free Plan': { monthly: '0.00', yearly: '0.00' },
                        'Starter Plan': { monthly: '29.00', yearly: '24.00' },
                        'Pro Plan': { monthly: '79.00', yearly: '99.00' },
                        'Unknown Plan': { monthly: '79.00', yearly: '99.00' },
                      };
                      return amountMap[subscription.plan_name]?.[subscription.billing_cycle] || '0.00';
                    })(),
                  ) * 100
                ).toString(),
                tax: '0',
                total: (
                  parseFloat(
                    (() => {
                      const amountMap: { [key: string]: { [key: string]: string } } = {
                        'Free Plan': { monthly: '0.00', yearly: '0.00' },
                        'Starter Plan': { monthly: '29.00', yearly: '24.00' },
                        'Pro Plan': { monthly: '79.00', yearly: '99.00' },
                        'Unknown Plan': { monthly: '79.00', yearly: '99.00' },
                      };
                      return amountMap[subscription.plan_name]?.[subscription.billing_cycle] || '0.00';
                    })(),
                  ) * 100
                ).toString(),
              },
            },
          ],
        },
        items: [
          {
            price: {
              id: subscription.plan_price_id,
              unitPrice: {
                amount: (() => {
                  const amountMap: { [key: string]: { [key: string]: string } } = {
                    'Free Plan': { monthly: '0.00', yearly: '0.00' },
                    'Starter Plan': { monthly: '29.00', yearly: '24.00' },
                    'Pro Plan': { monthly: '79.00', yearly: '99.00' },
                    'Unknown Plan': { monthly: '79.00', yearly: '99.00' },
                  };
                  return amountMap[subscription.plan_name]?.[subscription.billing_cycle] || '0.00';
                })(),
                currencyCode: 'USD',
              },
              product: {
                name: subscription.plan_name,
                description: subscription.plan_name,
                imageUrl: null,
              },
            },
            quantity: 1,
          },
        ],
      } as any;

      return {
        data: formattedSubscription,
        error: undefined,
      };
    } catch (dbError) {
      console.error('Database fallback error:', dbError);
      return { error: ErrorMessage };
    }
  }
  return { error: ErrorMessage };
}
