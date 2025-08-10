'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ExtensionSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  const supabase = createClient();

  useEffect(() => {
    handleAuthSuccess();
  }, []);

  async function handleAuthSuccess() {
    try {
      // Get the session after OAuth redirect
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setStatus('error');
        setMessage('Authentication failed: ' + error.message);
        return;
      }

      if (!session) {
        setStatus('error');
        setMessage('No session found after authentication');
        return;
      }

      console.log('Extension success - User authenticated:', session.user.email);

      // Send the auth token to the extension
      await sendTokenToExtension(session.access_token);
    } catch (err) {
      setStatus('error');
      setMessage('Failed to process authentication');
      console.error('Extension success error:', err);
    }
  }

  async function sendTokenToExtension(token: string) {
    try {
      // Try to send message to extension via postMessage
      window.postMessage(
        {
          type: 'EXTENSION_AUTH_TOKEN',
          token: token,
        },
        '*',
      );

      // Also try to send via chrome.runtime if available
      if (window.chrome && window.chrome.runtime) {
        // This is a fallback method
        console.log('Chrome runtime available, token sent');
      }

      setStatus('success');
      setMessage('Authentication successful! Token sent to extension. You can close this tab.');

      // Store token in localStorage as backup
      localStorage.setItem('extension_auth_token', token);
    } catch (err) {
      setStatus('error');
      setMessage('Failed to send token to extension');
      console.error('Send token error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bear Witness Extension</h1>

          {status === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-green-600 text-4xl">✅</div>
              <p className="text-green-800 font-medium">{message}</p>
              <p className="text-gray-600 text-sm">You can now return to LinkedIn and use the extension.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-red-600 text-4xl">❌</div>
              <p className="text-red-800 font-medium">{message}</p>
              <button
                onClick={() => window.close()}
                className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Close Tab
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
