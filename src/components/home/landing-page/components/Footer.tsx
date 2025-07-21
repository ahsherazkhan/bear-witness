'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/assets/logo-1752484296338.png"
                alt="Bear Witness AI"
                className="w-8 h-8 object-contain filter brightness-0 invert"
              />
              <span className="text-lg font-bold">Bear Witness AI</span>
            </div>
            <p className="text-gray-400 text-sm">Protecting digital authenticity with AI-powered content detection.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              {/* <li>
                <a href="#" className="hover:text-white">
                  API
                </a>
              </li> */}
              <li>
                <a href="#" className="hover:text-white">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {/* <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li> */}
              <li>
                <a href="mailto:talktobearwitness@gmail.com" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="https://www.termsfeed.com/live/cd3de457-2b00-4e5f-8b9f-6d07c9d6c7a5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
              {/* <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">© 2025 Bear Witness AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
