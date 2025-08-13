# METERR Coding Standards

## Core Principles

For meterr.ai, accuracy and security are paramount - we handle financial data and API keys worth thousands of dollars.

## TypeScript Standards

### Basic Type Safety
```typescript
// ❌ Never use these
function process(data: any) { }          // No 'any' types
const value = obj!.prop;                 // No non-null assertions
const num = str as unknown as number;    // No double casting

// ✅ Always use proper types
function process(data: TokenData) { }
const value = obj?.prop ?? defaultValue;
const num = Number.parseInt(str, 10);
```

### Modern TypeScript Patterns

#### Type Inference with `satisfies`
```typescript
// ❌ Type assertion loses type safety
const config = {
  port: 3000,
  host: 'localhost'
} as Config;

// ✅ satisfies validates while preserving literal types
const config = {
  port: 3000,
  host: 'localhost'
} satisfies Config;
// config.port is literally 3000, not just number
```

#### Const Assertions for Immutability
```typescript
// ❌ Mutable and wide types
const MODELS = ['gpt-4', 'claude-3'];  // string[]

// ✅ Immutable with literal types
const MODELS = ['gpt-4', 'claude-3'] as const;  // readonly ['gpt-4', 'claude-3']
type Model = typeof MODELS[number];  // 'gpt-4' | 'claude-3'
```

#### Utility Types for Type Transformation
```typescript
// Core utility types we use
interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Partial: All properties optional
type UserUpdate = Partial<User>;

// Pick: Select specific properties
type UserPublic = Pick<User, 'id' | 'email'>;

// Omit: Exclude specific properties
type UserSafe = Omit<User, 'password'>;

// Required: Make all properties required
type UserComplete = Required<UserUpdate>;

// Readonly: Make all properties immutable
type UserFrozen = Readonly<User>;
```

#### Discriminated Unions for State Management
```typescript
// ✅ Use discriminated unions for complex state
type RequestState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TokenData }
  | { status: 'error'; error: Error };

function handleState(state: RequestState) {
  switch (state.status) {
    case 'success':
      return state.data;  // TypeScript knows data exists
    case 'error':
      return state.error; // TypeScript knows error exists
  }
}
```

#### Branded Types for Domain Safety
```typescript
// ✅ Prevent mixing up primitive types
type UserId = string & { __brand: 'UserId' };
type ApiKey = string & { __brand: 'ApiKey' };

function createUserId(id: string): UserId {
  return id as UserId;
}

// Now you can't accidentally pass ApiKey where UserId is expected
function getUser(id: UserId) { /* ... */ }
```

#### Template Literal Types for String Patterns
```typescript
// ✅ Type-safe string patterns
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiRoute = `/api/${string}`;
type Endpoint = `${HttpMethod} ${ApiRoute}`;

const endpoint: Endpoint = 'GET /api/tokens';  // Type-safe
```

#### Generic Constraints for Flexible Functions
```typescript
// ✅ Flexible but constrained generics
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Type inference works perfectly
const user = { id: '123', name: 'Alice' };
const id = getProperty(user, 'id');  // string
const name = getProperty(user, 'name');  // string
```

#### Advanced Error Handling with Result Type
```typescript
// ✅ Explicit error handling
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

async function fetchTokenData(): Promise<Result<TokenData>> {
  try {
    const data = await api.getTokens();
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// Usage forces error handling
const result = await fetchTokenData();
if (result.ok) {
  console.log(result.value);  // TypeScript knows value exists
} else {
  console.error(result.error); // TypeScript knows error exists
}
```

## String Handling

```typescript
// ❌ Never concatenate
const message = 'Hello ' + name;
const url = baseUrl + '/' + endpoint;

// ✅ Always use templates or join
const message = `Hello ${name}`;
const url = [baseUrl, endpoint].join('/');
```

## Async/Promise Patterns

### Promise Composition
```typescript
// ✅ Proper promise error handling
async function processMultipleProviders(providers: string[]) {
  // Parallel processing with individual error handling
  const results = await Promise.allSettled(
    providers.map(provider => fetchProviderData(provider))
  );
  
  const successful = results
    .filter((r): r is PromiseFulfilledResult<Data> => r.status === 'fulfilled')
    .map(r => r.value);
    
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason);
    
  return { successful, failed };
}
```

### Async Generators for Streaming
```typescript
// ✅ Stream large datasets
async function* streamTokens(userId: string) {
  let offset = 0;
  const limit = 100;
  
  while (true) {
    const batch = await fetchTokenBatch(userId, offset, limit);
    if (batch.length === 0) break;
    
    for (const token of batch) {
      yield token;
    }
    
    offset += limit;
  }
}

// Usage
for await (const token of streamTokens(userId)) {
  processToken(token);
}
```

## React + TypeScript Patterns

### Component Typing
```typescript
// ✅ Properly typed functional components
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant, 
  onClick, 
  children 
}) => {
  return (
    <button className={styles[variant]} onClick={onClick}>
      {children}
    </button>
  );
};
```

### Hook Typing
```typescript
// ✅ Properly typed custom hooks
function useTokenData<T extends TokenProvider>(
  provider: T
): {
  data: TokenData<T> | null;
  loading: boolean;
  error: Error | null;
} {
  const [state, setState] = useState<{
    data: TokenData<T> | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null
  });
  
  // Implementation...
  return state;
}
```

## Code Completeness

### No Placeholders
```typescript
// ❌ Never commit TODOs
function calculateCost() {
  // TODO: implement this
  throw new Error("Not implemented");
}

// ✅ Always complete implementations
function calculateCost(tokens: number, model: string): number {
  const rate = getRateForModel(model);
  return tokens * rate / 1000;
}
```

## Error Handling

### Financial Calculations
```typescript
// Cost calculations need precision
import { BigNumber } from 'bignumber.js';

function calculateCost(tokens: number, rate: number): string {
  const cost = new BigNumber(tokens)
    .multipliedBy(rate)
    .dividedBy(1000)
    .toFixed(6); // Always 6 decimal places
  
  return cost;
}
```

### API Error Handling
```typescript
// Every API route needs proper error handling
export async function POST(request: Request) {
  try {
    // Validate input
    const data = await request.json();
    const validated = schema.parse(data);
    
    // Process request
    const result = await processRequest(validated);
    
    return NextResponse.json(result);
  } catch (error) {
    // Never expose internal errors
    logger.error('Request failed', { error });
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
```

## Security Standards

### API Key Protection
```typescript
// ❌ Never log keys
console.log(`Using key: ${apiKey}`);

// ✅ Always mask sensitive data
console.log(`Using key: ${maskKey(apiKey)}`); // sk-...xxx

function maskKey(key: string): string {
  if (key.length < 8) return '****';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
```

### Input Validation
```typescript
// Always validate with Zod
import { z } from 'zod';

const schema = z.object({
  text: z.string().max(100000),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3']),
  provider: z.enum(['openai', 'anthropic'])
});

// Use in API routes
const validated = schema.parse(requestBody);
```

## Documentation

### Function Documentation
```typescript
/**
 * Calculate token usage cost for a specific model
 * @param tokens - Number of tokens used
 * @param model - AI model identifier
 * @param provider - Service provider name
 * @returns Cost in USD with 6 decimal precision
 * @throws {InvalidModelError} If model is not supported
 */
export function calculateTokenCost(
  tokens: number,
  model: string,
  provider: AIProvider
): number {
  // Implementation
}
```

## Testing Requirements

### Critical Functions
```typescript
// Token counting must be 99.9% accurate
describe('Token Counter', () => {
  it('should match OpenAI tokenizer exactly', () => {
    const text = 'Hello, world!';
    const count = countTokens(text, 'gpt-4');
    expect(count).toBe(4); // Verified with OpenAI
  });
});
```

For testing commands and patterns, see [Testing Guide](./METERR_TESTING.md)

## File Organization

### Naming Conventions
```
token-counter.ts         # Kebab-case for files
TokenCounter.tsx         # PascalCase for components
useTokenCounter.ts       # Camel-case for hooks
token-counter.test.ts    # Test files with .test
TOKEN_CONSTANTS.ts       # UPPER_CASE for constants files
```

### Folder Structure
```
components/
├── TokenCounter/
│   ├── TokenCounter.tsx      # Component
│   ├── TokenCounter.test.tsx  # Tests
│   ├── useTokenCounter.ts    # Hook
│   ├── types.ts              # Local types
│   └── index.ts              # Exports
```

## Git Commit Messages

```bash
feat: Add token counting for Claude models
fix: Correct cost calculation precision
docs: Update API documentation
test: Add token accuracy tests
refactor: Optimize database queries
chore: Update dependencies
style: Format code with Prettier
perf: Improve query performance
```

## Project-Specific Patterns

### API Route Structure
```typescript
// All API routes follow this pattern
export async function POST(request: Request) {
  // 1. Authenticate
  const session = await authenticate(request);
  if (!session) return unauthorized();
  
  // 2. Validate
  const data = schema.parse(await request.json());
  
  // 3. Process
  const result = await businessLogic(data);
  
  // 4. Return
  return NextResponse.json(result);
}
```

### Component Structure
```typescript
// All components follow this pattern
export function Component({ prop1, prop2 }: Props) {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {}, []);
  
  // 3. Handlers
  const handleClick = () => {};
  
  // 4. Render
  return <div>...</div>;
}
```

## Performance Guidelines

### Database Queries
- Use indexes for frequent queries
- Limit result sets with pagination
- Use connection pooling
- Cache expensive calculations

### React Components
- Memoize expensive computations
- Use React.memo for pure components
- Implement virtual scrolling for lists
- Lazy load heavy components

## Pre-Commit Checklist

Before committing code:

- [ ] No `any` types used
- [ ] No hardcoded secrets
- [ ] All functions documented
- [ ] Error cases handled
- [ ] Tests written for new features
- [ ] No console.log statements
- [ ] API keys masked in logs
- [ ] Input validation present
- [ ] Used proper TypeScript patterns
- [ ] No type assertions where inference works

---

*For quick reference and enforcement rules, see `.claude/context/METERR_CODING_STANDARDS.md`*