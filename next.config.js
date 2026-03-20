/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gavyqwobyhwqbwsddwlw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Configuração para páginas que precisam ser dinâmicas
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 