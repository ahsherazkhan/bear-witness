'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import '../../styles/login.css';
import { LoginCardGradient } from '@/components/gradients/login-card-gradient';
import { GhLoginButton } from '@/components/authentication/gh-login-button';
import { Input } from '@/components/ui/input';
import { CreditCard, BarChart3, ArrowRight, Shield, Clock } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
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

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
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
  return (
    <div>
      <div className={'flex flex-col'}>
        <div className={'px-6 md:px-16 py-20 gap-6 flex flex-col items-center justify-center'}>
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Image
                className="mx-auto"
                src={'/assets/logo-1752484296338.png'}
                alt={'Bear Witness'}
                width={80}
                height={80}
              />
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-black mb-2">Log in to your account</h3>
                <p className="text-gray-600">Log in to your account in seconds</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                <Input
                  type="text"
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
                  name="password"
                  placeholder="Passowrd"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'border-red-500' : 'bg-white'}
                  required
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold"
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* <GhLoginButton label={'Log in with GitHub'} /> */}
              <div
                className={
                  'mx-auto w-[343px] md:w-[488px] px-6 md:px-16 pt-0 py-8 gap-6 flex flex-col items-center justify-center rounded-b-lg'
                }
              >
                <div className={'text-center text-sm mt-4 font-medium text-black text-center'}>
                  Don’t have an account?{' '}
                  <a href={'/signup'} className={'text-black'}>
                    Sign up here
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
