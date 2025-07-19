'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { SubscriptionResponse } from '@/lib/api.types';
import { getErrorMessage } from '@/utils/paddle/data-helpers';
import { createClient } from '@/utils/supabase/server';

export async function getSubscriptions(): Promise<SubscriptionResponse> {
  try {
    const customerId = await getCustomerId();

    if (customerId) {
      // First try to get from Paddle API
      try {
        const subscriptionCollection = getPaddleInstance().subscriptions.list({
          customerId: [customerId],
          perPage: 20,
        });
        const subscriptions = await subscriptionCollection.next();
        return {
          data: subscriptions,
          hasMore: subscriptionCollection.hasMore,
          totalRecords: subscriptionCollection.estimatedTotal,
        };
      } catch (apiError) {
        // Fallback to database if API fails
        const supabase = await createClient();
        const user = await supabase.auth.getUser();

        if (user.data.user?.email) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('id')
            .eq('email', user.data.user.email)
            .single();

          console.log('Database fallback - Customer data:', customerData);

          if (customerData) {
            const { data: dbSubscriptions } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('customer_id', customerData.id);

            console.log('Database fallback - Subscriptions found:', dbSubscriptions);

            if (dbSubscriptions && dbSubscriptions.length > 0) {
              // Convert database subscriptions to the format expected by the frontend
              const formattedSubscriptions = dbSubscriptions.map((sub) => {
                // Use dynamic amount calculation
                const amountMap: { [key: string]: { [key: string]: string } } = {
                  'Free Plan': { monthly: '0.00', yearly: '0.00' },
                  'Starter Plan': { monthly: '29.00', yearly: '24.00' },
                  'Pro Plan': { monthly: '79.00', yearly: '99.00' },
                  'Unknown Plan': { monthly: '79.00', yearly: '99.00' },
                };

                const amount = amountMap[sub.plan_name]?.[sub.billing_cycle] || '0.00';

                return {
                  id: sub.paddle_subscription_id,
                  status: sub.status,
                  customerId: customerId,
                  currencyCode: 'USD',
                  billingCycle: {
                    frequency: 1,
                    interval: sub.billing_cycle || 'month',
                  },
                  startedAt: sub.created_at,
                  nextBilledAt: sub.next_billing_date,
                  items: [
                    {
                      price: {
                        id: sub.plan_price_id,
                        unitPrice: {
                          amount: amount,
                          currencyCode: 'USD',
                        },
                        product: {
                          name: sub.plan_name,
                          description: sub.plan_name,
                          imageUrl: null,
                        },
                      },
                      quantity: 1,
                    },
                  ],
                };
              });

              return {
                data: formattedSubscriptions as any,
                hasMore: false,
                totalRecords: formattedSubscriptions.length,
              };
            }
          }
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return getErrorMessage();
  }
  return getErrorMessage();
}
