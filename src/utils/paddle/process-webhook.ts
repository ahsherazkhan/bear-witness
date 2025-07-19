import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionCompletedEvent,
  TransactionPaidEvent,
} from '@paddle/paddle-node-sdk';
import { createClient } from '@/utils/supabase/server-internal';

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    // Log webhook event to database
    await this.logWebhookEvent(eventData);

    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
      case EventName.TransactionCreated:
      case EventName.TransactionUpdated:
      case EventName.TransactionCompleted:
      case EventName.TransactionPaid:
        await this.updateTransactionData(eventData);
        break;
    }
  }

  private async logWebhookEvent(eventData: EventEntity) {
    const supabase = await createClient();

    try {
      await supabase.from('webhook_events').insert({
        event_type: eventData.eventType,
        paddle_event_id: eventData.data.id,
        event_data: eventData,
        status: 'processed',
      });
    } catch (error) {
      // Don't throw here, just silently log the error
    }
  }

  private async updateTransactionData(
    eventData: TransactionCreatedEvent | TransactionUpdatedEvent | TransactionCompletedEvent | TransactionPaidEvent,
  ) {
    const supabase = await createClient();

    // Try to find the amount in different possible locations using any type
    let amount = '0';
    let currency = 'USD';

    const data = eventData.data as any;

    // Check different possible locations for amount based on Paddle webhook structure
    if (data.details?.totals?.total) {
      // Convert from cents to dollars
      amount = (parseFloat(data.details.totals.total) / 100).toString();
    } else if (data.details?.totals?.grandTotal) {
      // Convert from cents to dollars
      amount = (parseFloat(data.details.totals.grandTotal) / 100).toString();
    } else if (data.details?.totals?.subtotal) {
      // Convert from cents to dollars
      amount = (parseFloat(data.details.totals.subtotal) / 100).toString();
    } else if (data.amount) {
      // If already in dollars
      amount = data.amount;
    } else if (data.totalAmount) {
      amount = data.totalAmount;
    } else if (data.details?.amount) {
      amount = data.details.amount;
    } else if (data.lineItems && data.lineItems.length > 0) {
      // Sum up line items
      amount = data.lineItems
        .reduce((sum: number, item: any) => {
          const unitAmount = parseFloat(item.unitAmount || item.price?.unitPrice?.amount || '0');
          const quantity = parseInt(item.quantity || '1');
          return sum + unitAmount * quantity;
        }, 0)
        .toString();
    }

    // If we still don't have a valid amount, try to get it from the subscription
    if (amount === '0' && eventData.data.subscriptionId) {
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('plan_name, billing_cycle')
        .eq('paddle_subscription_id', eventData.data.subscriptionId)
        .single();

      if (subscriptionData) {
        amount = this.getAmountFromPlanAndBillingCycle(subscriptionData.plan_name, subscriptionData.billing_cycle);
      }
    }

    // IMPORTANT: The webhook amount might be wrong if Paddle price is misconfigured
    // Always use our calculated amount based on plan and billing cycle
    const planName = this.getPlanNameFromPriceId(data.items?.[0]?.price?.id);
    const billingCycle = this.getBillingCycleFromPriceId(data.items?.[0]?.price?.id);
    const correctAmount = this.getAmountFromPlanAndBillingCycle(planName, billingCycle);

    // Use the correct amount if webhook amount doesn't match expected
    if (amount !== correctAmount && correctAmount !== '0.00') {
      amount = correctAmount;
    }

    // Get currency
    if (data.currencyCode) {
      currency = data.currencyCode;
    } else if (data.currency) {
      currency = data.currency;
    }

    // Find customer by paddle_customer_id
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('paddle_customer_id', eventData.data.customerId)
      .single();

    if (customerError || !customerData) {
      throw new Error('Customer not found for transaction');
    }

    // Find subscription if this transaction is related to a subscription
    let subscriptionId = null;
    if (eventData.data.subscriptionId) {
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('paddle_subscription_id', eventData.data.subscriptionId)
        .single();

      subscriptionId = subscriptionData?.id || null;
    } else {
      // Try to find subscription by matching the transaction ID
      // This happens when transaction is created before subscription
      if (eventData.data.id) {
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('paddle_subscription_id', eventData.data.id)
          .single();

        if (!subscriptionData) {
          // Try to find by customer and recent creation
          const { data: recentSubscriptions } = await supabase
            .from('subscriptions')
            .select('id, created_at')
            .eq('customer_id', customerData.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (recentSubscriptions && recentSubscriptions.length > 0) {
            subscriptionId = recentSubscriptions[0].id;
          }
        } else {
          subscriptionId = subscriptionData.id;
        }
      }
    }

    const { error } = await supabase
      .from('transactions')
      .upsert({
        paddle_transaction_id: eventData.data.id,
        customer_id: customerData.id,
        subscription_id: subscriptionId,
        status: eventData.data.status,
        amount: amount,
        currency: currency,
        billing_period_start: eventData.data.billingPeriod?.startsAt
          ? new Date(eventData.data.billingPeriod.startsAt)
          : null,
        billing_period_end: eventData.data.billingPeriod?.endsAt ? new Date(eventData.data.billingPeriod.endsAt) : null,
      })
      .select();

    if (error) {
      throw error;
    }
  }

  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
    const supabase = await createClient();

    // First, we need to find the customer by paddle_customer_id
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('paddle_customer_id', eventData.data.customerId)
      .single();

    let customerId: string;

    if (customerError || !customerData) {
      // The customer might exist but not have a paddle_customer_id yet
      // We need to get the customer email from Paddle to find our customer record
      // For now, let's try to find any customer that might match
      const { data: allCustomers, error: allCustomersError } = await supabase
        .from('customers')
        .select('id, email, paddle_customer_id')
        .is('paddle_customer_id', null);

      if (allCustomersError) {
        throw allCustomersError;
      }

      if (allCustomers && allCustomers.length > 0) {
        // For now, let's update the first customer without a paddle_customer_id
        // In a real scenario, you'd want to match by email or other criteria
        const customerToUpdate = allCustomers[0];

        const { error: updateError } = await supabase
          .from('customers')
          .update({ paddle_customer_id: eventData.data.customerId })
          .eq('id', customerToUpdate.id);

        if (updateError) {
          throw updateError;
        }

        customerId = customerToUpdate.id;
      } else {
        throw new Error('Customer not found. Please ensure customer is created first.');
      }
    } else {
      customerId = customerData.id;
    }

    // Get plan name and billing cycle from price ID
    const planName = this.getPlanNameFromPriceId(eventData.data.items[0].price?.id);
    const billingCycle = this.getBillingCycleFromPriceId(eventData.data.items[0].price?.id);

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        paddle_subscription_id: eventData.data.id,
        customer_id: customerId,
        status: eventData.data.status,
        plan_name: planName,
        plan_price_id: eventData.data.items[0].price?.id ?? '',
        billing_cycle: billingCycle,
        next_billing_date: eventData.data.nextBilledAt ? new Date(eventData.data.nextBilledAt) : null,
      })
      .select();

    if (error) {
      throw error;
    }
  }

  private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
    const supabase = await createClient();

    // Try to find existing customer by email first
    const { data: existingCustomer, error: findError } = await supabase
      .from('customers')
      .select('id, paddle_customer_id')
      .eq('email', eventData.data.email)
      .single();

    if (existingCustomer) {
      // Customer exists, update with paddle_customer_id if not set
      if (!existingCustomer.paddle_customer_id) {
        const { error: updateError } = await supabase
          .from('customers')
          .update({ paddle_customer_id: eventData.data.id })
          .eq('id', existingCustomer.id);

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      // Customer doesn't exist, create new one
      const { error } = await supabase
        .from('customers')
        .insert({
          paddle_customer_id: eventData.data.id,
          email: eventData.data.email,
        })
        .select();

      if (error) {
        throw error;
      }
    }
  }

  private getPlanNameFromPriceId(priceId?: string): string {
    if (!priceId) return 'Unknown Plan';

    // Comprehensive price ID mapping for all your plans
    const planMap: { [key: string]: string } = {
      // Starter Plans
      pri_01k0ap2vs9bd2bfeszm0p81tah: 'Starter Plan',
      pri_01k07xzzaw4npgpj5skkqnv1rx: 'Starter Plan',

      // Pro Plans
      pri_01k07y2z8efqd1hweq5h1kqrgw: 'Pro Plan',
      pri_01k0ap6q8sawvqzem669s1p04v: 'Pro Plan',

      // Generic mappings for common patterns
      pri_basic_monthly: 'Starter Plan',
      pri_basic_yearly: 'Starter Plan',
      pri_pro_monthly: 'Pro Plan',
      pri_pro_yearly: 'Pro Plan',

      // Add more mappings as needed
    };

    return planMap[priceId] || 'Unknown Plan';
  }

  private getBillingCycleFromPriceId(priceId?: string): string {
    if (!priceId) return 'monthly';

    // Comprehensive billing cycle mapping
    const billingMap: { [key: string]: string } = {
      // Starter Plans
      pri_01k0ap2vs9bd2bfeszm0p81tah: 'monthly', // Starter Monthly
      pri_01k07xzzaw4npgpj5skkqnv1rx: 'yearly', // Starter Yearly

      // Pro Plans
      pri_01k07y2z8efqd1hweq5h1kqrgw: 'monthly', // Pro Monthly
      pri_01k0ap6q8sawvqzem669s1p04v: 'yearly', // Pro Yearly

      // Generic mappings
      pri_basic_monthly: 'monthly',
      pri_basic_yearly: 'yearly',
      pri_pro_monthly: 'monthly',
      pri_pro_yearly: 'yearly',

      // Add more mappings as needed
    };

    return billingMap[priceId] || 'monthly';
  }

  private getAmountFromPlanAndBillingCycle(planName: string, billingCycle: string): string {
    // Dynamic amount calculation based on plan and billing cycle
    const amountMap: { [key: string]: { [key: string]: string } } = {
      'Free Plan': {
        monthly: '0.00',
        yearly: '0.00',
      },
      'Starter Plan': {
        monthly: '29.00',
        yearly: '24.00',
      },
      'Pro Plan': {
        monthly: '79.00',
        yearly: '99.00',
      },
      'Unknown Plan': {
        monthly: '79.00', // Default to Pro monthly
        yearly: '99.00', // Default to Pro yearly
      },
    };

    return amountMap[planName]?.[billingCycle] || '0.00';
  }
}
