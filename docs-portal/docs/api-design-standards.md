---
title: API Design Standards
description: REST/GraphQL patterns, versioning, and rate limits for meterr.ai
audience: ["human", "ai"]
status: ready
last_updated: 2025-01-14
owner: engineering
---

# API Design Standards

<!-- audience: human -->
## Overview

This document defines the API design standards for meterr.ai, ensuring consistency, scalability, and developer experience across all endpoints.

## REST API Conventions

### URL Structure
```
https://api.meterr.ai/v1/{resource}/{id}/{sub-resource}
```

**Examples**:
- `GET /v1/users/123/tokens` - Get user's tokens
- `POST /v1/smart-router/route` - Route AI request
- `PUT /v1/users/123/settings` - Update user settings

### HTTP Methods
- **GET**: Retrieve data (idempotent)
- **POST**: Create new resources or actions
- **PUT**: Replace entire resource (idempotent)
- **PATCH**: Partial resource updates
- **DELETE**: Remove resource (idempotent)

### Status Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

<!-- /audience -->

<!-- audience: ai -->
## API Implementation Standards

### Request/Response Format
```typescript
// Standard request wrapper
interface APIRequest<T = unknown> {
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
  };
}

// Standard response wrapper
interface APIResponse<T = unknown> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

// Error response
interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  requestId: string;
}
```

### Route Structure Pattern
```typescript
// All API routes follow this structure
export async function POST(request: Request) {
  const requestId = generateRequestId();
  
  try {
    // 1. Authentication
    const auth = await authenticate(request);
    if (!auth.ok) return unauthorized(requestId);
    
    // 2. Rate limiting
    const rateLimit = await checkRateLimit(auth.user.id);
    if (!rateLimit.ok) return rateLimited(requestId);
    
    // 3. Validation
    const body = await request.json();
    const validation = schema.safeParse(body.data);
    if (!validation.success) {
      return badRequest(validation.error.message, requestId);
    }
    
    // 4. Business logic
    const result = await businessLogic(validation.data, auth.user);
    if (!result.ok) return handleError(result.error, requestId);
    
    // 5. Response
    return NextResponse.json({
      data: result.value,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
    
  } catch (error) {
    logger.error('Unhandled error', { error, requestId });
    return internalError(requestId);
  }
}
```
<!-- /audience -->

## Rate Limiting

### Standard Limits
- **Free tier**: 100 requests/minute
- **Pro tier**: 1000 requests/minute  
- **Enterprise**: Custom limits

### Implementation
```typescript
const RATE_LIMITS = {
  free: { requests: 100, window: 60 * 1000 },
  pro: { requests: 1000, window: 60 * 1000 },
  enterprise: { requests: 10000, window: 60 * 1000 }
} as const;

async function checkRateLimit(userId: string): Promise<Result<boolean>> {
  const key = `rate_limit:${userId}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  const userTier = await getUserTier(userId);
  const limit = RATE_LIMITS[userTier];
  
  if (current > limit.requests) {
    return Err(new Error('RATE_LIMIT_EXCEEDED'));
  }
  
  return Ok(true);
}
```

### Rate Limit Headers
```typescript
// Include in all responses
const headers = {
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '950', 
  'X-RateLimit-Reset': '1642694400'
};
```

## Versioning Strategy

### URL Versioning
- Current: `/v1/` in all endpoints
- Future: `/v2/` for breaking changes
- Deprecation: 6-month notice period

### Backward Compatibility
```typescript
// Support multiple versions in same handler
export async function POST(request: Request) {
  const version = request.nextUrl.pathname.split('/')[1]; // v1, v2
  
  switch (version) {
    case 'v1':
      return handleV1(request);
    case 'v2':
      return handleV2(request);
    default:
      return badRequest('Unsupported API version');
  }
}
```

## Authentication & Security

### API Key Authentication
```typescript
// Header format
Authorization: Bearer sk-meterr_live_1234567890abcdef

// Validation
async function authenticate(request: Request): Promise<Result<User>> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer sk-meterr_')) {
    return Err(new Error('AUTH_INVALID_TOKEN'));
  }
  
  const apiKey = authHeader.replace('Bearer ', '');
  const user = await validateApiKey(apiKey);
  
  if (!user) {
    return Err(new Error('AUTH_INVALID_TOKEN'));
  }
  
  return Ok(user);
}
```

### Input Validation
```typescript
import { z } from 'zod';

// Define schemas for all inputs
const TokenRouteSchema = z.object({
  text: z.string().max(100000),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3']),
  provider: z.enum(['openai', 'anthropic', 'google']).optional(),
  maxTokens: z.number().min(1).max(4000).optional()
});

// Use in handlers
const validation = TokenRouteSchema.safeParse(requestData);
if (!validation.success) {
  return badRequest(validation.error.message, requestId);
}
```

## Pagination Standards

### Request Parameters
```typescript
interface PaginationParams {
  page?: number;    // Default: 1
  limit?: number;   // Default: 50, Max: 100
  cursor?: string;  // For cursor-based pagination
}
```

### Response Format
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}
```

### Implementation
```typescript
async function paginateResults<T>(
  query: QueryBuilder<T>,
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const offset = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    query.offset(offset).limit(limit).execute(),
    query.count().execute()
  ]);
  
  return {
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: page > 1
    }
  };
}
```

## Error Handling Standards

### Consistent Error Format
```typescript
// All errors follow this structure
interface APIError {
  error: string;      // Human-readable message
  code: string;       // Machine-readable code
  field?: string;     // For validation errors
  details?: Record<string, unknown>;  // Additional context (dev only)
  requestId: string;  // For debugging
}
```

### Error Response Helpers
```typescript
function badRequest(message: string, requestId: string, field?: string) {
  return NextResponse.json({
    error: message,
    code: 'VALIDATION_ERROR',
    field,
    requestId
  }, { status: 400 });
}

function unauthorized(requestId: string) {
  return NextResponse.json({
    error: 'Authentication required',
    code: 'AUTH_REQUIRED',
    requestId
  }, { status: 401 });
}

function rateLimited(requestId: string) {
  return NextResponse.json({
    error: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED', 
    requestId
  }, { status: 429 });
}
```

## Testing Standards

### API Test Structure
```typescript
describe('POST /v1/smart-router/route', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: testUser });
    mockRateLimit.mockResolvedValue({ ok: true });
  });
  
  it('should route request successfully', async () => {
    const response = await request(app)
      .post('/v1/smart-router/route')
      .set('Authorization', `Bearer ${validApiKey}`)
      .send({
        data: {
          text: 'Hello world',
          model: 'gpt-4'
        }
      });
      
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.meta.requestId).toBeDefined();
  });
  
  it('should handle authentication errors', async () => {
    const response = await request(app)
      .post('/v1/smart-router/route')
      .send({ data: {} });
      
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_REQUIRED');
  });
});
```

## Documentation Standards

### OpenAPI Specification
```yaml
/v1/smart-router/route:
  post:
    summary: Route AI request to optimal provider
    parameters:
      - name: Authorization
        in: header
        required: true
        schema:
          type: string
          example: "Bearer sk-meterr_live_..."
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              data:
                type: object
                properties:
                  text:
                    type: string
                    maxLength: 100000
                  model:
                    type: string
                    enum: [gpt-4, gpt-3.5-turbo, claude-3]
    responses:
      200:
        description: Successfully routed request
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RouteResponse'
```

## Performance Standards

### Response Time Targets
- **Authentication**: <50ms
- **Simple queries**: <200ms
- **Complex calculations**: <500ms
- **AI provider routing**: <1000ms

### Optimization Techniques
```typescript
// Response compression
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

// Cache frequently accessed data
const cache = new Map();

async function getCachedUserSettings(userId: string) {
  const cacheKey = `settings:${userId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const settings = await fetchUserSettings(userId);
  cache.set(cacheKey, settings);
  
  // Expire after 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return settings;
}
```

---
*These standards ensure consistent, scalable API design across meterr.ai*