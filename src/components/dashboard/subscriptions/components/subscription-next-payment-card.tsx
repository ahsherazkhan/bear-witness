import { Card } from '@/components/ui/card';
import { Subscription, Transaction } from '@paddle/paddle-node-sdk';
import dayjs from 'dayjs';
import { parseMoney } from '@/utils/paddle/parse-money';
import { PaymentMethodSection } from '@/components/dashboard/subscriptions/components/payment-method-section';

interface Props {
  transactions?: Transaction[];
  subscription?: Subscription;
}

export function SubscriptionNextPaymentCard({ subscription, transactions }: Props) {
  if (!subscription?.nextBilledAt) {
    return null;
  }

  // Calculate the next payment amount based on subscription data
  let nextPaymentAmount = '0';

  // Try to get amount from nextTransaction first (Paddle API)
  if (subscription?.nextTransaction?.details?.totals?.total) {
    nextPaymentAmount = subscription.nextTransaction.details.totals.total;
  } else {
    // Fallback to subscription items for database data
    const subscriptionItem = subscription.items?.[0];
    if (subscriptionItem) {
      const unitPrice = parseFloat(subscriptionItem.price?.unitPrice?.amount || '0');
      const quantity = subscriptionItem.quantity || 1;
      nextPaymentAmount = (unitPrice * quantity * 100).toString(); // Convert to cents
    }
  }

  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6 @container'}>
      <div className={'flex gap-6 flex-col border-border border-b pb-6'}>
        <div className={'text-xl font-medium'}>Next payment</div>
        <div className={'flex gap-1 items-end @16xs:flex-wrap'}>
          <span className={'text-xl leading-5 font-medium text-primary'}>
            {parseMoney(nextPaymentAmount, subscription?.currencyCode)}
          </span>
          <span className={'text-base text-secondary leading-4'}>due</span>
          <span className={'ext-base leading-4 font-semibold text-primary'}>
            {dayjs(subscription?.nextBilledAt).format('MMM DD, YYYY')}
          </span>
        </div>
      </div>
      <PaymentMethodSection
        transactions={transactions}
        updatePaymentMethodUrl={subscription?.managementUrls?.updatePaymentMethod}
      />
    </Card>
  );
}
