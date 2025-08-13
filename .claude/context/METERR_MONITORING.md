# METERR Monitoring - Claude Context

## Key Metrics
- API latency (<100ms target)
- Error rate (<1% target)
- Token accuracy (99.9% target)
- Uptime (99.9% target)

## Tools
- Vercel Analytics (built-in)
- Sentry (errors)
- Supabase Dashboard (database)

## Health Check
```bash
GET /api/health
```

## Critical Alerts
- API errors >5%
- Database down
- Payment failures
- Token mismatches

## Log Levels
- ERROR: System failures
- WARN: Performance issues
- INFO: API calls
- DEBUG: Dev only

## Performance Checks
```typescript
// Log all API calls
logger.info("API call", {
  endpoint,
  duration_ms,
  status,
  user_id
});
```

## Incident Response
- P0: System down (15 min)
- P1: Feature broken (1 hour)
- P2: Minor issue (4 hours)
- P3: Cosmetic (next day)

## Files
- Health endpoint: `/app/api/health/route.ts`
- Monitoring scripts: `/scripts/monitoring/`

---
*Monitoring operational reference*