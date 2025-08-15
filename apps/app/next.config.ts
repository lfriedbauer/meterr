import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations for 100k+ users
  // Note: 'output: standalone' removed due to Windows symlink permission issues
  // Vercel automatically optimizes the build without this setting
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    domains: ["meterr.ai", "cdn.meterr.ai"],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Caching strategies
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },
  
  // Experimental features for performance - Optimized for 32 CPU cores
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: [
      "@meterr/ui",
      "lucide-react",
    ],
    // Use all 32 CPU cores
    cpus: 32,
    workerThreads: true,
    // Note: parallelServerCompiles and parallelServerBuildTraces removed
    // as they require specific build worker configurations
    optimizeCss: true,
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
      mocha: { browser: 'mocha/browser-entry.js' }
    }
  },
  
  // Server-side package handling
  serverExternalPackages: [
    "@supabase/supabase-js",
    "@prisma/client",
  ],
  
  // Headers for security and caching
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ],
    },
  ],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_VERSION: process.env.npm_package_version || "0.1.0",
  },
  
  // Build time optimizations
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
