'use client';

import React, { useState, useEffect } from 'react';
import { Shield, BarChart3, Target, DollarSign, ChevronLeft, ChevronRight, Star, BadgeCheck } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  verified: boolean;
  linkedinUrl: string;
  useCase: string;
  resultMetric: string;
}

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Content Creator',
      company: 'Lifestyle Blogger',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: `Bear Witness AI has completely changed how I consume social media. I can instantly spot AI-generated posts and focus on authentic content. My feed is so much more meaningful now!`,
      rating: 5,
      verified: true,
      linkedinUrl: 'https://linkedin.com/in/sarahchen',
      useCase: 'Personal Feed Filtering',
      resultMetric: 'Reduced AI content by 85%',
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'Freelance Writer',
      company: 'Digital Content Creator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: `As a content writer, I need to stay authentic. Bear Witness helps me verify my own content and avoid AI-generated posts that could influence my writing style. The accuracy is incredible!`,
      rating: 5,
      verified: true,
      linkedinUrl: 'https://linkedin.com/in/marcusrodriguez',
      useCase: 'Content Authenticity',
      resultMetric: 'Verified 500+ posts monthly',
    },
    {
      id: 3,
      name: 'Emily Watson',
      role: 'Social Media Influencer',
      company: 'Fashion & Lifestyle',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: `I was getting frustrated with all the fake engagement and AI-generated comments. Bear Witness helps me identify real interactions and maintain genuine connections with my audience.`,
      rating: 5,
      verified: true,
      linkedinUrl: 'https://linkedin.com/in/emilywatson',
      useCase: 'Audience Engagement',
      resultMetric: 'Improved engagement quality by 60%',
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Tech Blogger',
      company: 'Independent Journalist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: `As a tech blogger, I need to stay ahead of AI trends. Bear Witness helps me understand what's real vs AI-generated, making my content more valuable to readers. Essential tool!`,
      rating: 5,
      verified: true,
      linkedinUrl: 'https://linkedin.com/in/davidkim',
      useCase: 'Content Research',
      resultMetric: 'Improved content accuracy by 90%',
    },
  ];

  const companyLogos = [
    { name: 'TechFlow', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop' },
    { name: 'Global Media', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop' },
    { name: 'StartupBoost', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop' },
    { name: 'Digital Pro', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop' },
    { name: 'BrandSafe', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop' },
    { name: 'MediaGuard', logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop' },
  ];

  const successMetrics = [
    { metric: '15,000+', label: 'Brands Protected', icon: Shield },
    { metric: '50M+', label: 'Posts Analyzed', icon: BarChart3 },
    { metric: '99.5%', label: 'Detection Accuracy', icon: Target },
    { metric: '$127M', label: 'Damage Prevented', icon: DollarSign },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">Trusted by Real Users</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From creators to brands, people rely on Bear Witness to spot AI content and keep their feeds real.
          </p>
        </div>

        {/* Success Metrics */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {successMetrics.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent size={24} className="text-red-900" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">{item.metric}</div>
                <div className="text-gray-600 text-sm">{item.label}</div>
              </div>
            );
          })}
        </div> */}

        {/* Main Testimonial Carousel */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm mb-16">
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-12 h-12 bg-gradient-to-br from-white to-gray-50 rounded-full border border-gray-200 shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-10"
            >
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-12 h-12 bg-gradient-to-br from-white to-gray-50 rounded-full border border-gray-200 shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-10"
            >
              <ChevronRight size={20} className="text-gray-500" />
            </button>

            {/* Testimonial Content */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={24} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-black leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
              </div>

              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-black">{testimonials[currentTestimonial].name}</h4>
                    {testimonials[currentTestimonial].verified && <BadgeCheck size={16} className="text-blue-500" />}
                  </div>
                  <p className="text-gray-600 text-sm">{testimonials[currentTestimonial].role}</p>
                  <p className="text-gray-800 text-sm font-medium">{testimonials[currentTestimonial].company}</p>
                </div>
              </div>

              {/* Use Case & Results */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Use Case</div>
                  <div className="font-semibold text-black">{testimonials[currentTestimonial].useCase}</div>
                </div>
                <div className="bg-gradient-to-br from-black to-gray-800 rounded-lg p-4 text-white">
                  <div className="text-sm text-gray-300 mb-1">Result</div>
                  <div className="font-semibold text-white">{testimonials[currentTestimonial].resultMetric}</div>
                </div>
              </div> */}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-gradient-to-r from-black to-gray-800'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Company Logos */}
        {/* <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600 mb-8">
            Trusted by leading organizations worldwide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-60">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-24 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center border border-gray-200">
                  <span className="text-xs font-medium text-gray-600">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default TestimonialsSection;
