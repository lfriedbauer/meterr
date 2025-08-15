---
title: Error Handling Playbook
description: Error codes, recovery strategies, and Result patterns for meterr.ai
audience: ["ai"]
status: ready
last_updated: 2025-08-15
owner: engineering
---

# Error Handling Playbook

<!-- audience: ai -->
## Error Response Standards

### API Error Format
```typescript
interface ErrorResponse {
  error: string;           // User-friendly message
  code: string;           // Machine-readable code
  details?: string;       // Optional debug info (dev only)
  requestId: string;      // For support tracking
}
```

### Standard Error Codes

#### Authentication Errors
- `AUTH_INVALID_TOKEN` → "Invalid or expired token"
- `AUTH_MISSING_TOKEN` → "Authentication required" 
- `AUTH_INSUFFICIENT_SCOPE` → "Insufficient permissions"

#### Validation Errors
- `VALIDATION_INVALID_INPUT` → "Invalid request data"
- `VALIDATION_MISSING_FIELD` → "Required field missing: {field}"
- `VALIDATION_INVALID_FORMAT` → "Invalid format for {field}"

#### Business Logic Errors
- `USAGE_LIMIT_EXCEEDED` → "API usage limit exceeded"
- `INSUFFICIENT_CREDITS` → "Insufficient credits for request"
- `PROVIDER_UNAVAILABLE` → "AI provider temporarily unavailable"

#### System Errors
- `INTERNAL_ERROR` → "Internal server error"
- `EXTERNAL_SERVICE_ERROR` → "External service unavailable"
- `RATE_LIMIT_EXCEEDED` → "Too many requests"

### Recovery Strategies

#### Automatic Retry
```typescript
const RETRY_CODES = [
  'EXTERNAL_SERVICE_ERROR',
  'RATE_LIMIT_EXCEEDED',
  'PROVIDER_UNAVAILABLE'
];

async function withRetry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) break;
      if (!RETRY_CODES.includes(error.code)) break;
      
      await delay(Math.pow(2, attempt) * 1000); // Exponential backoff
    }
  }
  
  throw lastError;
}
```

#### Fallback Providers
```typescript
async function routeWithFallback(request: AIRequest): Promise<AIResponse> {
  const providers = ['openai', 'anthropic', 'google'];
  
  for (const provider of providers) {
    try {
      return await callProvider(provider, request);
    } catch (error) {
      if (error.code === 'PROVIDER_UNAVAILABLE') {
        continue; // Try next provider
      }
      throw error; // Don't fallback for other errors
    }
  }
  
  throw new Error('All providers unavailable');
}
```

## Result Pattern Implementation

### Result Type Definition
```typescript
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

### Usage in API Routes
```typescript
export async function POST(request: Request): Promise<Response> {
  const result = await processTokenRequest(request);
  
  if (!result.ok) {
    logger.error('Token processing failed', { 
      error: result.error,
      requestId: request.headers.get('x-request-id')
    });
    
    return NextResponse.json(
      {
        error: getUserMessage(result.error.code),
        code: result.error.code,
        requestId: request.headers.get('x-request-id')
      },
      { status: getHttpStatus(result.error.code) }
    );
  }
  
  return NextResponse.json(result.value);
}
```

### Error Chain Propagation
```typescript
async function processTokenRequest(request: Request): Promise<Result<TokenData>> {
  const authResult = await authenticate(request);
  if (!authResult.ok) return Err(authResult.error);
  
  const validationResult = validateInput(await request.json());
  if (!validationResult.ok) return Err(validationResult.error);
  
  const tokenResult = await calculateTokens(validationResult.value);
  if (!tokenResult.ok) return Err(tokenResult.error);
  
  return Ok(tokenResult.value);
}
```

## Error Logging Standards

### Log Levels
- `ERROR`: System errors, failed requests
- `WARN`: Degraded performance, fallback usage
- `INFO`: Normal operations, user actions
- `DEBUG`: Detailed execution flow (dev only)

### Structured Logging
```typescript
logger.error('Token calculation failed', {
  userId: maskUserId(userId),
  model: request.model,
  provider: request.provider,
  error: error.message,
  stack: error.stack,
  requestId,
  timestamp: new Date().toISOString()
});
```

### Security in Logs
- **Never log**: API keys, passwords, PII
- **Always mask**: User IDs (first 8 chars), email domains
- **Include**: Request IDs for support tracing
- **Sanitize**: User input before logging

## User-Facing Messages

### Message Guidelines
- **Clear**: Explain what happened
- **Actionable**: Tell user what to do
- **Professional**: Maintain brand voice
- **Helpful**: Include next steps

### Message Templates
```typescript
const USER_MESSAGES = {
  AUTH_INVALID_TOKEN: "Your session has expired. Please sign in again.",
  USAGE_LIMIT_EXCEEDED: "You've reached your monthly usage limit. Upgrade your plan to continue.",
  PROVIDER_UNAVAILABLE: "AI service temporarily unavailable. Please try again in a few minutes.",
  VALIDATION_INVALID_INPUT: "Please check your input and try again.",
  INTERNAL_ERROR: "Something went wrong on our end. We've been notified and are fixing it."
};
```

## Testing Error Scenarios

### Unit Tests
```typescript
describe('Error Handling', () => {
  it('should return proper error for invalid token', async () => {
    const result = await processRequest(invalidTokenRequest);
    
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('AUTH_INVALID_TOKEN');
  });
  
  it('should retry on provider failures', async () => {
    mockProvider.mockRejectedValueOnce({ code: 'PROVIDER_UNAVAILABLE' });
    mockProvider.mockResolvedValueOnce({ data: 'success' });
    
    const result = await withRetry(() => mockProvider());
    expect(result).toEqual({ data: 'success' });
    expect(mockProvider).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Tests
```typescript
describe('API Error Handling', () => {
  it('should handle provider downtime gracefully', async () => {
    // Mock all providers as down
    mockAllProviders({ status: 503 });
    
    const response = await request(app)
      .post('/api/smart-router')
      .send(validRequest);
      
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('PROVIDER_UNAVAILABLE');
  });
});
```

## Monitoring & Alerting

### Error Rate Thresholds
- **Critical**: >5% error rate for 5 minutes
- **Warning**: >2% error rate for 10 minutes
- **Info**: New error codes detected

### Metrics to Track
- Error rate by endpoint
- Error rate by provider
- Response time percentiles during errors
- Retry success rates

---
*Follow these patterns for consistent error handling across meterr.ai*