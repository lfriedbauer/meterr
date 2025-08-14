---
title: Startup Security Checklist
description: Pragmatic security approach for startups - what to do now vs. later
audience: ["human", "ai"]
status: ready
last_updated: 2025-01-14
owner: security
---

# Startup Security Checklist

<!-- audience: human -->
## Overview

This checklist provides a revenue-based approach to security for meterr.ai, focusing on high-impact, low-cost security measures first, then scaling security investments with revenue growth.

## Philosophy: Security ROI

- **Pre-Launch**: Free security wins that prevent disasters
- **Early Revenue**: Low-cost improvements that build trust
- **Scale**: Expensive compliance that enterprise customers require

<!-- /audience -->

<!-- audience: ai -->
## Implementation Priority Matrix

### Free Security Wins (Phase 1A)
Critical security measures that cost nothing but prevent major vulnerabilities:

#### ✅ Environment Variables
```typescript
// ✅ Use environment variables for all secrets
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET
};

// ❌ Never hardcode secrets
const badConfig = {
  openaiApiKey: 'sk-1234567890abcdef',
  databaseUrl: 'postgresql://user:pass@host/db'
};
```

#### ✅ HTTPS Everywhere (Vercel Provides)
- Automatic SSL certificates
- Force HTTPS redirects
- Secure cookie settings

#### ✅ Input Validation (Zod)
```typescript
import { z } from 'zod';

const UserInputSchema = z.object({
  email: z.string().email().max(255),
  text: z.string().max(100000),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3'])
});

// Validate all user inputs
export async function POST(request: Request) {
  const body = await request.json();
  const validation = UserInputSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error },
      { status: 400 }
    );
  }
  
  // Process validated data
  return processRequest(validation.data);
}
```

#### ✅ SQL Injection Prevention (Supabase RLS)
```sql
-- Row Level Security policies
CREATE POLICY "Users can only see their own data" 
  ON tokens FOR ALL 
  USING (auth.uid() = user_id);

-- Parameterized queries only
SELECT * FROM tokens 
WHERE user_id = $1 AND created_at > $2;
```

#### ✅ Basic Rate Limiting
```typescript
// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit = 100): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  const current = rateLimits.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false; // Rate limited
  }
  
  current.count++;
  return true;
}
```

#### ✅ Error Message Sanitization
```typescript
// ✅ Generic error messages in production
export function handleError(error: Error, context: string): Response {
  // Log full error for debugging
  logger.error('Request failed', {
    error: error.message,
    stack: error.stack,
    context
  });
  
  // Return generic message to user
  return NextResponse.json(
    { 
      error: 'Request failed',
      code: 'INTERNAL_ERROR',
      requestId: generateRequestId()
    },
    { status: 500 }
  );
}

// ❌ Never expose internal errors
export function badErrorHandling(error: Error): Response {
  return NextResponse.json({
    error: error.message,
    stack: error.stack, // Exposes internal structure!
    database: process.env.DATABASE_URL // Exposes secrets!
  });
}
```

### Early Revenue Security ($1K-10K MRR)
Invest when basic revenue validates the business:

#### API Key Management
```typescript
// Secure API key generation
import crypto from 'crypto';

function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32);
  return `sk-meterr_live_${randomBytes.toString('hex')}`;
}

// Hash API keys for storage
import bcrypt from 'bcrypt';

async function storeApiKey(key: string, userId: string): Promise<void> {
  const hashedKey = await bcrypt.hash(key, 12);
  
  await db('api_keys').insert({
    user_id: userId,
    key_hash: hashedKey,
    prefix: key.substring(0, 16), // For identification
    created_at: new Date()
  });
}
```

#### Request Logging & Monitoring
```typescript
// Log all API requests for security monitoring
export async function logRequest(
  request: Request,
  response: Response,
  duration: number
): Promise<void> {
  await db('request_logs').insert({
    method: request.method,
    url: request.url,
    status: response.status,
    duration,
    ip: getClientIP(request),
    user_agent: request.headers.get('user-agent'),
    timestamp: new Date()
  });
}
```

#### Data Backup Strategy
```typescript
// Automated daily backups (Supabase included)
// Point-in-time recovery setup
// Test restore procedures monthly

export async function scheduleBackupTest(): Promise<void> {
  // Test backup restoration monthly
  const testData = await createTestDataset();
  const backupSuccess = await testBackupRestore(testData);
  
  if (!backupSuccess) {
    await alertSecurityTeam('Backup test failed');
  }
}
```

### Growth Security ($10K-50K MRR)
Enhance security as customer base grows:

#### Error Tracking Integration
```typescript
// Sentry integration for error monitoring
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Strip sensitive data
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    return event;
  }
});
```

#### Security Headers
```typescript
// Comprehensive security headers
export function securityHeaders(): Record<string, string> {
  return {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https:"
    ].join('; ')
  };
}
```

#### Audit Logging
```typescript
// Log all sensitive operations
export async function auditLog(
  action: string,
  userId: string,
  resource: string,
  details?: Record<string, unknown>
): Promise<void> {
  await db('audit_logs').insert({
    action,
    user_id: userId,
    resource,
    details: JSON.stringify(details),
    ip_address: getCurrentIP(),
    timestamp: new Date()
  });
}
```
<!-- /audience -->

## Skip Until $1M ARR

These are expensive and not required for early-stage startups:

### ❌ SOC 2 Compliance ($30-50K annually)
- **Cost**: $30,000-50,000 per year
- **Timeline**: 6-12 months implementation
- **Required for**: Enterprise customers (Fortune 500)
- **Alternative**: Document security practices, prepare for future

### ❌ Penetration Testing ($10-20K)
- **Cost**: $10,000-20,000 per engagement
- **Frequency**: Quarterly for compliance
- **Required for**: Some enterprise customers
- **Alternative**: Automated security scanning (free tier available)

### ❌ 24/7 Security Operations Center
- **Cost**: $200,000+ annually
- **Required for**: Large-scale operations
- **Alternative**: Security monitoring tools + on-call rotation

### ❌ Geographic Redundancy
- **Cost**: 2-3x infrastructure costs
- **Complexity**: Significant operational overhead
- **Required for**: Mission-critical enterprise apps
- **Alternative**: Single-region with good backup strategy

## Financial Accuracy (Critical for meterr)

Never compromise on money-related security:

### Calculation Integrity
```typescript
import { BigNumber } from 'bignumber.js';

// ✅ Immutable calculation audit trail
export function calculateCostWithAudit(
  tokens: number,
  rate: number,
  model: string,
  userId: string
): { cost: string; auditId: string } {
  const auditId = generateAuditId();
  
  // Use BigNumber for precision
  const cost = new BigNumber(tokens)
    .multipliedBy(rate)
    .dividedBy(1000)
    .toFixed(6);
  
  // Log calculation for audit trail
  auditLog('cost_calculation', userId, 'token_usage', {
    auditId,
    tokens,
    rate,
    model,
    calculatedCost: cost,
    timestamp: new Date().toISOString()
  });
  
  return { cost, auditId };
}
```

### Daily Reconciliation
```typescript
// Automated daily cost reconciliation
export async function dailyReconciliation(): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const [ourCalculations, providerBilling] = await Promise.all([
    getOurCalculations(yesterday),
    getProviderBilling(yesterday)
  ]);
  
  const discrepancy = calculateDiscrepancy(ourCalculations, providerBilling);
  
  if (discrepancy.percentage > 5) {
    await alertFinanceTeam('Cost discrepancy detected', {
      date: yesterday,
      ourTotal: ourCalculations.total,
      providerTotal: providerBilling.total,
      discrepancy: discrepancy.percentage
    });
  }
}
```

### Dispute Process Documentation
```typescript
// Clear dispute resolution process
export interface DisputeProcess {
  step1: 'Customer reports billing discrepancy';
  step2: 'Provide audit trail with calculation details';
  step3: 'Compare with provider billing records';
  step4: 'Issue credit/adjustment within 24 hours';
  step5: 'Document resolution for future reference';
}

export async function handleBillingDispute(
  userId: string,
  disputeDetails: Record<string, unknown>
): Promise<void> {
  const auditTrail = await getAuditTrail(userId, disputeDetails.period);
  const providerData = await getProviderBillingData(disputeDetails.period);
  
  // Automatic resolution if discrepancy is clear
  if (isObviousDiscrepancy(auditTrail, providerData)) {
    await issueCreditAutomatically(userId, calculateCreditAmount(auditTrail));
    await notifyCustomer(userId, 'dispute_resolved_automatically');
  } else {
    await escalateToFinanceTeam(userId, disputeDetails, auditTrail);
  }
}
```

## Implementation Checklist

### Phase 1A (Free Security Wins)
- [ ] Environment variables configured ✓
- [ ] HTTPS enforced (Vercel default) ✓
- [ ] Input validation with Zod ✓
- [ ] SQL injection prevention (Supabase RLS) ✓
- [ ] Basic rate limiting implemented
- [ ] Error message sanitization
- [ ] Console.log statements removed
- [ ] Hardcoded secrets removed

### Phase 1 Complete ($1K+ MRR)
- [ ] API key hashing implemented
- [ ] Request logging setup
- [ ] Security headers configured
- [ ] Backup restoration tested
- [ ] Basic monitoring alerts

### Phase 2 Complete ($10K+ MRR)
- [ ] Error tracking (Sentry) integrated
- [ ] Audit logging for sensitive operations
- [ ] Security incident response plan
- [ ] Regular security reviews scheduled

### Phase 3 Complete ($50K+ MRR)
- [ ] Consider SOC 2 preparation
- [ ] Evaluate penetration testing needs
- [ ] Assess enterprise customer requirements
- [ ] Plan compliance roadmap

## Security Incident Response

### Immediate Response (0-1 hour)
1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope and impact
3. **Notify**: Alert security team and stakeholders
4. **Document**: Preserve evidence and timeline

### Investigation (1-24 hours)
1. **Analyze**: Review logs and forensic evidence
2. **Root Cause**: Identify how incident occurred
3. **Impact**: Assess data and financial impact
4. **Communication**: Update stakeholders

### Recovery (24-72 hours)
1. **Patch**: Fix vulnerabilities
2. **Rotate**: Change compromised credentials
3. **Monitor**: Watch for persistence or reoccurrence
4. **Verify**: Confirm systems are secure

### Post-Incident (1-2 weeks)
1. **Review**: Conduct lessons learned session
2. **Improve**: Update security measures
3. **Train**: Educate team on new procedures
4. **Report**: Document incident and response

---
*Prioritize security investments based on revenue and risk for sustainable startup growth*