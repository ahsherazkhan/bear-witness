'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resetToken = searchParams.get('code');

  useEffect(() => {
    const validateResetToken = async () => {
      if (!resetToken) {
        toast({
          description: 'Invalid reset link. Please request a new password reset.',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      try {
        // For password reset, we don't need to verify the token upfront
        // The token will be validated when we try to update the password
        setIsValidToken(true);
      } catch (error) {
        console.error('Token validation error:', error);
        toast({
          description: 'Invalid or expired reset link. Please request a new password reset.',
          variant: 'destructive',
        });
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateResetToken();
  }, [resetToken, router, toast]);

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

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Use the reset token to update the password
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          description: error.message || 'Failed to update password. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setIsSuccess(true);
      toast({
        description: 'Password updated successfully!',
        variant: 'default',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // Will redirect to login
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg p-8 border border-gray-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">Password Updated!</h2>
            <p className="text-gray-600 mb-8">
              Your password has been successfully updated. Redirecting to dashboard...
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg p-8 border border-gray-200 max-w-md w-full mx-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Image
            className="mx-auto"
            src={'/assets/logo-1752484296338.png'}
            alt={'Bear Witness'}
            width={80}
            height={80}
          />
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-black mb-2">Reset Your Password</h3>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your new password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'border-maroon-500 pr-10' : 'bg-white pr-10'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-maroon-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'border-maroon-500 pr-10' : 'bg-white pr-10'}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-maroon-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold"
          >
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="text-center">
            <button type="button" onClick={() => router.push('/login')} className="text-sm text-black hover:underline">
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
