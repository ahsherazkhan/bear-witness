'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, Shield, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SignupForm = () => {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked =
      (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit>>>>>>>>>>>>>>>>>>>');
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      });

      console.log('data>>>>>>>>>>>>>>>>>>>', data);
      console.log('error>>>>>>>>>>>>>>>>>>>', error);

      if (error) {
        console.error('Signup error:', error);
        toast({
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (data.user) {
        setIsSuccess(true);
        toast({
          description:
            'Account created successfully! Please check your email and click the confirmation link to verify your account.',
          variant: 'default',
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Bear Witness!</h2>
        <p className="text-xl text-gray-600 mb-8">
          Your account has been created successfully. Check your email for verification.
        </p>
        <Button
          variant="default"
          size="lg"
          className="bg-black hover:bg-gray-800 text-white"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-black mb-2">Get Started</h3>
        <p className="text-gray-600">Create your account in seconds</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <Input
          type="text"
          name="username"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleInputChange}
          className={errors.username ? 'border-maroon-500' : 'bg-white'}
          required
        />
        {errors.username && <p className="text-maroon-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <Input
          type="email"
          name="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? 'border-maroon-500' : 'bg-white'}
          required
        />
        {errors.email && <p className="text-maroon-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <Input
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange}
          className={errors.password ? 'border-maroon-500' : 'bg-white'}
          required
        />
        {errors.password && <p className="text-maroon-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="agreeToTerms"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }));
            if (errors.agreeToTerms) {
              setErrors((prev) => ({ ...prev, agreeToTerms: '' }));
            }
          }}
          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
          I agree to the{' '}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </label>
      </div>
      {errors.agreeToTerms && <p className="text-maroon-500 text-sm">{errors.agreeToTerms}</p>}

      <Button
        type="submit"
        variant="default"
        size="lg"
        disabled={isSubmitting}
        className="w-full bg-black hover:bg-gray-800 text-white font-semibold"
      >
        {isSubmitting ? 'Creating Account...' : 'Start Free Trial'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <div className="text-center text-sm text-gray-600">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <Shield size={14} />
            <span>Secure signup</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>Instant access</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SignupForm;
