'use server';

import { getCustomerId } from '@/utils/paddle/get-customer-id';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { SubscriptionResponse } from '@/lib/api.types';
import { getErrorMessage } from '@/utils/paddle/data-helpers';
import { createClient } from '@/utils/supabase/server-internal';

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
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('id, email, paddle_customer_id')
            .eq('email', user.data.user.email)
            .single();

          if (customerData) {
            const { data: dbSubscriptions, error: subscriptionsError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('customer_id', customerData.id);

            if (dbSubscriptions && dbSubscriptions.length > 0) {
              // Convert database subscriptions to the format expected by the frontend
              const formattedSubscriptions = dbSubscriptions.map((sub) => {
                // Use dynamic amount calculation
                const amountMap: { [key: string]: { [key: string]: string } } = {
                  'Free Plan': { monthly: '0.00', yearly: '0.00' },
                  'Starter Plan': { monthly: '10.00', yearly: '99.00' },
                  'Pro Plan': { monthly: '20.00', yearly: '199.00' },
                  // 'Unknown Plan': { monthly: '20.00', yearly: '199.00' },
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
    } else {
      // If no customer ID, try to find subscriptions directly
      const supabase = await createClient();
      const user = await supabase.auth.getUser();

      if (user.data.user?.email) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('email', user.data.user.email)
          .single();

        if (customerData) {
          const { data: dbSubscriptions, error: subscriptionsError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('customer_id', customerData.id);

          if (dbSubscriptions && dbSubscriptions.length > 0) {
            // Convert database subscriptions to the format expected by the frontend
            const formattedSubscriptions = dbSubscriptions.map((sub) => {
              const amountMap: { [key: string]: { [key: string]: string } } = {
                'Free Plan': { monthly: '0.00', yearly: '0.00' },
                'Starter Plan': { monthly: '10.00', yearly: '99.00' },
                'Pro Plan': { monthly: '20.00', yearly: '199.00' },
              };

              const amount = amountMap[sub.plan_name]?.[sub.billing_cycle] || '0.00';

              return {
                id: sub.paddle_subscription_id,
                status: sub.status,
                customerId: 'unknown', // We don't have the paddle customer ID
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
        } else if (customerError && customerError.code === 'PGRST116') {
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.error('Error in getSubscriptions:', e);
    return getErrorMessage();
  }
  return getErrorMessage();
}
