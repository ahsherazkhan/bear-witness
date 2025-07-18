'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { signup } from '@/app/signup/actions';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { CreditCard, BarChart3, ArrowRight, Shield, Clock } from 'lucide-react';

export function SignupForm({ isLandingPage }: { isLandingPage?: boolean }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSignup() {
    signup({ email, password }).then((data) => {
      if (data?.error) {
        toast({ description: 'Something went wrong. Please try again', variant: 'destructive' });
      }
    });
  }

  return (
    <div className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      {!isLandingPage && <Image src={'/assets/logo-1752484296338.png'} alt={'Bear Witness'} width={80} height={80} />}
      {!isLandingPage && (
        <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Create an account</div>
      )}
      <div className="bg-white rounded-lg p-8 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-black mb-2">Get Started</h3>
            <p className="text-gray-600">Create your account in seconds</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <Input
              type="text"
              name="fullName"
              placeholder="John Smith"
              value={formData.fullName}
              onChange={handleInputChange}
              className={errors.fullName ? 'border-red-500' : 'bg-white'}
              required
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
            <Input
              type="email"
              name="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'border-red-500' : 'bg-white'}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Input
              type="text"
              name="company"
              placeholder="Your Company"
              value={formData.company}
              onChange={handleInputChange}
              className={errors.company ? 'border-red-500' : 'bg-white'}
              required
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
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
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

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
      </div>
      {/* <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button formAction={() => handleSignup()} type={'submit'} variant={'secondary'} className={'w-full'}>
        Sign up
      </Button> */}
    </div>
  );
}
