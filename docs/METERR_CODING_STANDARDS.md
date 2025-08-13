# METERR Coding Standards

## Core Principles

For meterr.ai, accuracy and security are paramount - we handle financial data and API keys worth thousands of dollars.

## TypeScript Rules

### Strict Type Safety
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

### String Handling
```typescript
// ❌ Never concatenate
const message = 'Hello ' + name;
const url = baseUrl + '/' + endpoint;

// ✅ Always use templates or join
const message = `Hello ${name}`;
const url = [baseUrl, endpoint].join('/');
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

## File Naming

```
token-counter.ts         # Kebab-case for files
TokenCounter.tsx         # PascalCase for components
useTokenCounter.ts       # Camel-case for hooks
token-counter.test.ts    # Test files with .test
```

## Git Commit Messages

```bash
feat: Add token counting for Claude models
fix: Correct cost calculation precision
docs: Update API documentation
test: Add token accuracy tests
refactor: Optimize database queries
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

---

*For implementation examples, see `.claude/context/METERR_CODING_STANDARDS.md`*