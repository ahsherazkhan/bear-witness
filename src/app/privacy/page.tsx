'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-black">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 font-medium">Last updated: July 31st, 2025</p>

      <p className="mb-6">
        This Privacy Policy describes how Bear Witness (“we”, “our”, or “us”) collects, uses, and protects your personal
        information when you visit{' '}
        <a href="https://bear-witnes.vercel.app" className="text-blue-600 underline">
          https://bear-witnes.vercel.app
        </a>{' '}
        or use the Bear Witness browser extension.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. What We Collect</h2>
      <ul className="list-disc list-inside mb-6 text-gray-800">
        <li>Your email address (via Google authentication)</li>
        <li>Usage data from the extension</li>
        <li>Payment-related data (handled by Paddle)</li>
        <li>Public content from your LinkedIn home feed (to analyze and detect AI-generated posts)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-6 text-gray-800">
        <li>Provide and improve the Bear Witness extension</li>
        <li>Authenticate you via Google Sign-In</li>
        <li>Process payments securely via Paddle</li>
        <li>Communicate with you (if necessary)</li>
        <li>
          Analyze public LinkedIn posts in your feed to detect AI-generated content (we do not store or share this data)
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-6 text-gray-800">
        <li>Provide and improve the Bear Witness extension</li>
        <li>Authenticate you via Google Sign-In</li>
        <li>Process payments securely via Paddle</li>
        <li>Communicate with you (if necessary)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Third-Party Services</h2>
      <p className="mb-2">
        <strong>Google:</strong> Used for authentication. Your account info is only used for login.
      </p>
      <p className="mb-6">
        <strong>Paddle:</strong> Our payment processor. We do not store any payment details directly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Cookies and Analytics</h2>
      <p className="mb-6">We may use basic cookies to maintain session or auth status.</p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Your Data Rights</h2>
      <p className="mb-6">
        You can request access to or deletion of your personal data by contacting:{' '}
        <a href="mailto:talktobearwitness@gmail.com" className="text-blue-600 underline">
          talktobearwitness@gmail.com
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Security</h2>
      <p className="mb-6">We use secure protocols (HTTPS) and industry-standard tools to protect your data.</p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Changes</h2>
      <p className="mb-6">
        We may update this policy from time to time. The latest version will always be posted on this page.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">8. Contact</h2>
      <p className="mb-1">If you have any privacy-related questions, reach out to us at:</p>
      <p className="mb-6">
        <a href="mailto:talktobearwitness@gmail.com" className="text-blue-600 underline">
          talktobearwitness@gmail.com
        </a>
      </p>

      <p className="font-bold">Bear Witness</p>
    </main>
  );
}
