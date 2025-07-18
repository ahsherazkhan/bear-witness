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
    'Bear Witness is a powerful team design collaboration app and image editor. With plans for businesses of all sizes, streamline your workflow with real-time collaboration, advanced editing tools, and seamless project management.',
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
