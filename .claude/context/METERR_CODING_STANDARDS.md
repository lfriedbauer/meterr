# meterr.ai Coding Standards - Claude Context
*Updated: 2025-08-13*

## Quick Reference Commands

```bash
pnpm typecheck    # Type checking
pnpm lint         # Linting
pnpm test         # Testing
pnpm pre-commit   # All checks
```

## Core Rules Checklist

### ✅ MUST DO
- [ ] Complete all function implementations (no TODOs)
- [ ] Use strict TypeScript (no `any`, no `!`, no double casting)
- [ ] Validate all inputs with Zod
- [ ] Handle all errors with try/catch
- [ ] Document all public functions
- [ ] Mask API keys in logs
- [ ] Use BigNumber for financial calculations

### ❌ NEVER DO
- [ ] Log API keys or sensitive data
- [ ] Use string concatenation (use template literals)
- [ ] Commit hardcoded secrets
- [ ] Use type assertions where inference works
- [ ] Leave console.log statements
- [ ] Skip input validation
- [ ] Expose internal errors to users

## TypeScript Patterns to Enforce

### Modern Patterns Required

```typescript
// ✅ ENFORCE: satisfies for type validation
const config = { port: 3000 } satisfies Config;

// ✅ ENFORCE: const assertions
const MODELS = ['gpt-4', 'claude-3'] as const;

// ✅ ENFORCE: utility types
type UserPublic = Pick<User, 'id' | 'email'>;
type UserSafe = Omit<User, 'password'>;

// ✅ ENFORCE: discriminated unions
type State = 
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };

// ✅ ENFORCE: branded types for domain primitives
type UserId = string & { __brand: 'UserId' };
type ApiKey = string & { __brand: 'ApiKey' };

// ✅ ENFORCE: Result type for errors
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };
```

### Anti-Patterns to Flag

```typescript
// ❌ FLAG: any type
function process(data: any) { }

// ❌ FLAG: non-null assertion
const value = obj!.prop;

// ❌ FLAG: double casting
const num = str as unknown as number;

// ❌ FLAG: string concatenation
const msg = 'Hello ' + name;

// ❌ FLAG: missing error handling
async function fetch() {
  return await api.get(); // No try/catch
}

// ❌ FLAG: type assertion instead of satisfies
const config = { port: 3000 } as Config;
```

## Project-Specific Patterns

### API Route Pattern
```typescript
export async function POST(request: Request) {
  // 1. Authenticate
  // 2. Validate with Zod
  // 3. Process
  // 4. Return NextResponse.json()
}
```

### Token Tracking Rules
- BigNumber for costs (6 decimal precision)
- Cache pricing (1 hour TTL)
- GPU acceleration for >10k tokens
- Verify against provider APIs

### Security Enforcement
```typescript
// Mask keys: sk-proj-...abc123
function maskKey(key: string): string {
  return `${key.slice(0,6)}...${key.slice(-4)}`;
}

// Parameterized queries only
db.query("SELECT * FROM users WHERE id = $1", [userId]);
```

## File Structure

```
component-name.tsx       # Component
component-name.test.tsx  # Test
use-component-name.ts    # Hook
types.ts                # Types
```

## Validation Schema

```typescript
// Required for all API inputs
const schema = z.object({
  text: z.string().max(100000),
  model: z.enum(['gpt-4', 'claude-3']),
  provider: z.enum(['openai', 'anthropic'])
});
```

## Error Response Format

```typescript
// Consistent error structure
return NextResponse.json(
  { error: 'User-friendly message' },
  { status: 400 }
);
```

## Testing Requirements

### Coverage Targets
- Token counting: 99.9% accuracy
- API routes: 100% coverage
- Financial calculations: 100% coverage
- Security functions: 100% coverage

### Test Pattern
```typescript
describe('Component', () => {
  it('should handle success case', () => {});
  it('should handle error case', () => {});
  it('should validate input', () => {});
});
```

## Performance Rules

- Parallel processing with Promise.allSettled
- Stream large datasets with async generators
- Memoize expensive React computations
- Use indexes on frequent queries
- Connection pooling for database

## Git Commit Format

```
feat: Add feature
fix: Fix bug
docs: Update docs
test: Add tests
refactor: Refactor code
perf: Improve performance
chore: Update deps
```

## Pre-Commit Validation

Run these checks before EVERY commit:
1. `pnpm typecheck` - No TypeScript errors
2. `pnpm lint` - No linting errors
3. `pnpm test` - All tests pass
4. No hardcoded secrets
5. No console.log statements

---

*This is your enforcement checklist. For detailed explanations, see `/docs/METERR_CODING_STANDARDS.md`*