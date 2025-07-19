import { createClient } from '@/utils/supabase/server';

export async function getCustomerId() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (user.data.user?.email) {
    // First try to get paddle_customer_id directly
    const customersData = await supabase
      .from('customers')
      .select('paddle_customer_id,email,id')
      .eq('email', user.data.user?.email)
      .single();

    if (customersData?.data?.paddle_customer_id) {
      return customersData?.data?.paddle_customer_id as string;
    }

    if (customersData?.data?.id) {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('paddle_subscription_id')
        .eq('customer_id', customersData.data.id)
        .limit(1);

      if (subscriptions && subscriptions.length > 0) {
        // We have a subscription, so we need to get the customer ID from Paddle
        // For now, let's try to get it from the subscription details
        try {
          const { getPaddleInstance } = await import('@/utils/paddle/get-paddle-instance');
          const paddle = getPaddleInstance();
          const subscription = await paddle.subscriptions.get(subscriptions[0].paddle_subscription_id);
          return subscription.customerId;
        } catch (error) {
          console.error('Error getting customer ID from subscription:', error);
        }
      }
    }
  }
  return '';
}
