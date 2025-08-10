import { createClient } from '@/utils/supabase/server-internal';

export async function getCustomerId() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (user.data.user?.email) {
    // First try to get paddle_customer_id directly
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('paddle_customer_id,email,id')
      .eq('email', user.data.user?.email)
      .single();

    if (customerData?.paddle_customer_id) {
      return customerData.paddle_customer_id as string;
    }

    if (customerData?.id) {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('paddle_subscription_id')
        .eq('customer_id', customerData.id)
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

    // If no customer record exists, create one
    if (customerError && customerError.code === 'PGRST116') {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          email: user.data.user.email,
          name: user.data.user.user_metadata?.full_name || user.data.user.email.split('@')[0],
          ai_requests_remaining: 500, // Default value
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating customer:', createError);
        return '';
      }

      // Return empty string since we don't have a paddle_customer_id yet
      return '';
    }
  }
  return '';
}
