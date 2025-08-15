---
title: Data Governance
description: PII masking, data retention, and GDPR compliance for meterr.ai
audience: ["human", "ai"]
status: ready
last_updated: 2025-08-15
owner: data-protection
---

# Data Governance

<!-- audience: human -->
## Overview

This document establishes data governance standards for meterr.ai, ensuring compliance with privacy regulations (GDPR, CCPA) and implementing responsible data handling practices.

## Data Classification

### Sensitivity Levels
1. **Public**: Marketing content, public documentation
2. **Internal**: Business metrics, anonymized analytics
3. **Confidential**: User data, API usage patterns
4. **Restricted**: PII, API keys, financial data

### Data Types We Handle
- **Personal Information**: Email, name, company
- **Technical Data**: API keys, usage logs, error logs
- **Financial Data**: Billing information, usage costs
- **Behavioral Data**: Feature usage, performance metrics
<!-- /audience -->

<!-- audience: ai -->
## PII Masking Implementation

### Email Masking
```typescript
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `**@${domain}`;
  return `${local.substring(0, 2)}***@${domain}`;
}

// Examples:
// maskEmail('john@example.com') → 'jo***@example.com'
// maskEmail('a@example.com') → '**@example.com'
```

### User ID Masking
```typescript
function maskUserId(userId: string): string {
  if (userId.length < 8) return '****';
  return `${userId.substring(0, 4)}****`;
}

// Examples:
// maskUserId('user_1234567890') → 'user****'
// maskUserId('123') → '****'
```

### API Key Masking
```typescript
function maskApiKey(key: string): string {
  if (key.length < 10) return '****';
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
}

// Examples:
// maskApiKey('sk-meterr_live_abcdef123456') → 'sk-met...3456'
// maskApiKey('short') → '****'
```

### Credit Card Masking
```typescript
function maskCreditCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return `****-****-****-${cleaned.slice(-4)}`;
}

// Example:
// maskCreditCard('4111111111111111') → '****-****-****-1111'
```

### IP Address Masking
```typescript
function maskIpAddress(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  // IPv6 masking
  const ipv6Parts = ip.split(':');
  if (ipv6Parts.length >= 4) {
    return `${ipv6Parts.slice(0, 2).join(':')}::****`;
  }
  return 'xxx.xxx.xxx.xxx';
}

// Examples:
// maskIpAddress('192.168.1.100') → '192.168.xxx.xxx'
// maskIpAddress('2001:db8::1') → '2001:db8::****'
```

### Structured Logging with Masking
```typescript
interface LogData {
  userId?: string;
  email?: string;
  apiKey?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

function createMaskedLog(data: LogData): LogData {
  const masked = { ...data };
  
  if (masked.userId) masked.userId = maskUserId(masked.userId);
  if (masked.email) masked.email = maskEmail(masked.email);
  if (masked.apiKey) masked.apiKey = maskApiKey(masked.apiKey);
  if (masked.ip) masked.ip = maskIpAddress(masked.ip);
  
  return masked;
}

// Usage in logging
logger.info('User authentication', createMaskedLog({
  userId: user.id,
  email: user.email,
  apiKey: request.apiKey,
  ip: request.ip,
  success: true
}));
```
<!-- /audience -->

## Data Retention Policies

### Retention Schedules
```typescript
const RETENTION_POLICIES = {
  // User data
  USER_PROFILES: '7 years',        // After account deletion
  API_KEYS: '1 year',              // After deactivation
  
  // Usage data
  USAGE_LOGS: '2 years',           // For billing/support
  ERROR_LOGS: '1 year',            // For debugging
  PERFORMANCE_LOGS: '6 months',    // For optimization
  
  // Financial data (requires BigNumber.js for processing)
  BILLING_RECORDS: '7 years',      // Tax/legal requirements
  PAYMENT_METHODS: '1 year',       // After last use
  
  // Analytics data
  ANONYMIZED_METRICS: '5 years',   // For business insights
  SESSION_DATA: '30 days',         // For user experience
  
  // Audit logs
  SECURITY_LOGS: '3 years',        // For compliance
  ACCESS_LOGS: '1 year',           // For monitoring
} as const;
```

### Automated Data Purging
```typescript
class DataRetentionService {
  async purgeExpiredData(): Promise<void> {
    const tasks = [
      this.purgeOldLogs(),
      this.purgeDeletedUsers(),
      this.purgeExpiredSessions(),
      this.purgeOldMetrics()
    ];
    
    await Promise.all(tasks);
    
    logger.info('Data purging completed', {
      timestamp: new Date().toISOString(),
      tasksCompleted: tasks.length
    });
  }
  
  private async purgeOldLogs(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 year ago
    
    const deletedCount = await db('error_logs')
      .where('created_at', '<', cutoffDate)
      .del();
      
    logger.info('Purged old error logs', { count: deletedCount });
  }
  
  private async purgeDeletedUsers(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7); // 7 years ago
    
    // Find users deleted more than 7 years ago
    const expiredUsers = await db('users')
      .where('deleted_at', '<', cutoffDate)
      .where('deleted_at', 'is not', null);
    
    for (const user of expiredUsers) {
      await this.purgeUserData(user.id);
    }
  }
  
  private async purgeUserData(userId: string): Promise<void> {
    await db.transaction(async (trx) => {
      // Delete user's data in order (respecting foreign keys)
      await trx('api_keys').where('user_id', userId).del();
      await trx('usage_logs').where('user_id', userId).del();
      await trx('billing_records').where('user_id', userId).del();
      await trx('users').where('id', userId).del();
    });
    
    logger.info('Purged user data', { 
      userId: maskUserId(userId),
      reason: 'retention_policy'
    });
  }
}

// Schedule daily data purging
const retentionService = new DataRetentionService();
setInterval(() => {
  retentionService.purgeExpiredData().catch(error => {
    logger.error('Data purging failed', { error });
  });
}, 24 * 60 * 60 * 1000); // Daily
```

## GDPR Compliance

### Right to Access (Article 15)
```typescript
import { BigNumber } from 'bignumber.js';

class GDPRService {
  async generateDataExport(userId: string): Promise<UserDataExport> {
    const userData = await this.collectUserData(userId);
    
    return {
      personal_data: {
        profile: userData.profile,
        preferences: userData.preferences,
        contact_info: userData.contactInfo
      },
      usage_data: {
        api_calls: userData.apiCalls,
        billing_history: userData.billingHistory,
        feature_usage: userData.featureUsage
      },
      technical_data: {
        login_history: userData.loginHistory,
        ip_addresses: userData.ipAddresses.map(maskIpAddress),
        device_info: userData.deviceInfo
      },
      metadata: {
        exported_at: new Date().toISOString(),
        format: 'JSON',
        retention_policy: RETENTION_POLICIES
      }
    };
  }
  
  private async collectUserData(userId: string): Promise<any> {
    const [profile, apiCalls, billing, preferences] = await Promise.all([
      db('users').where('id', userId).first(),
      db('usage_logs').where('user_id', userId).orderBy('created_at', 'desc'),
      db('billing_records').where('user_id', userId).orderBy('created_at', 'desc'),
      db('user_preferences').where('user_id', userId).first()
    ]);
    
    // Process billing amounts with BigNumber for accuracy
    const processedBilling = billing.map(record => ({
      ...record,
      amount: new BigNumber(record.amount).toFixed(6)
    }));
    
    return {
      profile,
      apiCalls,
      billingHistory: processedBilling,
      preferences
    };
  }
}
```

### Right to Rectification (Article 16)
```typescript
async function updateUserData(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<Result<UserProfile>> {
  try {
    // Validate updates
    const validation = UserUpdateSchema.safeParse(updates);
    if (!validation.success) {
      return Err(new Error('VALIDATION_ERROR'));
    }
    
    // Update database
    const updatedUser = await db('users')
      .where('id', userId)
      .update({
        ...validation.data,
        updated_at: new Date()
      })
      .returning('*');
    
    // Log data modification
    await logDataModification(userId, 'update', updates);
    
    return Ok(updatedUser[0]);
  } catch (error) {
    return Err(error);
  }
}
```

### Right to Erasure (Article 17)
```typescript
async function deleteUserAccount(userId: string): Promise<void> {
  await db.transaction(async (trx) => {
    // 1. Anonymize data that must be retained (billing)
    await trx('billing_records')
      .where('user_id', userId)
      .update({
        user_id: null,
        anonymized_at: new Date()
      });
    
    // 2. Delete personal data
    await trx('user_preferences').where('user_id', userId).del();
    await trx('api_keys').where('user_id', userId).del();
    
    // 3. Mark user as deleted (soft delete)
    await trx('users')
      .where('id', userId)
      .update({
        email: null,
        name: '[DELETED]',
        deleted_at: new Date(),
        deletion_reason: 'user_request'
      });
    
    // 4. Log deletion
    await trx('data_modifications').insert({
      user_id: userId,
      action: 'delete',
      reason: 'gdpr_erasure',
      timestamp: new Date()
    });
  });
  
  logger.info('User account deleted', {
    userId: maskUserId(userId),
    reason: 'gdpr_erasure'
  });
}
```

### Right to Data Portability (Article 20)
```typescript
async function generatePortableData(userId: string): Promise<string> {
  const userData = await gdprService.generateDataExport(userId);
  
  // Convert to standardized format
  const portableData = {
    format: 'JSON-LD',
    version: '1.0',
    exported_by: 'meterr.ai',
    exported_at: new Date().toISOString(),
    data: userData
  };
  
  return JSON.stringify(portableData, null, 2);
}
```

## Data Processing Agreements

### Third-Party Processors
```typescript
const DATA_PROCESSORS = {
  VERCEL: {
    purpose: 'Application hosting',
    data_types: ['usage_logs', 'performance_data'],
    location: 'United States',
    retention: '30 days',
    dpa_signed: true
  },
  SUPABASE: {
    purpose: 'Database hosting',
    data_types: ['user_profiles', 'usage_data', 'billing_data'],
    location: 'United States',
    retention: 'As per our retention policy',
    dpa_signed: true
  },
  STRIPE: {
    purpose: 'Payment processing',
    data_types: ['billing_data', 'payment_methods'],
    location: 'United States',
    retention: '7 years',
    dpa_signed: true
  }
} as const;
```

## Data Security Measures

### Encryption Standards
```typescript
// Data at rest encryption
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-256-GCM',
  keyRotationPeriod: '90 days',
  minimumKeyLength: 32 // bytes
};

// Database encryption
const DATABASE_CONFIG = {
  ssl: true,
  encryption: 'TDE', // Transparent Data Encryption
  backupEncryption: true
};

// API encryption
const API_CONFIG = {
  tls: '1.3',
  cipherSuites: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256'
  ]
};
```

### Access Controls
```typescript
enum DataAccessLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  DELETE = 4,
  ADMIN = 8
}

interface DataAccessPolicy {
  role: string;
  dataType: string;
  accessLevel: DataAccessLevel;
  conditions?: string[];
}

const ACCESS_POLICIES: DataAccessPolicy[] = [
  {
    role: 'user',
    dataType: 'own_profile',
    accessLevel: DataAccessLevel.READ | DataAccessLevel.WRITE
  },
  {
    role: 'user',
    dataType: 'own_usage_data',
    accessLevel: DataAccessLevel.READ
  },
  {
    role: 'admin',
    dataType: 'anonymized_metrics',
    accessLevel: DataAccessLevel.READ
  },
  {
    role: 'super_admin',
    dataType: 'user_profiles',
    accessLevel: DataAccessLevel.READ | DataAccessLevel.WRITE,
    conditions: ['with_user_consent', 'legal_basis']
  }
];
```

## Privacy Impact Assessments

### New Feature Assessment
```typescript
interface PrivacyImpactAssessment {
  feature: string;
  dataTypes: string[];
  processingPurpose: string;
  legalBasis: string;
  riskLevel: 'low' | 'medium' | 'high';
  mitigations: string[];
  reviewDate: Date;
}

// Example PIA for new analytics feature
const analyticsFeaturePIA: PrivacyImpactAssessment = {
  feature: 'Advanced Usage Analytics',
  dataTypes: ['usage_patterns', 'feature_adoption', 'performance_metrics'],
  processingPurpose: 'Product improvement and optimization',
  legalBasis: 'Legitimate interest',
  riskLevel: 'medium',
  mitigations: [
    'Data aggregation and anonymization',
    'Opt-out mechanism for users',
    'Regular data purging',
    'Access controls and audit logging'
  ],
  reviewDate: new Date('2025-07-14')
};
```

## Monitoring & Compliance

### Data Access Auditing
```typescript
async function logDataAccess(
  userId: string,
  dataType: string,
  action: string,
  accessor: string
): Promise<void> {
  await db('data_access_logs').insert({
    user_id: userId,
    data_type: dataType,
    action: action,
    accessed_by: accessor,
    timestamp: new Date(),
    ip_address: getCurrentRequestIP()
  });
}

// Usage
await logDataAccess(
  user.id,
  'user_profile',
  'read',
  'admin_dashboard'
);
```

### Compliance Reporting
```typescript
class ComplianceReporter {
  async generateMonthlyReport(): Promise<ComplianceReport> {
    const [accessStats, deletionStats, dataBreaches] = await Promise.all([
      this.getDataAccessStats(),
      this.getDataDeletionStats(),
      this.getSecurityIncidents()
    ]);
    
    return {
      period: this.getCurrentMonth(),
      data_access_requests: accessStats.requests,
      data_deletion_requests: deletionStats.requests,
      security_incidents: dataBreaches.length,
      compliance_status: 'compliant',
      recommendations: this.generateRecommendations(accessStats, deletionStats)
    };
  }
}
```

---
*Follow these governance standards to ensure responsible data handling at meterr.ai*