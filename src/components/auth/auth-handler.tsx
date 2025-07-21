'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthHandler() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleHashParams = async () => {
      // Check if we have hash parameters (email confirmation)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('type');

        if (accessToken && refreshToken && tokenType === 'signup') {
          try {
            // Set the session using the tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              // Clear the hash from URL
              window.history.replaceState({}, document.title, window.location.pathname);

              // Redirect to dashboard
              router.push('/dashboard/subscriptions');
            } else {
              console.error('Error setting session:', error);
              router.push('/login');
            }
          } catch (error) {
            console.error('Error handling auth tokens:', error);
            router.push('/login');
          }
        }
      }
    };

    handleHashParams();
  }, [supabase, router]);

  return null;
}
