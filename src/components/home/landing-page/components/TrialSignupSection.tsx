'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, BarChart3, CheckCircle, ExternalLink, ArrowRight, Shield, Clock } from 'lucide-react';
import { SignupForm } from '@/components/authentication/sign-up-form';

const TrialSignupSection = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const benefits = [
    {
      icon: CreditCard,
      title: 'No Credit Card Required',
      description: 'Start immediately',
    },
    {
      icon: BarChart3,
      title: '500 posts per month for free',
      description: 'Test with real content',
    },
  ];

  if (isSuccess) {
    return (
      <section id="trial-signup" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-black mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Bear Witness!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your account has been created successfully. Check your email for next steps.
            </p>
            <Button onClick={() => setIsSuccess(false)} className="bg-black hover:bg-gray-800 text-white">
              Back to Signup
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="trial-signup" className="py-20 bg-gradient-to-b from-white to-gray-100">
      <hr className="border-gray-200" />
      <div className="max-w-6xl mx-auto px-4 mt-9">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Try Bear Witness for free</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of users making their feeds more authentic. No credit card needed start detecting AI content
            instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Bear Witness?</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Credit Card Required</h4>
                    <p className="text-gray-600">Start immediately</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Scan 500 posts/month for free</h4>
                    <p className="text-gray-600">Test with real content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="flex justify-center">
            <SignupForm isLandingPage={true} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrialSignupSection;
