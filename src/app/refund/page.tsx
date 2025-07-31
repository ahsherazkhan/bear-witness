'use client';

import React from 'react';

export default function RefundPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>

      <p className="text-sm text-gray-500 mb-8">Last updated: July 30, 2025</p>

      <p className="mb-4">
        We offer a <strong>14-day refund window</strong> on all purchases made through our site.
      </p>

      <p className="mb-4">
        If you’re not happy with something or it’s not working the way it should, email us within 14 days of buying.
        We’ll take a look and process a refund if it makes sense.
      </p>

      <p className="mb-4">
        Send your request to{' '}
        <a href="mailto:talktobearwitness@gmail.com" className="text-blue-600 hover:underline">
          talktobearwitness@gmail.com
        </a>{' '}
        with your order info.
      </p>

      <p className="mb-4">
        After 14 days, we normally don’t offer refunds unless there’s a technical problem we can’t fix.
      </p>

      <p className="mb-4">This policy applies to all digital products sold directly through our site.</p>

      <p className="mt-8 font-semibold">Bear Witness</p>
    </main>
  );
}
