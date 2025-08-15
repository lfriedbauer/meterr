---
title: Deployment Guide
description: Vercel configurations, rollback procedures, and feature flags
audience: ["human"]
status: ready
last_updated: 2025-08-15
owner: devops
---

# Deployment Guide

## Overview

This guide covers deployment procedures for meterr.ai, including Vercel configuration, rollback strategies, and feature flag management.

## Vercel Configuration

### Project Setup

#### Environment Variables
```bash
# Production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.meterr.ai
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=... # 32+ character random string
ENCRYPTION_KEY=... # 32 byte hex string
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/meterr_dev
REDIS_URL=redis://localhost:6379
```

#### Build Configuration
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['pg', 'redis']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  redirects: async () => [
    {
      source: '/api',
      destination: '/api/health',
      permanent: false,
    },
  ],
  headers: async () => [
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.ALLOWED_ORIGINS || '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET,POST,PUT,DELETE,OPTIONS',
        },
      ],
    },
  ],
};

export default nextConfig;
```

#### Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ],
  "redirects": [
    {
      "source": "/docs",
      "destination": "https://docs.meterr.ai",
      "permanent": false
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Deployment Process

### Pre-Deployment Checklist
- [ ] All tests passing (`pnpm test`)
- [ ] Type checking clean (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Database migrations tested
- [ ] Environment variables updated
- [ ] Feature flags configured
- [ ] Monitoring alerts configured
- [ ] Rollback plan prepared

### Deployment Steps

#### 1. Prepare Release
```bash
# Create release branch
git checkout -b release/v0.2.0
git push -u origin release/v0.2.0

# Update version
npm version minor # or patch/major

# Generate changelog
git log --oneline --since="last-release" > CHANGELOG.md

# Commit changes
git add .
git commit -m "chore: prepare release v0.2.0"
```

#### 2. Deploy to Staging
```bash
# Deploy to staging environment
vercel --env staging

# Run integration tests
pnpm test:integration

# Manual smoke testing
# - Authentication flow
# - Core API endpoints
# - Dashboard functionality
# - Error handling
```

#### 3. Production Deployment
```bash
# Deploy to production
vercel --prod

# Verify deployment
curl https://api.meterr.ai/health
curl https://app.meterr.ai/api/health

# Monitor for errors
vercel logs --follow
```

#### 4. Post-Deployment Verification
```bash
# Check key metrics
# - Response times < 500ms
# - Error rate < 1%
# - Database connections stable
# - Cache hit rates normal

# Verify core functionality
# - User authentication
# - Token calculation
# - Smart routing
# - Dashboard loading
```

## Rollback Procedures

### Immediate Rollback (Emergency)
```bash
# Get previous deployment
vercel ls

# Rollback to previous version
vercel rollback [DEPLOYMENT_URL]

# Verify rollback
curl https://api.meterr.ai/health

# Check logs for errors
vercel logs --follow
```

### Database Rollback
```bash
# If database migration needed rollback
# 1. Create rollback migration
npx knex migrate:make rollback_v1_2_0

# 2. Write down migration
exports.up = function(knex) {
  return knex.schema.dropTable('new_table');
};

# 3. Run rollback
npx knex migrate:rollback

# 4. Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM critical_table;"
```

### Gradual Rollback with Feature Flags
```typescript
// Use feature flags for gradual rollback
const featureFlags = {
  NEW_FEATURE_ENABLED: false, // Disable new feature
  OLD_FEATURE_ENABLED: true,  // Re-enable old feature
  ROLLBACK_MODE: true         // Enable rollback mode
};

// In application code
if (featureFlags.ROLLBACK_MODE) {
  return oldImplementation();
} else {
  return newImplementation();
}
```

## Feature Flags

### Implementation
```typescript
// Feature flag configuration
interface FeatureFlags {
  NEW_DASHBOARD: boolean;
  SMART_ROUTING_V2: boolean;
  BETA_FEATURES: boolean;
  MAINTENANCE_MODE: boolean;
}

// Environment-based flags
const featureFlags: FeatureFlags = {
  NEW_DASHBOARD: process.env.FEATURE_NEW_DASHBOARD === 'true',
  SMART_ROUTING_V2: process.env.FEATURE_SMART_ROUTING_V2 === 'true',
  BETA_FEATURES: process.env.NODE_ENV === 'development',
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true'
};

// Feature flag provider
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag] || false;
}

// Usage in components
export function Dashboard() {
  const useNewDashboard = useFeatureFlag('NEW_DASHBOARD');
  
  if (useNewDashboard) {
    return <NewDashboard />;
  }
  
  return <LegacyDashboard />;
}
```

### Runtime Feature Flags
```typescript
// Database-backed feature flags
class FeatureFlagService {
  private cache = new Map<string, boolean>();
  
  async isEnabled(flag: string, userId?: string): Promise<boolean> {
    // Check cache first
    if (this.cache.has(flag)) {
      return this.cache.get(flag)!;
    }
    
    // Check database
    const flagRecord = await db('feature_flags')
      .where('name', flag)
      .first();
      
    if (!flagRecord) return false;
    
    // Check user-specific overrides
    if (userId && flagRecord.user_overrides) {
      const userOverride = await db('user_feature_flags')
        .where('user_id', userId)
        .where('flag_name', flag)
        .first();
        
      if (userOverride) {
        return userOverride.enabled;
      }
    }
    
    // Cache and return
    this.cache.set(flag, flagRecord.enabled);
    return flagRecord.enabled;
  }
  
  async setFlag(flag: string, enabled: boolean): Promise<void> {
    await db('feature_flags')
      .insert({ name: flag, enabled })
      .onConflict('name')
      .merge({ enabled, updated_at: new Date() });
      
    this.cache.set(flag, enabled);
  }
}
```

## Monitoring & Alerting

### Health Checks
```typescript
// API health check endpoint
export async function GET(): Promise<Response> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalAPIs()
  ]);
  
  const results = checks.map((check, index) => ({
    service: ['database', 'redis', 'external_apis'][index],
    status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    error: check.status === 'rejected' ? check.reason.message : null
  }));
  
  const isHealthy = results.every(r => r.status === 'healthy');
  
  return Response.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: results
  }, {
    status: isHealthy ? 200 : 503
  });
}
```

### Deployment Alerts
```typescript
// Post-deployment monitoring
async function monitorDeployment(deploymentId: string): Promise<void> {
  const startTime = Date.now();
  const monitorDuration = 10 * 60 * 1000; // 10 minutes
  
  const checkInterval = setInterval(async () => {
    const metrics = await getDeploymentMetrics(deploymentId);
    
    // Check error rate
    if (metrics.errorRate > 5) {
      await alert('High error rate detected', {
        deploymentId,
        errorRate: metrics.errorRate,
        action: 'Consider rollback'
      });
    }
    
    // Check response time
    if (metrics.avgResponseTime > 1000) {
      await alert('High response time detected', {
        deploymentId,
        responseTime: metrics.avgResponseTime
      });
    }
    
    // Stop monitoring after duration
    if (Date.now() - startTime > monitorDuration) {
      clearInterval(checkInterval);
    }
  }, 30000); // Check every 30 seconds
}
```

## Environment Management

### Environment Promotion
```bash
# Promote staging to production
# 1. Ensure staging tests pass
pnpm test:staging

# 2. Create production deployment
git checkout main
git merge staging
git push origin main

# 3. Deploy to production
vercel --prod

# 4. Update environment variables if needed
vercel env add FEATURE_FLAG production
```

### Database Migration Strategy
```bash
# Safe migration process
# 1. Create backward-compatible migration
npx knex migrate:make add_column_with_default

# 2. Deploy migration (no downtime)
npx knex migrate:latest

# 3. Deploy application code
vercel --prod

# 4. Clean up old columns (next release)
npx knex migrate:make remove_old_column
```

## Disaster Recovery

### Backup Strategy
- **Database**: Automated daily backups with 30-day retention
- **File Storage**: Cross-region replication
- **Configuration**: Version controlled in git
- **Secrets**: Stored in secure vault with access logging

### Recovery Procedures
1. **Service Outage**
   - Switch traffic to backup region
   - Investigate and fix root cause
   - Gradually restore traffic

2. **Data Corruption**
   - Stop write operations
   - Restore from latest backup
   - Replay transactions from logs
   - Verify data integrity

3. **Security Breach**
   - Isolate affected systems
   - Rotate all credentials
   - Patch vulnerabilities
   - Audit access logs

## Maintenance Windows

### Scheduled Maintenance
```bash
# Enable maintenance mode
vercel env add MAINTENANCE_MODE true production

# Deploy maintenance page
vercel --prod

# Perform maintenance tasks
# - Database maintenance
# - Security updates
# - Performance optimization

# Disable maintenance mode
vercel env rm MAINTENANCE_MODE production
vercel --prod
```

### Zero-Downtime Deployments
- Use feature flags for gradual rollouts
- Database migrations must be backward compatible
- Blue-green deployment for major changes
- Canary releases for high-risk features

---
*Follow these procedures for safe, reliable deployments of meterr.ai*