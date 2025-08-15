---
title: Performance Benchmarks
description: Response time targets, query optimization, and caching rules
audience: ["ai"]
status: ready
last_updated: 2025-08-15
owner: engineering
---

# Performance Benchmarks

<!-- audience: ai -->
## Response Time Targets

### API Endpoints
- **Authentication**: <50ms (99th percentile)
- **Token calculation**: <200ms (95th percentile)
- **Smart routing**: <500ms (95th percentile)
- **Dashboard queries**: <1000ms (90th percentile)
- **Report generation**: <2000ms (90th percentile)

### Database Queries
- **User lookup**: <10ms
- **Token history**: <100ms
- **Usage aggregation**: <500ms
- **Cross-provider analytics**: <1000ms

### Implementation Monitoring
```typescript
// Add to all critical paths
const startTime = performance.now();
const result = await criticalOperation();
const duration = performance.now() - startTime;

if (duration > TARGET_MS) {
  logger.warn('Performance threshold exceeded', {
    operation: 'criticalOperation',
    duration,
    target: TARGET_MS,
    userId: context.userId
  });
}
```

## Query Optimization Rules

### Database Indexes
```sql
-- Required indexes for performance
CREATE INDEX CONCURRENTLY idx_tokens_user_created 
  ON tokens(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_usage_provider_model 
  ON usage_logs(provider, model, created_at);

CREATE INDEX CONCURRENTLY idx_costs_user_month 
  ON cost_calculations(user_id, date_trunc('month', created_at));
```

### Query Patterns
```typescript
import { BigNumber } from 'bignumber.js';

// ✅ Efficient: Use specific columns and limits
const recentTokens = await db
  .select(['id', 'count', 'cost', 'created_at'])
  .from('tokens')
  .where('user_id', userId)
  .orderBy('created_at', 'desc')
  .limit(100);

// Process cost values with BigNumber for accuracy
const processedTokens = recentTokens.map(token => ({
  ...token,
  cost: new BigNumber(token.cost).toFixed(6)
}));

// ❌ Inefficient: SELECT * without limits
const allTokens = await db
  .select('*')
  .from('tokens')
  .where('user_id', userId);
```

### Pagination Optimization
```typescript
// Use cursor-based pagination for large datasets
async function getTokenHistory(userId: string, cursor?: string) {
  let query = db
    .select(['id', 'count', 'cost', 'created_at'])
    .from('tokens')
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .limit(50);
    
  if (cursor) {
    query = query.where('created_at', '<', cursor);
  }
  
  return query;
}
```

## Caching Strategy

### Cache Levels
1. **Application Cache**: In-memory for frequently accessed data
2. **Redis Cache**: Shared cache for computed results
3. **CDN Cache**: Static assets and API responses
4. **Database Query Cache**: PostgreSQL query result cache

### Cache Keys
```typescript
const CACHE_KEYS = {
  USER_SETTINGS: (userId: string) => `settings:${userId}`,
  TOKEN_RATES: (provider: string) => `rates:${provider}`,
  USAGE_SUMMARY: (userId: string, month: string) => `usage:${userId}:${month}`,
  PROVIDER_STATUS: 'providers:status'
} as const;
```

### Cache Implementation
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class CacheManager {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  }
  
  async del(key: string): Promise<void> {
    await redis.del(key);
  }
  
  // Cache with automatic refresh
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await computeFn();
      await this.set(key, value, ttlSeconds);
    }
    
    return value;
  }
}
```

### Cache TTL Rules
```typescript
const CACHE_TTL = {
  USER_SETTINGS: 300,        // 5 minutes
  TOKEN_RATES: 3600,         // 1 hour
  USAGE_SUMMARY: 1800,       // 30 minutes
  PROVIDER_STATUS: 60,       // 1 minute
  DASHBOARD_DATA: 120,       // 2 minutes
  REPORTS: 86400            // 24 hours
} as const;
```

## Memory Management

### Connection Pooling
```typescript
// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  min: 5,                     // Minimum connections
  acquireTimeoutMillis: 60000, // 60s timeout
  createTimeoutMillis: 30000,  // 30s create timeout
  destroyTimeoutMillis: 5000,  // 5s destroy timeout
  idleTimeoutMillis: 30000,    // 30s idle timeout
  reapIntervalMillis: 1000,    // Check every second
  createRetryIntervalMillis: 200
});
```

### Memory Leak Prevention
```typescript
// Cleanup intervals for in-memory caches
const inMemoryCache = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of inMemoryCache.entries()) {
    if (now > entry.expiresAt) {
      inMemoryCache.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// Weak references for temporary objects
const weakMap = new WeakMap();

function associateTemporaryData<T>(obj: object, data: T): void {
  weakMap.set(obj, data); // Automatically cleaned when obj is GC'd
}
```

## Performance Monitoring

### Metrics Collection
```typescript
interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  userId?: string;
  success: boolean;
  errorCode?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const start = performance.now();
    let success = true;
    let errorCode: string | undefined;
    
    try {
      return await fn();
    } catch (error) {
      success = false;
      errorCode = error.code || 'UNKNOWN_ERROR';
      throw error;
    } finally {
      const duration = performance.now() - start;
      
      this.metrics.push({
        operation,
        duration,
        timestamp: Date.now(),
        userId,
        success,
        errorCode
      });
      
      // Alert on performance degradation
      if (duration > this.getThreshold(operation)) {
        this.alertSlowOperation(operation, duration, userId);
      }
    }
  }
  
  private getThreshold(operation: string): number {
    const thresholds = {
      'auth': 50,
      'token_calc': 200,
      'smart_route': 500,
      'dashboard': 1000
    };
    return thresholds[operation] || 1000;
  }
}
```

### Performance Alerts
```typescript
async function alertSlowOperation(
  operation: string, 
  duration: number, 
  userId?: string
) {
  // Log for monitoring systems
  logger.warn('Slow operation detected', {
    operation,
    duration,
    userId: userId ? maskUserId(userId) : undefined,
    threshold: getThreshold(operation)
  });
  
  // Send to monitoring service (Datadog, New Relic, etc.)
  if (process.env.NODE_ENV === 'production') {
    await sendMetric('performance.slow_operation', {
      operation,
      duration,
      userId: userId ? 'user' : 'anonymous'
    });
  }
}
```

## Load Testing Targets

### Concurrent Users
- **Free tier**: 100 concurrent requests
- **Pro tier**: 1000 concurrent requests
- **Enterprise**: 5000+ concurrent requests

### Throughput Targets
- **Token calculations**: 1000 req/sec
- **Smart routing**: 500 req/sec
- **Dashboard loads**: 200 req/sec
- **Report generation**: 50 req/sec

### Load Testing Script
```typescript
// Artillery.js configuration
export const config = {
  target: 'https://api.meterr.ai',
  phases: [
    { duration: 60, arrivalRate: 10 },   // Ramp up
    { duration: 300, arrivalRate: 100 }, // Steady state
    { duration: 60, arrivalRate: 200 }   // Peak load
  ],
  processor: './test-processor.js'
};

export const scenarios = [
  {
    name: 'Token calculation',
    weight: 50,
    flow: [
      {
        post: {
          url: '/v1/tokens/calculate',
          headers: {
            'Authorization': 'Bearer {{ apiKey }}',
            'Content-Type': 'application/json'
          },
          json: {
            data: {
              text: '{{ text }}',
              model: 'gpt-4'
            }
          }
        }
      }
    ]
  }
];
```

## Optimization Checklist

### Before Production Deploy
- [ ] Database queries have appropriate indexes
- [ ] Cache keys have reasonable TTL
- [ ] Memory usage is stable under load
- [ ] Response times meet targets
- [ ] Error rates remain <1%
- [ ] Connection pools are properly sized
- [ ] Monitoring alerts are configured
- [ ] Load testing passes all scenarios

### Regular Performance Reviews
- [ ] Weekly: Review slow query logs
- [ ] Monthly: Analyze cache hit rates
- [ ] Quarterly: Load test with traffic projections
- [ ] After incidents: Update performance targets

---
*Maintain these benchmarks for optimal meterr.ai performance*