'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import '../../styles/login.css';
import { LoginCardGradient } from '@/components/gradients/login-card-gradient';
import { GhLoginButton } from '@/components/authentication/gh-login-button';
import { Input } from '@/components/ui/input';
import { CreditCard, BarChart3, ArrowRight, Shield, Clock, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
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

    try {
      // Sign in user with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        let errorMessage = 'Invalid email or password. Please try again.';
        let showResendButton = false;

        if (error.message === 'Email not confirmed') {
          errorMessage = 'Please check your email and click the confirmation link to verify your account.';
          showResendButton = true;
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }

        toast({
          description: errorMessage,
          variant: 'destructive',
          className: 'text-black',
        });

        if (showResendButton) {
          // Show resend confirmation option
          setShowResendConfirmation(true);
        }
        return;
      }

      if (data.user) {
        toast({
          description: 'Login successful! Redirecting to dashboard...',
          variant: 'default',
          className: 'text-black',
        });

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
        className: 'text-black',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      toast({
        description: 'Please enter your email address.',
        variant: 'destructive',
        className: 'text-black',
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      toast({
        description: 'Please enter a valid email address.',
        variant: 'destructive',
        className: 'text-black',
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          description: error.message || 'Failed to send reset email. Please try again.',
          variant: 'destructive',
          className: 'text-black',
        });
        return;
      }

      setResetEmailSent(true);
      toast({
        description: 'Password reset email sent! Check your inbox.',
        variant: 'default',
        className: 'text-black',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
        className: 'text-black',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setResetEmailSent(false);
  };

  const handleResendConfirmation = async () => {
    if (!formData.email.trim()) {
      toast({
        description: 'Please enter your email address first.',
        variant: 'destructive',
        className: 'text-black',
      });
      return;
    }

    setIsResendingConfirmation(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) {
        console.error('Resend error:', error);
        toast({
          description: error.message || 'Failed to resend confirmation email. Please try again.',
          variant: 'destructive',
          className: 'text-black',
        });
        return;
      }

      toast({
        description: 'Confirmation email sent! Check your inbox.',
        variant: 'default',
        className: 'text-white',
      });
      setShowResendConfirmation(false);
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
        className: 'text-black',
      });
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-black">
        <div className={'flex flex-col'}>
          <div className={'px-6 md:px-16 py-20 gap-6 flex flex-col items-center justify-center'}>
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              {!resetEmailSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <Image
                    className="mx-auto"
                    src={'/assets/logo-1752484296338.png'}
                    alt={'Bear Witness'}
                    width={80}
                    height={80}
                  />
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-black mb-2">Forgot Password</h3>
                    <p className="text-gray-600">Enter your email to receive a reset link</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="bg-white"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    disabled={isResettingPassword}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold"
                  >
                    {isResettingPassword ? 'Sending...' : 'Send Reset Link'}
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleBackToLogin}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold"
                  >
                    Back to Login
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <Image
                    className="mx-auto"
                    src={'/assets/logo-1752484296338.png'}
                    alt={'Bear Witness'}
                    width={80}
                    height={80}
                  />
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">Check Your Email</h3>
                    <p className="text-gray-600">
                      We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleBackToLogin}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-black font-semibold"
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
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
                <p className="text-gray-600">Welcome back! Please enter your details</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-red-900' : 'bg-white'}
                  required
                />
                {errors.email && <p className="text-black text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'border-red-900' : 'bg-white'}
                  required
                />
                {errors.password && <p className="text-black text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-black hover:underline"
                >
                  Forgot password?
                </button>
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

              {showResendConfirmation && (
                <div className="bg-black border border-black rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm font-medium text-white">Email not verified</span>
                  </div>
                  <p className="text-sm text-black mb-3">
                    Please check your email and click the confirmation link to verify your account.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={isResendingConfirmation}
                    className="w-full bg-white border-black text-black hover:bg-black"
                  >
                    {isResendingConfirmation ? 'Sending...' : 'Resend confirmation email'}
                  </Button>
                </div>
              )}
              {/* <GhLoginButton label={'Log in with GitHub'} /> */}
              <div
                className={
                  'mx-auto w-[343px] md:w-[488px] px-6 md:px-16 pt-0 py-8 gap-6 flex flex-col items-center justify-center rounded-b-lg'
                }
              >
                <div className={'text-center text-sm mt-4 font-medium text-black text-center'}>
                  Don't have an account?{' '}
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
