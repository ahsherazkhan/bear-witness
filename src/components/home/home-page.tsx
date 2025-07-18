'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUserInfo } from '@/hooks/useUserInfo';
import '../../styles/home-page.css';
import Header from '@/components/home/header/header';
import { Pricing } from '@/components/home/pricing/pricing';
import { HomePageBackground } from '@/components/gradients/home-page-background';
import { Footer } from '@/components/home/footer/footer';

// Import landing page components
import HeroSection from '@/components/home/landing-page/components/HeroSection';
import ProblemSection from '@/components/home/landing-page/components/ProblemSection';
import InfoSection from '@/components/home/landing-page/components/InfoSection';
import SolutionDemo from '@/components/home/landing-page/components/SolutionDemo';
import LandingFooter from '@/components/home/landing-page/components/Footer';
import WhyStatsSection from '@/components/home/landing-page/components/WhyStatsSection';
import StatsSection from '@/components/home/landing-page/components/StatsSection';
import TestimonialsSection from '@/components/home/landing-page/components/TestimonialsSection';
import PricingSection from '@/components/home/landing-page/components/PricingSection';
import TrialSignupSection from '@/components/home/landing-page/components/TrialSignupSection';

export function HomePage() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);
  const [country, setCountry] = useState('US');

  return (
    <>
      <div>
        <HomePageBackground />
        <Header />
        {/* Landing Page Components */}
        <HeroSection />
        {/* <ProblemSection /> */}
        <WhyStatsSection />
        <InfoSection />
        <StatsSection />
        <TestimonialsSection />
        {/* <PricingSection /> */}
        {/* <SolutionDemo /> */}

        {/* Original Pricing Section */}
        <Pricing country={country} />
        <TrialSignupSection />

        {/* Landing Page Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
