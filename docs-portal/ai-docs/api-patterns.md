# API Patterns

## Response Format
```typescript
// Success
{ success: true, data: T }

// Error  
{ success: false, error: { code: string, message: string } }
```

## Validation
```typescript
const Schema = z.object({...});
const parsed = Schema.safeParse(body);
if (!parsed.success) return 400;
```

## Authentication
```typescript
const session = await auth();
if (!session) return 401;
```

## Error Handling
```typescript
try {
  const result = await operation();
  if (!result.ok) return 500;
  return { success: true, data: result.value };
} catch (error) {
  logger.error('Operation failed', { error });
  return { success: false, error };
}
```

## Endpoints Structure
- POST /api/customers - Create
- GET /api/customers/[id] - Read
- PATCH /api/customers/[id] - Update
- DELETE /api/customers/[id] - Delete

## Rate Limiting
- 100 requests/minute per IP
- 1000 requests/hour per user