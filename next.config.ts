import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  compiler: {
    styledComponents: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config, { isServer, dir }) => {
    // Fix for CommonJS packages that use __dirname in ESM context
    if (isServer) {
      const webpack = require('webpack');
      
      // Provide __dirname polyfill
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify(dir),
        })
      );
      
      // Configure Node.js polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
