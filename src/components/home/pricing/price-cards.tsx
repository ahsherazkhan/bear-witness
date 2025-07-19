import { PricingTier } from '@/constants/pricing-tier';
import { IBillingFrequency } from '@/constants/billing-frequency';
import { FeaturesList } from '@/components/home/pricing/features-list';
import { PriceAmount } from '@/components/home/pricing/price-amount';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PriceTitle } from '@/components/home/pricing/price-title';
import { Separator } from '@/components/ui/separator';
import { FeaturedCardGradient } from '@/components/gradients/featured-card-gradient';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';

interface Props {
  loading: boolean;
  frequency: IBillingFrequency;
  priceMap: Record<string, string>;
}

export function PriceCards({ loading, frequency, priceMap }: Props) {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  const handleGetStarted = (priceId: string) => {
    if (!user) {
      window.location.href = '/login';
    } else {
      window.location.href = `/checkout/${priceId}`;
    }
  };

  return (
    <div className=" isolate mx-auto flex flex-col lg:flex-row gap-8 lg:justify-center lg:items-start lg:max-w-6xl">
      {PricingTier.map((tier) => (
        <div key={tier.id} className={cn('rounded-lg border-2 border-red-900 overflow-hidden w-full max-w-sm')}>
          <div className={cn('flex gap-5 flex-col rounded-lg rounded-b-none')}>
            <PriceTitle tier={tier} />
            <PriceAmount
              loading={loading}
              tier={tier}
              priceMap={priceMap}
              value={frequency.value}
              priceSuffix={frequency.priceSuffix}
            />
            <div className={'px-8'}>
              <Separator className={'bg-border text-black'} />
            </div>
            <div className={'px-8 text-[16px] leading-[24px] text-black'}>{tier.description}</div>
          </div>
          <div className={'px-8 mt-8 text-black'}>
            <Button
              className={'w-full text-black bg-gray-200 hover:bg-gray-300'}
              variant={'secondary'}
              onClick={() => handleGetStarted(tier.priceId[frequency.value])}
            >
              Get started
            </Button>
          </div>
          <FeaturesList tier={tier} />
        </div>
      ))}
    </div>
  );
}
