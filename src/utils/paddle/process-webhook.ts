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
      await supabase.from('webhook_events').upsert(
        {
          event_type: eventData.eventType,
          paddle_event_id: eventData.data.id,
          event_data: eventData,
          status: 'processed',
        },
        {
          onConflict: 'paddle_event_id',
        },
      );
    } catch (error) {
      // Don't throw here, just silently log the error
    }
  }

  private async findOrCreateCustomer(paddleCustomerId: string, webhookData: any): Promise<string> {
    const supabase = await createClient();

    // Try to find existing customer by paddle_customer_id
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('paddle_customer_id', paddleCustomerId)
      .single();

    if (!customerError && customerData) {
      return customerData.id;
    }

    // Try to get customer email from the webhook data
    let customerEmail: string | null = null;

    if (webhookData.customer && webhookData.customer.email) {
      customerEmail = webhookData.customer.email;
    } else if (webhookData.email) {
      customerEmail = webhookData.email;
    }

    // If not in webhook data, try to get from Paddle API
    if (!customerEmail) {
      try {
        const { getPaddleInstance } = await import('@/utils/paddle/get-paddle-instance');
        const paddle = getPaddleInstance();
        const customer = await paddle.customers.get(paddleCustomerId);
        customerEmail = customer.email;
      } catch (paddleError) {
        console.error('Error getting customer from Paddle API:', paddleError);
      }
    }

    if (customerEmail) {
      // Try to find existing customer by email
      const { data: existingCustomer, error: findError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (existingCustomer) {
        // Update existing customer with paddle_customer_id
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            paddle_customer_id: paddleCustomerId,
          })
          .eq('id', existingCustomer.id);

        if (updateError) {
          throw updateError;
        }

        return existingCustomer.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            paddle_customer_id: paddleCustomerId,
            email: customerEmail,
            ai_requests_remaining: 500, // Default value
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return newCustomer.id;
      }
    } else {
      // Create a placeholder customer if we can't determine the email
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          paddle_customer_id: paddleCustomerId,
          email: `unknown-${Date.now()}@placeholder.com`,
          name: 'Unknown Customer',
          ai_requests_remaining: 500,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return newCustomer.id;
    }
  }

  private async updateTransactionData(
    eventData: TransactionCreatedEvent | TransactionUpdatedEvent | TransactionCompletedEvent | TransactionPaidEvent,
  ) {
    const supabase = await createClient();

    // Try to find the amount in different possible locations using any type
    let amount = '0';
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
    const planName = this.getPlanNameFromPriceId(data.items?.[0]?.price?.id ?? '');
    const billingCycle = this.getBillingCycleFromPriceId(data.items?.[0]?.price?.id);
    const correctAmount = this.getAmountFromPlanAndBillingCycle(planName, billingCycle);

    // Use the correct amount if webhook amount doesn't match expected
    if (amount !== correctAmount && correctAmount !== '0.00') {
      amount = correctAmount;
    }

    // Get currency
    let currency = 'USD';
    if (data.currencyCode) {
      currency = data.currencyCode;
    } else if (data.currency) {
      currency = data.currency;
    }

    // Find or create customer
    if (!eventData.data.customerId) {
      throw new Error('Customer ID is required for transaction processing');
    }
    const customerId = await this.findOrCreateCustomer(eventData.data.customerId, data);

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
            .eq('customer_id', customerId)
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
      .upsert(
        {
          paddle_transaction_id: eventData.data.id,
          customer_id: customerId,
          subscription_id: subscriptionId,
          status: eventData.data.status,
          amount: amount,
          currency: currency,
          billing_period_start: eventData.data.billingPeriod?.startsAt
            ? new Date(eventData.data.billingPeriod.startsAt)
            : null,
          billing_period_end: eventData.data.billingPeriod?.endsAt
            ? new Date(eventData.data.billingPeriod.endsAt)
            : null,
        },
        {
          onConflict: 'paddle_transaction_id',
        },
      )
      .select();

    if (error) {
      throw error;
    }
  }

  private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
    const supabase = await createClient();

    // Find or create customer
    if (!eventData.data.customerId) {
      throw new Error('Customer ID is required for subscription processing');
    }
    const customerId = await this.findOrCreateCustomer(eventData.data.customerId, eventData.data);

    // Get plan name and billing cycle from price ID
    const priceId = eventData.data.items[0].price?.id ?? '';

    const planName = this.getPlanNameFromPriceId(priceId);
    const billingCycle = this.getBillingCycleFromPriceId(priceId);

    // Calculate AI requests based on plan and billing cycle
    const aiRequestsLimit = this.getAIRequestsLimit(planName, billingCycle);

    // Note: This will REPLACE the user's existing AI requests with the plan allocation
    // Users start with 500 requests by default, but when they subscribe to a plan,
    // their AI requests are replaced (not added to) the plan's allocation

    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          paddle_subscription_id: eventData.data.id,
          customer_id: customerId,
          status: eventData.data.status,
          plan_name: planName,
          plan_price_id: eventData.data.items[0].price?.id ?? '',
          billing_cycle: billingCycle,
          next_billing_date: eventData.data.nextBilledAt ? new Date(eventData.data.nextBilledAt) : null,
        },
        {
          onConflict: 'paddle_subscription_id',
        },
      )
      .select();

    if (error) {
      throw error;
    }

    // Update customer's AI requests remaining based on subscription
    // Replace the current value with the plan's allocation
    const { error: updateCustomerError } = await supabase
      .from('customers')
      .update({ ai_requests_remaining: aiRequestsLimit })
      .eq('id', customerId);

    if (updateCustomerError) {
      console.error('Error updating customer AI requests:', updateCustomerError);
      throw updateCustomerError;
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
        const { error: updateError } = await supabase.from('customers').upsert(
          {
            id: existingCustomer.id,
            paddle_customer_id: eventData.data.id,
            email: eventData.data.email,
          },
          {
            onConflict: 'paddle_customer_id',
          },
        );

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      // Customer doesn't exist, create new one
      const { error } = await supabase
        .from('customers')
        .upsert(
          {
            paddle_customer_id: eventData.data.id,
            email: eventData.data.email,
          },
          {
            onConflict: 'paddle_customer_id',
          },
        )
        .select();

      if (error) {
        throw error;
      }
    }
  }

  private getPlanNameFromPriceId(priceId: string): string {
    const planMap: { [key: string]: string } = {
      [process.env.NEXT_PUBLIC_PRICE_ID_STARTER_MONTHLY ?? '']: 'Starter Plan',
      [process.env.NEXT_PUBLIC_PRICE_ID_STARTER_YEARLY ?? '']: 'Starter Plan',
      [process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY ?? '']: 'Pro Plan',
      [process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY ?? '']: 'Pro Plan',
      pri_basic_monthly: 'Starter Plan',
      pri_basic_yearly: 'Starter Plan',
      pri_pro_monthly: 'Pro Plan',
      pri_pro_yearly: 'Pro Plan',
    };

    if (!priceId) return 'Unknown Plan';
    return planMap[priceId] || 'Unknown Plan';
  }

  private getBillingCycleFromPriceId(priceId?: string): string {
    if (!priceId) return 'monthly';

    const billingMap: { [key: string]: string } = {
      [process.env.NEXT_PUBLIC_PRICE_ID_STARTER_MONTHLY ?? '']: 'monthly',
      [process.env.NEXT_PUBLIC_PRICE_ID_STARTER_YEARLY ?? '']: 'yearly',
      [process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY ?? '']: 'monthly',
      [process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY ?? '']: 'yearly',
      pri_basic_monthly: 'monthly',
      pri_basic_yearly: 'yearly',
      pri_pro_monthly: 'monthly',
      pri_pro_yearly: 'yearly',
    };

    return billingMap[priceId] || 'monthly';
  }

  private getAmountFromPlanAndBillingCycle(planName: string, billingCycle: string): string {
    const amountMap: { [key: string]: { [key: string]: string } } = {
      'Free Plan': {
        monthly: '0.00',
        yearly: '0.00',
      },
      'Starter Plan': {
        monthly: '10.00',
        yearly: '99.00',
      },
      'Pro Plan': {
        monthly: '20.00',
        yearly: '199.00',
      },
    };

    return amountMap[planName]?.[billingCycle] || '0.00';
  }

  private getAIRequestsLimit(planName: string, billingCycle: string): number {
    const requestsMap: { [key: string]: { [key: string]: number } } = {
      'Starter Plan': {
        monthly: 1000,
        yearly: 1500,
      },
      'Pro Plan': {
        monthly: 2000,
        yearly: 2500,
      },
    };

    return requestsMap[planName]?.[billingCycle] || 500;
  }
}
