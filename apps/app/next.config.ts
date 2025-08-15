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
  
  // Webpack optimizations - Enhanced for 256GB RAM & 32 threads
  webpack: (config, { isServer }) => {
    // Parallel processing with all 32 threads
    config.parallelism = 32;
    
    // Massive cache for fast rebuilds (using available RAM)
    config.cache = {
      type: 'filesystem',
      allowCollectingMemory: true,
      memoryCacheSize: 4 * 1024 * 1024 * 1024, // 4GB memory cache
      compression: false, // No compression (we have 256GB RAM)
      hashAlgorithm: 'xxhash64', // Faster hashing
      idleTimeout: 60000,
      idleTimeoutForInitialStore: 0,
      maxMemoryGenerations: 1
    };
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      splitChunks: {
        chunks: "all",
        maxAsyncRequests: 32,
        maxInitialRequests: 32,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            chunks: "all",
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module: any) {
              return module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier());
            },
            name(module: any) {
              const hash = require("crypto")
                .createHash("sha1")
                .update(module.identifier())
                .digest("hex");
              return hash.substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module: any, chunks: any) {
              return require("crypto")
                .createHash("sha1")
                .update(chunks.reduce((acc: string, chunk: any) => acc + chunk.name, ""))
                .digest("hex") + (isServer ? "-server" : "-client");
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    // Tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;
    
    return config;
  },
  
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
