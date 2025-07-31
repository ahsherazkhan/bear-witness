'use client';

import React from 'react';

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="text-sm text-gray-500 mb-8">Last updated: July 31, 2025</p>

      <p className="mb-4">
        By using the Bear Witness browser extension or visiting our website at{' '}
        <strong>https://bear-witnes.vercel.app</strong>, you agree to the following terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Use of the Extension</h2>
      <p className="mb-4">
        You may use the Bear Witness browser extension for personal, non-commercial purposes. You must not reverse
        engineer, resell, or misuse the product.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Account & Access</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your Google account. We reserve the right to suspend
        access if misuse or abuse is detected.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Payments</h2>
      <p className="mb-4">
        Payments are handled by <strong>Paddle</strong>. We do not store your payment information. All sales are final
        (see our Refund Policy).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Content Processing</h2>
      <p className="mb-4">
        Our extension accesses and analyzes your LinkedIn home feed to identify AI-generated content. We do not store
        this content on our servers.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Limitation of Liability</h2>
      <p className="mb-4">
        Bear Witness is provided “as is.” We are not liable for any damages or losses that may occur from using the
        extension or relying on its output.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Updates & Changes</h2>
      <p className="mb-4">
        We may update these terms occasionally. Continued use of the extension after changes means you accept the new
        terms.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Contact</h2>
      <p className="mb-4">
        If you have questions about these terms, contact us at{' '}
        <a href="mailto:talktobearwitness@gmail.com" className="text-blue-600 hover:underline">
          talktobearwitness@gmail.com
        </a>
        .
      </p>

      <p className="mt-8 font-semibold">Bear Witness</p>
    </main>
  );
}
