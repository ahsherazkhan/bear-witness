'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowRight, Target, Zap, Shield } from 'lucide-react';

const HeroSection = () => {
  const scrollToTrial = () => {
    const element = document.getElementById('trial-signup');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToInfo = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative flex items-center justify-center">
      {/* Gradient Overlay */}
      <div className=""></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Bear Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full blur-xl opacity-30"></div>
              <img
                src="/assets/logo-1752484296338.png"
                alt="Bear Witness AI"
                className="relative w-24 h-24 object-contain"
              />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
            Sick of Ai Content?
            <br />
            <span className="text-gray-600">We can bear the witness!!</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop fake content from wasting your time.
            <br />
            <span className="text-black font-semibold">99.5% accuracy in under 2 seconds.</span>
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="default"
              size="lg"
              onClick={scrollToTrial}
              className="font-semibold px-8 py-4 text-lg text-white bg-black hover:bg-red-900"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToInfo}
              className="border-red-900 text-red-900 hover:bg-red-900 hover:text-white font-semibold px-8 py-4 text-lg"
            >
              <ChevronDown className="mr-2 h-5 w-5" />
              Live Demo
            </Button>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-red-900" />
                </div>
              </div>
              <div className="text-2xl font-bold text-black mb-1">99.5%</div>
              <div className="text-gray-600 text-sm">Detection Accuracy</div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-red-900" />
                </div>
              </div>
              <div className="text-2xl font-bold text-black mb-1">&lt;2s</div>
              <div className="text-gray-600 text-sm">Analysis Speed</div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-red-900" />
                </div>
              </div>
              <div className="text-2xl font-bold text-black mb-1">1500+</div>
              <div className="text-gray-600 text-sm">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <ChevronDown className="h-6 w-6 text-red-900" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
