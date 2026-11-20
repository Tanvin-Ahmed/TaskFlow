/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables src/instrumentation.ts (IPv4-first DNS for Appwrite on Vercel).
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
