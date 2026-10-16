/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  turbopack: { root: import.meta.dirname },

  // 301s for URLs that changed, so old links and search results keep working.
  async redirects() {
    const moved = (source, destination) => ({ source, destination, statusCode: 301 });
    return [
      // Bundled photos were converted from JPG to WebP
      moved('/uploads/khushi-professional.jpg', '/uploads/khushi-professional.webp'),
      moved('/uploads/work-:slug.jpg', '/uploads/work-:slug.webp'),
      // Common alternative paths
      moved('/portfolio', '/work'),
      moved('/projects', '/work'),
      moved('/privacy', '/privacy-policy'),
      moved('/contact', '/#contact'),
      moved('/home', '/'),
      moved('/index.html', '/'),
    ];
  },
};

export default nextConfig;
