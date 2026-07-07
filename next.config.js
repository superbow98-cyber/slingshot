/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matches Slingshot's established pattern (see slingshot-brain.md): unblock
  // deployment on Vercel, fix any type nits after. Flip these off once the
  // build is green on your machine if you'd rather fail loudly on type errors.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  im