/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_MONAD_RPC_URL: process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet',
    NEXT_PUBLIC_STAKEHUB_CONTRACT: process.env.NEXT_PUBLIC_STAKEHUB_CONTRACT || '0x1234567890123456789012345678901234567890'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/:path*` // Proxy to Backend
      }
    ]
  },
  // IPFS için özel build konfigürasyonu
  assetPrefix: process.env.NEXT_PUBLIC_IPFS_BUILD === 'true' ? './' : undefined,
  trailingSlash: process.env.NEXT_PUBLIC_IPFS_BUILD === 'true',
};

module.exports = nextConfig;