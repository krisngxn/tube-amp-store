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
      // Provide __dirname polyfill for server-side CommonJS packages
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify(dir),
        })
      );
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
