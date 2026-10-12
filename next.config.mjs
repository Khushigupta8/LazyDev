/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
