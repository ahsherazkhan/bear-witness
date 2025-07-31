'use client';

import React from 'react';

export default function RefundPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>

      <p className="text-sm text-gray-500 mb-8">Last updated: July 30, 2025</p>

      <p className="mb-4">
        Thank you for purchasing the <strong>Bear Witness</strong> browser extension.
      </p>

      <p className="mb-4">
        Please note that we do <strong>not offer refunds</strong> for digital products, including our extension. Once
        access is granted, the sale is final.
      </p>

      <p className="mb-4">We encourage users to review our product features and website carefully before purchasing.</p>

      <p className="mb-4">
        If you experience any technical issues, please contact us at{' '}
        <a href="mailto:talktobearwitness@gmail.com" className="text-blue-600 hover:underline">
          talktobearwitness@gmail.com
        </a>
        , and we’ll do our best to help.
      </p>

      <p className="mt-8 font-semibold">Bear Witness</p>
    </main>
  );
}
