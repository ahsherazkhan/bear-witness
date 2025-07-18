'use client';

import React from 'react';
import Icon from '../../../ui/AppIcon';

const InfoSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Enable Bear Witness extension from chrome store',
      description:
        'Simply search for Bear Witness on chrome store and install the extension. We support all major formats including social media posts',
      icon: 'Upload',
      features: ['Bulk processing', 'API integration', 'Real-time analysis'],
    },
    {
      number: '02',
      title: 'AI Analysis Engine',
      description:
        'Our proprietary AI engine analyzes your content using advanced machine learning algorithms trained on 50+ AI models to detect patterns and authenticity markers.',
      icon: 'Cpu',
      features: ['50+ AI models', 'Pattern recognition', 'Linguistic analysis', 'Behavioral detection'],
    },
    {
      number: '03',
      title: 'Instant Results',
      description:
        'Get comprehensive results in under 2 seconds with detailed confidence scores, highlighted suspicious sections, and actionable insights.',
      icon: 'Zap',
      features: ['Sub-2 second results', 'Confidence scoring', 'Detailed reports', 'Actionable insights'],
    },
  ];

  const keyFeatures = [
    {
      icon: 'Shield',
      title: 'Advanced Detection',
      description: '99.5% accuracy rate verified by independent audits',
    },
    {
      icon: 'Globe',
      title: 'Universal Coverage',
      description: 'Works across all major platforms and content types',
    },
    {
      icon: 'Zap',
      title: 'Lightning Fast',
      description: 'Results delivered in under 2 seconds consistently',
    },
    {
      icon: 'Lock',
      title: 'Secure & Private',
      description: 'Enterprise-grade security with zero data retention',
    },
    {
      icon: 'BarChart3',
      title: 'Detailed Analytics',
      description: 'Comprehensive reporting and trend analysis',
    },
    {
      icon: 'Users',
      title: 'Team Collaboration',
      description: 'Multi-user access with role-based permissions',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">How Bear Witness AI Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced AI detection system analyzes content in three simple steps, delivering industry-leading
            accuracy in seconds.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl font-bold text-gray-300">{step.number}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-lg flex items-center justify-center">
                    <Icon name={step.icon} size={24} color="#ffffff" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-black mb-4">{step.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>

                {/* Features */}
                <div className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 transform -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Key Features Grid */}
        {/* <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-12 border border-gray-200">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
              Why Choose Bear Witness AI?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed to protect your brand and maintain content authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <Icon name={feature.icon} size={20} color="#000000" />
                </div>
                <h4 className="font-semibold text-black mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Protect Your Content?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of brands already using Bear Witness AI to maintain content authenticity and protect their
              digital reputation.
            </p>
            <button
              onClick={() => {
                const element = document.getElementById('trial-signup');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <Icon name="ArrowRight" size={16} color="#000000" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
