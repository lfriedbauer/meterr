import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations for 100k+ users
  output: "standalone",
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
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: [
      "@meterr/ui",
      "lucide-react",
      "@supabase/supabase-js",
    ],
    serverComponentsExternalPackages: [
      "@supabase/supabase-js",
      "@prisma/client",
    ],
    // Incremental cache for better performance
    incrementalCacheHandlerPath: process.env.NODE_ENV === "production"
      ? require.resolve("./cache-handler.js")
      : undefined,
  },
  
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
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      splitChunks: {
        chunks: "all",
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
            test(module) {
              return module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier());
            },
            name(module) {
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
            name(module, chunks) {
              return require("crypto")
                .createHash("sha1")
                .update(chunks.reduce((acc, chunk) => acc + chunk.name, ""))
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
  
  // SWC minification for better performance
  swcMinify: true,
};

export default nextConfig;
