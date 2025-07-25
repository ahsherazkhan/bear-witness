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
    priceId: { month: 'pri_01k0ap2vs9bd2bfeszm0p81tah', year: 'pri_01k07xzzaw4npgpj5skkqnv1rx' },
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
    priceId: { month: 'pri_01k07y2z8efqd1hweq5h1kqrgw', year: 'pri_01k0ap6q8sawvqzem669s1p04v' },
  },
];
