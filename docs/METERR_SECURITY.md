# METERR Security Guide

## Security Critical for meterr.ai

We handle customer API keys worth thousands of dollars per month. A single leaked key could result in massive unauthorized charges. Security is not optional.

## API Key Security

### The Risk
- OpenAI API key leaked = $50,000+ in charges (real incident)
- Customer trust destroyed instantly
- Legal liability for negligence

### Our Protection Layers

```
Customer API Key
       ↓
   Encrypted in Transit (TLS 1.3)
       ↓
   Encrypted at Rest (AES-256-GCM)
       ↓
   Stored in Vault (Supabase Secrets)
       ↓
   Never Logged or Displayed
```

### Implementation

```typescript
// packages/@meterr/core/security/api-keys.ts

// ❌ NEVER DO THIS
function logAPICall(apiKey: string, endpoint: string) {
  console.log(`Calling ${endpoint} with key: ${apiKey}`);
}

// ✅ ALWAYS DO THIS
function logAPICall(apiKey: string, endpoint: string) {
  const maskedKey = maskAPIKey(apiKey); // sk-...xxx
  logger.info(`API call to ${endpoint}`, {
    keyPrefix: maskedKey,
    timestamp: new Date().toISOString()
  });
}

// Key masking function
function maskAPIKey(key: string): string {
  if (key.length < 8) return "****";
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
```

## Data Isolation

### Row-Level Security (RLS)

Each organization only sees their own data:

```sql
-- Supabase RLS policy
CREATE POLICY "Isolate org data"
ON token_usage
USING (org_id = auth.jwt() ->> 'org_id');

-- This means:
-- Org A queries data → Only sees Org A's records
-- Org B queries data → Only sees Org B's records
-- No possibility of data leakage
```

### Why This Matters
- Competitor could be your customer
- Financial data is confidential
- GDPR/CCPA compliance requires isolation

## Authentication & Authorization

### Authentication Flow
```
1. User enters email/password
2. Supabase validates credentials
3. JWT token issued (expires in 1 hour)
4. Token included in API requests
5. Server validates token on each request
```

### Authorization Levels

```typescript
// Roles in meterr.ai
enum Role {
  OWNER = "owner",        // Full access, billing
  ADMIN = "admin",        // Manage team, view all data
  DEVELOPER = "developer", // Use APIs, view own usage
  VIEWER = "viewer"       // Read-only dashboard access
}

// Enforce in API routes
export async function DELETE(request: Request) {
  const user = await authenticate(request);
  
  if (user.role !== Role.OWNER && user.role !== Role.ADMIN) {
    return new Response("Forbidden", { status: 403 });
  }
  
  // Proceed with deletion
}
```

## Input Validation

### Why Critical
- SQL injection could expose all data
- XSS could steal session tokens
- Command injection could compromise server

### Implementation with Zod

```typescript
// Every API endpoint validates input
import { z } from "zod";

const TokenRequestSchema = z.object({
  text: z.string().min(1).max(100000),
  model: z.enum(["gpt-4", "gpt-3.5-turbo", "claude-3"]),
  provider: z.enum(["openai", "anthropic", "google"])
});

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate input
  const validation = TokenRequestSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid input", details: validation.error },
      { status: 400 }
    );
  }
  
  // Safe to use validated data
  const { text, model, provider } = validation.data;
}
```

## Secure Development Practices

### Environment Variables

For secure environment variable configuration, see [Deployment Guide](./METERR_DEPLOYMENT.md#environment-variables)

### Git Security

```bash
# .gitignore (Critical entries)
.env
.env.local
*.pem
*.key
*.cert
/keys/
/secrets/
```

### Dependency Security

For security testing and audit commands, see [Testing Guide](./METERR_TESTING.md#security-testing)

## Common Vulnerabilities & Prevention

### 1. API Key Exposure

**Risk**: Key logged in error message
```typescript
// ❌ Vulnerable
catch (error) {
  console.error("API call failed", { apiKey, error });
}

// ✅ Secure
catch (error) {
  console.error("API call failed", { 
    keyId: hashAPIKey(apiKey),
    error: error.message 
  });
}
```

### 2. SQL Injection

**Risk**: Direct query concatenation
```typescript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Secure (Parameterized query)
const query = "SELECT * FROM users WHERE id = $1";
const result = await db.query(query, [userId]);
```

### 3. Cross-Site Scripting (XSS)

**Risk**: Rendering user input
```typescript
// ❌ Vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Secure
<div>{userInput}</div>  // React escapes by default
```

### 4. Sensitive Data in URLs

**Risk**: API keys in query parameters
```typescript
// ❌ Vulnerable
fetch(`/api/track?apiKey=${key}&model=${model}`);

// ✅ Secure (Use headers)
fetch("/api/track", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${key}`
  },
  body: JSON.stringify({ model })
});
```

## Security Checklist

### Before Every Commit
- [ ] No hardcoded secrets
- [ ] No console.log with sensitive data
- [ ] API keys masked in logs
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak internals

### Before Deployment
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Dependencies audited

### Regular Audits
- [ ] Weekly: `pnpm audit`
- [ ] Monthly: Review access logs
- [ ] Quarterly: Penetration testing
- [ ] Annually: Security assessment

## Incident Response

### If API Key is Leaked

1. **Immediate**: Revoke the key
2. **Notify**: Inform affected customer
3. **Investigate**: How did it leak?
4. **Fix**: Patch the vulnerability
5. **Audit**: Check for other instances
6. **Document**: Update security practices

### If Data Breach Occurs

1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope
3. **Notify**: Legal requirement within 72 hours
4. **Remediate**: Fix vulnerability
5. **Monitor**: Watch for exploitation
6. **Review**: Post-mortem analysis

## Security Tools

### Development
```bash
# ESLint security plugin
pnpm add -D eslint-plugin-security

# Secret scanning
pnpm add -D gitleaks

# Dependency scanning
pnpm audit
```

### Production Monitoring
- Sentry for error tracking
- Vercel Analytics for anomalies
- CloudFlare for DDoS protection
- AWS GuardDuty for threat detection

## Compliance Requirements

### GDPR (Europe)
- Right to deletion
- Data portability
- Consent management
- Privacy by design

### CCPA (California)
- Opt-out mechanism
- Data disclosure
- No discrimination
- Privacy policy

### SOC 2 (Enterprise)
- Access controls
- Encryption
- Monitoring
- Incident response

---

*For implementation details, see `.claude/context/METERR_SECURITY.md`*