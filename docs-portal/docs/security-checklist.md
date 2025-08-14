---
title: Security Checklist
description: Pre-deploy audits, key rotation, and OWASP compliance for meterr.ai
audience: ["human", "ai"]
status: ready
last_updated: 2025-01-14
owner: security
---

# Security Checklist

<!-- audience: human -->
## Overview

This document provides comprehensive security guidelines for meterr.ai, covering pre-deployment audits, ongoing security practices, and compliance requirements.

## Pre-Deployment Security Audit

### Code Security Review
- [ ] No hardcoded secrets in source code
- [ ] All environment variables properly configured
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper output encoding)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive information

### Infrastructure Security
- [ ] HTTPS enforced (TLS 1.2+ only)
- [ ] Security headers configured
- [ ] Database connections encrypted
- [ ] API keys stored securely (not in code)
- [ ] Access controls properly configured
- [ ] Backup encryption enabled
- [ ] Logging configured (without sensitive data)
<!-- /audience -->

<!-- audience: ai -->
## Input Validation Standards

### Request Validation Pattern
```typescript
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Define strict schemas
const UserInputSchema = z.object({
  text: z.string()
    .max(100000, 'Text too long')
    .refine(text => !containsSqlPatterns(text), 'Invalid characters'),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3']),
  metadata: z.record(z.string()).optional()
});

function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  // Parse and validate
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  
  // Additional sanitization
  if (typeof result.data === 'object' && result.data !== null) {
    return sanitizeObject(result.data);
  }
  
  return result.data;
}

function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
```

### SQL Injection Prevention
```typescript
import { BigNumber } from 'bignumber.js';

// ✅ Always use parameterized queries
async function getUserTokens(userId: string): Promise<Token[]> {
  const rows = await db.query(
    'SELECT id, count, cost FROM tokens WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  
  // Ensure cost values use BigNumber for financial accuracy
  return rows.map(row => ({
    ...row,
    cost: new BigNumber(row.cost).toFixed(6)
  }));
}

// ❌ Never concatenate user input
async function unsafeQuery(userId: string) {
  return db.query(`SELECT * FROM tokens WHERE user_id = '${userId}'`);
}

// ✅ Use query builders safely
const tokens = await db('tokens')
  .where('user_id', userId)
  .andWhere('created_at', '>', startDate)
  .select(['id', 'count', 'cost']);
```
<!-- /audience -->

## Authentication & Authorization

### API Key Security
```typescript
// API key format: sk-meterr_{env}_{32_char_random}
const API_KEY_PATTERN = /^sk-meterr_(live|test)_[a-zA-Z0-9]{32}$/;

function validateApiKey(key: string): boolean {
  return API_KEY_PATTERN.test(key);
}

// Hash API keys in database
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

// Verify without storing plaintext
async function verifyApiKey(key: string): Promise<User | null> {
  if (!validateApiKey(key)) return null;
  
  const prefix = key.substring(0, 16);
  const keyRecord = await db('api_keys')
    .where('prefix', prefix)
    .where('is_active', true)
    .first();
    
  if (!keyRecord) return null;
  
  const isValid = await bcrypt.compare(key, keyRecord.key_hash);
  if (!isValid) return null;
  
  return getUserById(keyRecord.user_id);
}
```

### Session Management
```typescript
// JWT configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET, // 32+ char random string
  expiresIn: '1h',
  issuer: 'meterr.ai',
  audience: 'meterr-api'
};

// Secure cookie settings
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 1000 // 1 hour
};
```

## Data Protection

### PII Masking
```typescript
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `**@${domain}`;
  return `${local.substring(0, 2)}***@${domain}`;
}

function maskApiKey(key: string): string {
  if (key.length < 10) return '****';
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
}

function maskUserId(userId: string): string {
  if (userId.length < 8) return '****';
  return `${userId.substring(0, 4)}****`;
}

// Use in all logging
logger.info('User authenticated', {
  userId: maskUserId(user.id),
  email: maskEmail(user.email),
  apiKey: maskApiKey(apiKey)
});
```

### Encryption at Rest
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(Buffer.from('meterr-data'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from('meterr-data'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

## Security Headers

### HTTP Security Headers
```typescript
export function securityHeaders(): Record<string, string> {
  return {
    // HTTPS enforcement
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // XSS protection
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "font-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'"
    ].join('; '),
    
    // CORS
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    
    // Additional security
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

// Apply to all responses
export function withSecurityHeaders(response: NextResponse): NextResponse {
  const headers = securityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
```

## OWASP Compliance

### OWASP Top 10 Prevention

#### A01: Broken Access Control
```typescript
// Role-based access control
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

function requireRole(minRole: UserRole) {
  return (user: User) => {
    const hierarchy = [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN];
    const userLevel = hierarchy.indexOf(user.role);
    const requiredLevel = hierarchy.indexOf(minRole);
    
    if (userLevel < requiredLevel) {
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }
  };
}

// Resource ownership validation
async function validateResourceAccess(userId: string, resourceId: string): Promise<boolean> {
  const resource = await db('tokens').where('id', resourceId).first();
  return resource?.user_id === userId;
}
```

#### A02: Cryptographic Failures
```typescript
// Use strong random values
function generateApiKey(): string {
  const random = crypto.randomBytes(32).toString('hex');
  return `sk-meterr_live_${random}`;
}

// Secure password hashing
import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1
  });
}
```

#### A03: Injection
```typescript
// Parameterized queries (covered above)
// Input validation with Zod (covered above)
// Command injection prevention
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// NoSQL injection prevention
function sanitizeMongoQuery(query: Record<string, unknown>): Record<string, unknown> {
  if (typeof query !== 'object' || query === null) return query;
  
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    // Remove $ operators from user input
    if (key.startsWith('$')) continue;
    sanitized[key] = typeof value === 'object' ? sanitizeMongoQuery(value) : value;
  }
  return sanitized;
}
```

## Key Rotation

### API Key Rotation
```typescript
class ApiKeyRotation {
  // Rotate user API keys
  async rotateUserKey(userId: string): Promise<string> {
    const newKey = generateApiKey();
    
    await db.transaction(async (trx) => {
      // Deactivate old key
      await trx('api_keys')
        .where('user_id', userId)
        .update({ is_active: false, deactivated_at: new Date() });
      
      // Create new key
      await this.storeApiKey(newKey, userId, trx);
      
      // Log rotation
      await trx('key_rotations').insert({
        user_id: userId,
        reason: 'user_requested',
        timestamp: new Date()
      });
    });
    
    return newKey;
  }
  
  // Emergency key rotation
  async emergencyRotateAll(): Promise<void> {
    const activeKeys = await db('api_keys').where('is_active', true);
    
    for (const keyRecord of activeKeys) {
      await this.rotateUserKey(keyRecord.user_id);
      
      // Notify user
      await sendKeyRotationNotification(keyRecord.user_id);
    }
  }
}
```

### Environment Secret Rotation
```bash
# Rotation checklist
# 1. Generate new secrets
openssl rand -hex 32 > new_jwt_secret.txt
openssl rand -hex 32 > new_encryption_key.txt

# 2. Update environment variables
# 3. Restart services
# 4. Verify functionality
# 5. Revoke old secrets
```

## Security Monitoring

### Suspicious Activity Detection
```typescript
interface SecurityEvent {
  type: 'failed_auth' | 'rate_limit' | 'suspicious_request';
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    this.events.push(event);
    
    // Alert on suspicious patterns
    await this.checkForSuspiciousActivity(event);
    
    // Store for analysis
    await db('security_events').insert(event);
  }
  
  private async checkForSuspiciousActivity(event: SecurityEvent): Promise<void> {
    // Multiple failed attempts from same IP
    if (event.type === 'failed_auth') {
      const recentFailures = this.events.filter(e => 
        e.type === 'failed_auth' && 
        e.ip === event.ip &&
        e.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
      );
      
      if (recentFailures.length >= 5) {
        await this.alertSecurityTeam('Multiple auth failures', event);
        await this.temporaryIpBlock(event.ip);
      }
    }
  }
}
```

## Incident Response

### Security Incident Checklist
1. **Immediate Response** (0-1 hour)
   - [ ] Identify scope of breach
   - [ ] Contain the incident
   - [ ] Preserve evidence
   - [ ] Notify security team

2. **Investigation** (1-24 hours)
   - [ ] Analyze logs and forensics
   - [ ] Determine root cause
   - [ ] Assess data impact
   - [ ] Document timeline

3. **Recovery** (24-72 hours)
   - [ ] Patch vulnerabilities
   - [ ] Rotate compromised credentials
   - [ ] Restore services
   - [ ] Monitor for persistence

4. **Post-Incident** (1-2 weeks)
   - [ ] Conduct lessons learned
   - [ ] Update security controls
   - [ ] Train team on new procedures
   - [ ] Update incident response plan

---
*Follow this checklist to maintain security across meterr.ai*