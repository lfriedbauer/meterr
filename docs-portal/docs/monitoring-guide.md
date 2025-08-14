---
title: Monitoring
sidebar_label: Monitoring
sidebar_position: 8
audience: ["human", "ai"]
description: "METERR Monitoring Guide documentation for Meterr.ai"

---

# METERR Monitoring Guide

<!-- audience: human -->
## Overview (Detailed)

# METERR Monitoring Guide

## Key Metrics to Track

### Business Metrics
- **MRR**: Monthly recurring revenue
- **User Growth**: New signups per day
- **Churn Rate**: Users canceling
- **Token Volume**: Total tokens tracked
- **Cost Savings**: Customer savings achieved

### Technical Metrics
- **API Latency**: p50, p95, p99 response times
- **Error Rate**: 4xx and 5xx errors
- **Token Accuracy**: Validation against providers
- **Database Performance**: Query times
- **Uptime**: System availability

## Monitoring Stack

<!-- /audience -->

<!-- audience: ai -->
## Overview (Concise)

# METERR Monitoring - Claude Context

## Key Metrics
- API latency (&lt;100ms target)
- Error rate (&lt;1% target)
- Token accuracy (99.9% target)
- Uptime (99.9% target)

## Tools
- Vercel Analytics (built-in)
<!-- /audience -->

# METERR Monitoring Guide

## Key Metrics to Track

### Business Metrics
- **MRR**: Monthly recurring revenue
- **User Growth**: New signups per day
- **Churn Rate**: Users canceling
- **Token Volume**: Total tokens tracked
- **Cost Savings**: Customer savings achieved

### Technical Metrics
- **API Latency**: p50, p95, p99 response times
- **Error Rate**: 4xx and 5xx errors
- **Token Accuracy**: Validation against providers
- **Database Performance**: Query times
- **Uptime**: System availability

## Monitoring Stack

### Vercel Analytics
Built-in monitoring for:
- Page views and unique visitors
- Web Vitals (LCP, FID, CLS)
- API route performance
- Edge function execution

### Sentry
Error tracking and performance:
- JavaScript errors in frontend
- API errors with stack traces
- Performance transactions
- User impact analysis

### Supabase Dashboard
Database monitoring:
- Query performance
- Connection pool usage
- Storage usage
- Real-time subscriptions

## Alert Configuration

### Critical Alerts (Immediate)
- API error rate &gt;5%
- Database down
- Payment failures
- Token counting errors
- Security breaches

### Warning Alerts (Within 1 hour)
- API latency &gt;500ms
- Memory usage &gt;80%
- Disk usage &gt;80%
- High customer churn
- Budget exceeded

### Info Alerts (Daily)
- Daily usage summary
- New user signups
- Revenue updates
- Performance trends

## Dashboard Setup

### Real-time Dashboard
Monitor at: `/admin/monitoring`

```typescript
// Key metrics to display
- Active users (real-time)
- Tokens processed (last hour)
- API calls (per minute)
- Error rate (last 5 min)
- Revenue today
```

### Weekly Reports
Automated reports include:
- User growth trends
- Revenue analysis
- Performance metrics
- Error summary
- Cost optimization opportunities

## Performance Monitoring

### API Performance
```typescript
// Track every API call
{
  endpoint: "/api/track",
  duration: 45, // ms
  status: 200,
  user: "user_123",
  timestamp: "2025-08-13T10:00:00Z"
}
```

### Token Accuracy
```typescript
// Validate sample of tokens daily
{
  our_count: 1234,
  provider_count: 1234,
  accuracy: 100.0,
  model: "gpt-4",
  sample_size: 1000
}
```

## Custom Metrics

### Cost Savings Tracking
```sql
-- Calculate customer savings
SELECT 
  SUM(optimized_cost - original_cost) as total_savings,
  AVG((original_cost - optimized_cost) / original_cost * 100) as avg_savings_percent
FROM usage_logs
WHERE optimized = true;
```

### Usage Patterns
```sql
-- Peak usage times
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as requests,
  SUM(tokens) as total_tokens
FROM api_calls
GROUP BY hour
ORDER BY requests DESC;
```

## Health Checks

### Endpoint Monitoring
```bash
# Health check endpoint
GET /api/health

Response:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "version": "1.0.0"
}
```

### Synthetic Monitoring
Run every 5 minutes:
1. Create test user
2. Track tokens
3. View dashboard
4. Verify data accuracy
5. Clean up test data

## Logging Strategy

### Structured Logging
```typescript
logger.info("API call processed", {
  user_id: "user_123",
  provider: "openai",
  model: "gpt-4",
  tokens: 650,
  cost: 0.021,
  duration_ms: 45
});
```

### Log Levels
- **ERROR**: System failures, payment issues
- **WARN**: High latency, rate limits
- **INFO**: API calls, user actions
- **DEBUG**: Detailed execution (dev only)

## Performance Optimization

### Identifying Bottlenecks
1. Check Vercel Analytics for slow routes
2. Review Sentry for performance issues
3. Analyze database slow queries
4. Monitor memory usage trends

### Common Issues & Solutions

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Slow dashboard | Unoptimized queries | Add database indexes |
| High error rate | API changes | Update provider adapters |
| Memory leaks | Unclosed connections | Review connection pooling |
| Token mismatches | Outdated tokenizer | Update tokenizer library |

## Incident Response

### Severity Levels
- **P0**: System down (15 min response)
- **P1**: Major feature broken (1 hour)
- **P2**: Minor feature issue (4 hours)
- **P3**: Cosmetic issue (next day)

### Response Process
1. **Detect**: Alert triggered
2. **Assess**: Determine impact
3. **Communicate**: Update status page
4. **Fix**: Deploy solution
5. **Review**: Post-mortem

## Status Page

Public status at: `status.meterr.ai`

Components monitored:
- API availability
- Dashboard access
- Token tracking
- Payment processing
- Provider integrations

---

*For monitoring scripts, see `/scripts/monitoring/`*