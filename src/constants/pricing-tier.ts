export interface Tier {
  name: string;
  id: 'starter' | 'pro';
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
  {
    name: 'Starter',
    id: 'starter',
    icon: '/assets/icons/price-tiers/free-icon.svg',
    description: 'Perfect for individuals who want to detect AI-generated content in their social media feeds',
    features: ['500 posts scanned per month', 'Real-time AI detection badges', 'Basic analytics dashboard'],
    featured: false,
    priceId: {
      month: process.env.NEXT_PUBLIC_PRICE_ID_STARTER_MONTHLY ?? '',
      year: process.env.NEXT_PUBLIC_PRICE_ID_STARTER_YEARLY ?? '',
    },
  },
  {
    name: 'Pro',
    id: 'pro',
    icon: '/assets/icons/price-tiers/basic-icon.svg',
    description: 'For power users and teams who need unlimited comprehensive content analysis',
    features: [
      'Unlimited posts scanned',
      'Priority customer support',
      'Advanced analytics dashboard',
      'Everything in Starter',
    ],
    featured: true,
    priceId: {
      month: process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY ?? '',
      year: process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY ?? '',
    },
  },
];
