/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.simpleicons.org', 'localhost', 'paddle-billing.vercel.app'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Disable static generation completely
  experimental: {
    // This prevents static generation of all pages
    workerThreads: false,
    cpus: 1,
  },
  // Force all pages to be server-side rendered
  generateStaticParams: async () => {
    return [];
  },
};

export default nextConfig;
