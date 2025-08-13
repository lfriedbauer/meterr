---
title: Deployment
sidebar_label: Deployment
sidebar_position: 5
audience: ["human", "ai"]
description: "METERR Deployment Guide documentation for Meterr.ai"

---

# METERR Deployment Guide

<!-- audience: human -->
## Overview (Detailed)

# METERR Deployment Guide

## Deployment Platform

meterr.ai deploys on **Vercel** for global edge performance and automatic scaling.

## Environments

### Development
- **URL**: http://localhost:3000
- **Database**: Local Supabase
- **Purpose**: Active development

### Preview
- **URL**: Auto-generated per PR
- **Database**: Staging Supabase
- **Purpose**: Testing before production

### Production
- **URL**: https://meterr.ai (marketing), https://app.meterr.ai (dashboard)
<!-- /audience -->

<!-- audience: ai -->
## Overview (Concise)

# METERR Deployment - Claude Context

## Platform
- Vercel (edge deployment)
- Supabase (database)
- DynamoDB (logs)

## Environments
- Dev: localhost:3000
- Preview: PR deployments
<!-- /audience -->

# METERR Deployment Guide

## Deployment Platform

meterr.ai deploys on **Vercel** for global edge performance and automatic scaling.

## Environments

### Development
- **URL**: http://localhost:3000
- **Database**: Local Supabase
- **Purpose**: Active development

### Preview
- **URL**: Auto-generated per PR
- **Database**: Staging Supabase
- **Purpose**: Testing before production

### Production
- **URL**: https://meterr.ai (marketing), https://app.meterr.ai (dashboard)
- **Database**: Production Supabase
- **Purpose**: Live customer traffic

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript no errors (`pnpm typecheck`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Build successful (`pnpm build`)

### Security
- [ ] API keys in environment variables
- [ ] No hardcoded secrets
- [ ] Dependencies audited (`pnpm audit`)
- [ ] CORS configured properly

### Performance
- [ ] Bundle size acceptable
- [ ] Lighthouse score &gt;90
- [ ] API response &lt;100ms
- [ ] Images optimized

## Infrastructure Setup

### AWS (Optional - for Lambda functions)
```bash
cd infrastructure/aws/cdk
npm install
cdk deploy
```

### Supabase
```bash
cd infrastructure/supabase
supabase init
supabase start
```

## Deployment Process

### 1. Local Testing
```bash
# Build and test locally
pnpm build
pnpm start

# Verify everything works
```

### 2. Push to GitHub
```bash
git add .
git commit -m "feat: your feature"
git push origin feature-branch
```

### 3. Create Pull Request
- Automatic preview deployment created
- Tests run via GitHub Actions
- Review preview URL

### 4. Merge to Main
- Automatic production deployment
- Zero downtime deployment
- Rollback available if needed

## Environment Variables

### Required for Production

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI Providers (for testing)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Monitoring
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
```

## Vercel Configuration

### Project Structure
meterr.ai uses a monorepo with two Vercel projects:
- **meterr-marketing** (Project ID: `prj_O7tM6vH5MxVOLM2Jjh4ftUyCBUnj`)
  - Port: 3000
  - Domain: meterr.ai, www.meterr.ai
- **meterr-app** (Project ID: `prj_UsU6oonrsOvKY1DYDo7fW4nga2cp`)
  - Port: 3001
  - Domain: app.meterr.ai, admin.meterr.ai

### vercel.json (meterr-marketing)
```json
{
  "buildCommand": "cd .. && pnpm run build:marketing",
  "installCommand": "cd .. && pnpm install",
  "functions": {
    "apps/app/app/api/*": {
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### vercel.json (meterr-app)
```json
{
  "buildCommand": "cd .. && pnpm run build:app",
  "installCommand": "cd .. && pnpm install",
  "functions": {
    "apps/app/app/api/*": {
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Build Settings
- Framework: Next.js
- Build Command: Project-specific (see above)
- Output Directory: `.next`
- Install Command: `cd .. && pnpm install`

## Database Migration

### Before Deployment
```bash
# Run migrations
supabase migration up

# Verify schema
supabase db diff
```

### Rollback Plan
```bash
# If issues occur
supabase migration down
```

## Monitoring

### Real-time Monitoring
- Vercel Analytics Dashboard
- Supabase Dashboard
- Sentry Error Tracking

### Alerts Set Up
- Error rate &gt;1%
- Response time &gt;500ms
- Database connection failures
- Payment processing errors

## Rollback Procedure

### Immediate Rollback
1. Go to Vercel Dashboard
2. Click "Instant Rollback"
3. Select previous deployment
4. Confirm rollback

### Manual Rollback
```bash
# Revert commit
git revert HEAD
git push origin main

# Triggers new deployment with previous code
```

## Performance Optimization

### Edge Functions
- API routes run at edge locations
- Automatic global distribution
- No cold starts

### Caching Strategy
- Static pages: 1 year
- API responses: 1 minute
- Dashboard data: 10 seconds

### CDN Configuration
- Images served from Vercel CDN
- Assets compressed with Brotli
- HTTP/3 enabled

## Scaling

### Automatic Scaling
- Vercel handles traffic spikes
- No configuration needed
- Pay per request model

### Database Scaling
- Supabase connection pooling
- Read replicas for analytics
- DynamoDB for high-volume logs

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check logs in Vercel dashboard |
| Environment variables missing | Add in Vercel settings |
| Database connection error | Verify DATABASE_URL |
| API timeout | Increase maxDuration in vercel.json |

### Debug Commands
```bash
# Check deployment status
vercel

# View logs
vercel logs

# List deployments
vercel list
```

## Security Headers

Automatically applied by Vercel:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

## Cost Optimization

### Vercel Pricing
- Free tier: Perfect for development
- Pro: $20/month for production
- Enterprise: Custom pricing

### Tips
- Use ISR for marketing pages
- Implement proper caching
- Optimize images with next/image
- Use Edge Functions for API routes

---

*For deployment scripts, see `/scripts/deploy.ps1`*