# meterr.ai Coding Standards
*Updated: 2025-08-13*

## Core Rules

### 1. **No Placeholders**
Every function must be fully implemented. No TODOs in production code.

### 2. **TypeScript Strict Mode**
```typescript
// ❌ Never
function process(data: any) { }
const value = obj!.prop;
const num = str as unknown as number;

// ✅ Always
function process(data: UserData) { }
const value = obj?.prop ?? defaultValue;
const num = parseInt(str, 10);
```

### 3. **String Handling**
```typescript
// ❌ Never
const msg = 'text' + variable;

// ✅ Always  
const msg = `text ${variable}`;
const path = [dir, file].join("/");
```

### 4. **Error Handling**
```typescript
// Every async function needs try/catch
async function fetchData(): Promise<Result<Data, Error>> {
  try {
    const data = await api.get();
    return Result.ok(data);
  } catch (error) {
    logger.error("Fetch failed", { error });
    return Result.err(new AppError("Failed to fetch data"));
  }
}
```

### 5. **Documentation**
```typescript
/**
 * Calculate token usage cost
 * @param tokens - Number of tokens used
 * @param model - AI model name
 * @returns Cost in USD with 6 decimal precision
 */
function calculateCost(tokens: number, model: string): number {
  // Implementation
}
```

## Project-Specific Rules

### API Routes
All API routes must:
- Validate input with Zod
- Authenticate requests
- Include rate limiting
- Return consistent error formats

### Token Tracking
- Use BigNumber for cost calculations (financial precision)
- Verify counts against provider APIs
- Cache pricing data (1 hour TTL)

### Security
- Never log API keys
- Encrypt sensitive data at rest
- Mask keys in UI: `sk-proj-...abc123`
- Use environment variables for secrets

## File Structure

```
component-name.tsx       # Component file
component-name.test.tsx  # Test file
use-component-name.ts    # Hook file
types.ts                # Local types
```

## Testing Requirements

- Unit tests for all utilities
- Integration tests for API routes
- Accuracy tests for token counting
- Performance benchmarks for critical paths

## Pre-Commit Checklist

- [ ] No `any` types
- [ ] No hardcoded secrets
- [ ] Error handling implemented
- [ ] Tests written
- [ ] Documentation complete

## Quick Reference

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Test
pnpm test

# All checks
pnpm pre-commit
```