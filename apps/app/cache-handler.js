/**
 * Custom Incremental Static Regeneration cache handler for Next.js
 * Optimized for 100k+ users with Redis caching
 */

const { IncrementalCache } = require('@neshca/cache-handler');
const createRedisCache = require('@neshca/cache-handler/redis-strings').default;
const { createClient } = require('redis');

// Initialize Redis client with connection pooling
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    connectTimeout: 10000,
  },
  // Connection pool for high concurrency
  isolationPoolOptions: {
    min: 10,
    max: 100,
  },
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.connect().catch(console.error);

// Configure cache with TTL and revalidation strategies
IncrementalCache.onCreation(async ({ buildId }) => {
  const redisCache = await createRedisCache({
    client,
    keyPrefix: `meterr:${buildId}:`,
    timeoutMs: 5000,
    revalidateTagQuerySize: 100,
  });

  return {
    cache: redisCache,
    // Stale-while-revalidate pattern for better UX
    useFileSystem: true,
    revalidatedTags: [],

    // Custom TTL based on route patterns
    ttl: {
      // Static pages cached for 1 hour
      '/': 3600,
      '/pricing': 3600,
      '/features': 3600,

      // Dynamic dashboard pages cached for 1 minute
      '/app/*': 60,
      '/api/*': 0, // No caching for API routes

      // Default TTL
      '*': 300,
    },

    // Revalidation strategy
    revalidate: async (options) => {
      const { tags, paths } = options;

      // Batch revalidation for efficiency
      if (tags?.length) {
        await Promise.all(tags.map((tag) => client.del(`tag:${tag}`)));
      }

      if (paths?.length) {
        await Promise.all(paths.map((path) => client.del(`path:${path}`)));
      }
    },
  };
});

module.exports = IncrementalCache;
