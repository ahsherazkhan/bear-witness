'use client';

import React, { useState } from 'react';
import Button from '../../../ui/Button';
import Icon from '../../../ui/AppIcon';
import { PricingTier } from '../../../../constants/pricing-tier';

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const pricingPlans = Object.values(PricingTier);

  const scrollToTrial = () => {
    const element = document.getElementById('trial-signup');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            All plans include our core AI detection technology. Choose the plan that fits your needs and start filtering
            your feed today.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br from-white to-gray-50 rounded-lg p-8 border-2 hover:shadow-lg transition-shadow ${
                plan.popular ? 'border-black shadow-lg' : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-black to-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-4">
                  {typeof plan.monthlyPrice === 'number' ? (
                    <>
                      <div className="text-4xl font-bold text-black">
                        ${billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                      </div>
                      <div className="text-gray-600">per month{billingCycle === 'yearly' && ', billed annually'}</div>
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-black">{plan.monthlyPrice}</div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <Icon name="Check" size={12} color="#ffffff" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? 'default' : 'outline'}
                fullWidth
                onClick={scrollToTrial}
                className={
                  plan.popular
                    ? 'bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white'
                    : 'border-black text-black hover:bg-gradient-to-r hover:from-black hover:to-gray-800 hover:text-white'
                }
                iconName="ArrowRight"
                iconPosition="right"
              >
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
