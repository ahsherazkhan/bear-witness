'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function ExtensionSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f7f6f3]">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-10 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Image src="/assets/logo-1752484296338.png" alt="App Logo" width={72} height={72} className="rounded-lg" />
        </div>
        <h2 className="text-xl font-semibold text-[#37352f] mb-3">Authentication Successful</h2>
        <p className="text-[#6b6b6b] text-sm leading-relaxed">
          You can close this tab now.
          <br />
          Returning to the extension...
        </p>
      </div>
    </div>
  );
}
