# METERR Deployment - Claude Context

## Platform
- Vercel (edge deployment)
- Supabase (database)
- DynamoDB (logs)

## Environments
- Dev: localhost:3000
- Preview: PR deployments
- Prod: meterr.ai, app.meterr.ai

## Pre-Deploy Checks
```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm audit
```

## Deploy Command
```bash
git push origin main  # Auto-deploys via Vercel
```

## Environment Variables
Required in Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- DATABASE_URL
- STRIPE_SECRET_KEY

## Rollback
- Vercel Dashboard → Instant Rollback
- Or: `git revert HEAD && git push`

## Monitor
- Vercel Analytics
- Sentry errors
- Supabase metrics

## Files
- `/apps/*/vercel.json` - Config
- `/scripts/deploy.ps1` - Script

---
*Deployment operational reference*