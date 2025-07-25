import { Inter } from 'next/font/google';
import '../styles/globals.css';
import '../styles/layout.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import AuthHandler from '@/components/auth/auth-handler';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://paddle-billing.vercel.app'),
  title: 'Bear Witness',
  description:
    'Bear Witness AI is a powerful Chrome extension that instantly detects AI-generated content in your social media feeds. Using advanced machine learning with 99.5% accuracy, it helps you distinguish between authentic human posts and AI-generated noise.',
  icons: {
    icon: '/assets/logo-1752484296338.png',
    shortcut: '/assets/logo-1752484296338.png',
    apple: '/assets/logo-1752484296338.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={'min-h-full dark'}>
      <>
        <body
          className={inter.className}
          suppressHydrationWarning={true}
          style={{
            backgroundImage: 'url(/assets/background/whitebg.jpg)',
            backgroundSize: '1000px 100px',
            backgroundPosition: 'top',
            backgroundRepeat: 'repeat',
          }}
        >
          <AuthHandler />
          {children}
          <Toaster />
        </body>
      </>
    </html>
  );
}
