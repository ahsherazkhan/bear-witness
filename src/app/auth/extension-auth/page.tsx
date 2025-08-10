'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ExtensionAuthPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setError('Authentication error: ' + error.message);
        return;
      }

      if (session) {
        setIsAuthenticated(true);
        setAuthToken(session.access_token);
        console.log('Extension auth - User authenticated:', session.user.email);
      } else {
        setError('Please log in to use the extension');
      }
    } catch (err) {
      setError('Failed to check authentication status');
      console.error('Extension auth error:', err);
    }
  }

  async function handleSignIn() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/extension-success`,
        },
      });

      if (error) {
        setError('Sign in failed: ' + error.message);
      }
    } catch (err) {
      setError('Sign in failed');
      console.error('Sign in error:', err);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError('Sign out failed: ' + error.message);
      } else {
        setIsAuthenticated(false);
        setAuthToken(null);
      }
    } catch (err) {
      setError('Sign out failed');
      console.error('Sign out error:', err);
    }
  }

  async function sendTokenToExtension() {
    if (!authToken) {
      setError('No auth token available');
      return;
    }

    try {
      // Send message to extension
      if (window.chrome && window.chrome.runtime) {
        // This will be handled by the extension's content script
        window.postMessage(
          {
            type: 'EXTENSION_AUTH_TOKEN',
            token: authToken,
          },
          '*',
        );

        setError('Auth token sent to extension! You can close this tab.');
      } else {
        setError('Extension not detected');
      }
    } catch (err) {
      setError('Failed to send token to extension');
      console.error('Send token error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bear Witness Extension</h1>
          <p className="text-gray-600">Authenticate to use the extension</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">Please sign in to use the Bear Witness extension</p>
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In with Google
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">✅ Authenticated successfully!</p>
            </div>

            <button
              onClick={sendTokenToExtension}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Send Token to Extension
            </button>

            <button
              onClick={handleSignOut}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
