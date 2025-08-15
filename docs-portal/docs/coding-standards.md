---
title: Coding Standards
sidebar_label: Coding Standards
sidebar_position: 4
audience: ["human", "ai"]
description: "METERR Coding Standards documentation for Meterr.ai"

---

# METERR Coding Standards

<!-- audience: human -->
## Overview (Detailed)

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
<!-- /audience -->

<!-- audience: ai -->
## Overview (Concise)

# meterr.ai Coding Standards - Claude Context
*Updated: 2025-08-15*

## Quick Reference Commands

```bash
pnpm typecheck    # Type checking
pnpm lint         # Linting
pnpm test         # Testing
pnpm pre-commit   # All checks
<!-- /audience -->

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
  logger.info('Token data fetched', { value: result.value });  // TypeScript knows value exists
} else {
  logger.error('Failed to fetch token data', { error: result.error }); // TypeScript knows error exists
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
logger.error(`Using key: ${apiKey}`); // NEVER DO THIS

// ✅ Always mask sensitive data
logger.info(`Using key: ${maskKey(apiKey)}`); // sk-...xxx

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

For testing commands and patterns, see [Testing Guide](./testing-guide.md)

## File Organization

### Naming Conventions

#### Files and Directories
```
# Files
token-counter.ts         # kebab-case for regular TS files
TokenCounter.tsx         # PascalCase for React components
useTokenCounter.ts       # camelCase with 'use' prefix for hooks
token-counter.test.ts    # .test.ts for unit tests
token-counter.spec.ts    # .spec.ts for integration tests
token-counter.e2e.ts     # .e2e.ts for end-to-end tests
TOKEN_CONSTANTS.ts       # UPPER_CASE for constants files
token.types.ts           # .types.ts for type definitions
token.schema.ts          # .schema.ts for Zod schemas
token.utils.ts           # .utils.ts for utility functions

# Directories
/components              # React components
/hooks                   # Custom React hooks
/utils                   # Utility functions
/lib                     # Core business logic
/services                # External service integrations
/types                   # TypeScript type definitions
/schemas                 # Validation schemas
/constants               # Application constants
/__tests__               # Test files (alternative to co-location)
/features                # Feature-based organization
```

#### Variables and Functions
```typescript
// Variables
const maxTokens = 1000;           // camelCase for variables
const MAX_RETRIES = 3;            // UPPER_SNAKE_CASE for constants
let isLoading = false;            // boolean prefix: is, has, should
const userTokens: TokenData[];    // plural for arrays/collections

// Functions
function calculateCost() {}       // camelCase for functions
function getUserTokens() {}       // verb prefix for actions
function isValidToken() {}        // is/has prefix for boolean returns
async function fetchData() {}     // async functions use action verbs

// React Components
function TokenCounter() {}        // PascalCase for components
const useTokenState = () => {}    // use prefix for hooks
```

#### TypeScript Types and Interfaces
```typescript
// Types and Interfaces
type TokenData = {};              // PascalCase for types
interface ITokenService {}        // Optional 'I' prefix for interfaces
enum TokenStatus {}               // PascalCase for enums
type TokenID = string;            // ID not Id

// Generics
type Response<T> = {};            // Single letter for simple generics
type Map<TKey, TValue> = {};     // T prefix for complex generics

// Props and State
interface TokenCounterProps {}    // Component + Props suffix
interface TokenCounterState {}    // Component + State suffix
```

#### Database and API
```sql
-- Database Tables
users                     -- lowercase, plural
user_tokens              -- snake_case for multi-word
token_usage_history      -- descriptive names

-- Database Columns
id                       -- lowercase
user_id                  -- snake_case with _id suffix for foreign keys
created_at               -- _at suffix for timestamps
is_active                -- is_ prefix for booleans
token_count              -- descriptive names
```

```typescript
// API Endpoints
/api/tokens              // Plural, kebab-case
/api/token-usage         // Kebab-case for multi-word
/api/users/:id/tokens    // RESTful nesting

// API Response Fields
{
  userId: string,        // camelCase in JSON
  tokenCount: number,
  createdAt: string,
  isActive: boolean
}
```

#### Environment Variables
```bash
# .env files
NODE_ENV=production              # UPPER_SNAKE_CASE
DATABASE_URL=postgresql://       # Descriptive prefixes
NEXT_PUBLIC_API_URL=            # NEXT_PUBLIC_ for client-side
OPENAI_API_KEY=                 # Service name prefix
STRIPE_SECRET_KEY=              # _KEY suffix for secrets
REDIS_CONNECTION_STRING=        # _STRING for connections
MAX_TOKENS_PER_USER=            # Business logic constants
```

#### Git and Version Control
```bash
# Branch Names
main                            # Main branch
develop                         # Development branch
feature/token-counting          # feature/ prefix
bugfix/calculation-error        # bugfix/ prefix
hotfix/security-patch          # hotfix/ prefix
release/v1.2.0                 # release/ prefix
chore/update-dependencies      # chore/ prefix

# Tag Names
v1.0.0                         # Semantic versioning
v2.0.0-beta.1                  # Pre-release versions
v1.2.3-hotfix.1               # Hotfix versions

# Commit Message Format
<type>(<scope>): <subject>     # Angular convention

# Types: feat, fix, docs, style, refactor, test, chore
# Scope: api, ui, auth, billing, etc.
# Subject: imperative, present tense
```

#### Documentation
```markdown
# Markdown Files
README.md                      # UPPERCASE for standard files
CONTRIBUTING.md
LICENSE.md
CHANGELOG.md
feature-guide.md               # kebab-case for custom docs

# Code Comments
// TODO: Implement caching     # TODO for tasks
// FIXME: Handle edge case    # FIXME for bugs
// NOTE: Uses OpenAI API      # NOTE for important info
// HACK: Temporary solution   # HACK for workarounds
// @deprecated Use newMethod  # @deprecated for deprecation
```

#### Test Files
```typescript
// Test Descriptions
describe('TokenCounter', () => {           // Component/Class name
  describe('calculateCost()', () => {      // Method name with ()
    it('should return cost in USD', () => {  // 'should' for behavior
    it('returns null when invalid', () => {  // Present tense alternative
    
    // Test data
    const mockUser = {};                   // mock prefix
    const stubAPI = {};                    // stub prefix
    const fakeData = {};                   // fake prefix
    const dummyToken = {};                 // dummy prefix
  });
});
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

## Development Methodology

### Phase-Based Progression Rules

**NEVER use time references in code, documentation, or planning:**
- ❌ "Week X", "Month X", "QX 20XX"
- ❌ "This will take X weeks"
- ❌ "By specific time/date/deadline"
- ❌ "Sprint X-X"
- ❌ Comments like `// TODO: Fix by specific date`

**ALWAYS use phase-based progression:**
- ✅ "Phase 1: MVP (Confidence: 85%)"
- ✅ "Phase 2: Pilot (Confidence: 70%)"
- ✅ "Phase 3: Scale (Confidence: 60%)"
- ✅ Comments like `// TODO: Phase 2 - Add caching`

### Code Organization by Phases

```typescript
// ✅ Phase-based feature flags
const FEATURE_FLAGS = {
  // Phase 1: MVP Features
  BASIC_COST_TRACKING: true,
  SIMPLE_DASHBOARD: true,
  
  // Phase 2: Pilot Features
  ADVANCED_ANALYTICS: false,
  TEAM_COLLABORATION: false,
  
  // Phase 3: Scale Features
  ENTERPRISE_SSO: false,
  CUSTOM_INTEGRATIONS: false
};

// ✅ Phase-based TODO comments
// TODO: Phase 2 - Implement caching layer
// TODO: Phase 3 - Add horizontal scaling

// ❌ Time-based comments
// TODO: Fix by next week
// TODO: Implement before Q2
```

### Confidence-Based Code Quality

```typescript
// High Confidence Code (80-100%)
// - Comprehensive tests
// - Error handling
// - Documentation
// - Performance optimized

export async function calculateCost(tokens: number, model: string): Promise<Result<number>> {
  try {
    // Validated algorithm with 95% test coverage
    const result = await costCalculator.calculate(tokens, model);
    return Ok(result);
  } catch (error) {
    logger.error('Cost calculation failed', { tokens, model, error });
    return Err(error);
  }
}

// Medium Confidence Code (60-79%)
// - Basic tests
// - Some error handling
// - TODO comments for improvements

export function basicTokenCount(text: string): number {
  // TODO: Phase 2 - Replace with more accurate tokenizer
  // Basic implementation, needs validation
  return text.split(/\s+/).length * 1.3; // Rough estimate
}

// Low Confidence Code (<60%)
// - Prototype only
// - No production use
// - Clear warnings

export function experimentalFeature(): never {
  // WARNING: Experimental - do not use in production
  // Confidence: 40% - needs major refactoring
  throw new Error('Feature not ready for production');
}
```

### Phase Gates in Code

```typescript
// Gate review checkpoints in critical functions
export async function deployToProduction(): Promise<void> {
  // Phase Gate Review Required
  const confidence = await assessSystemReadiness();
  
  if (confidence < 80) {
    throw new Error(`Confidence too low: ${confidence}%. Minimum 80% required.`);
  }
  
  // Proceed with deployment
  await executeDeployment();
}

// Feature flag progression
export function enableNextPhaseFeatures(): void {
  const currentPhaseComplete = assessCurrentPhase();
  const confidence = calculateConfidenceLevel();
  
  if (currentPhaseComplete && confidence >= 80) {
    FEATURE_FLAGS.NEXT_PHASE = true;
    logger.info('Phase progression approved', { confidence });
  }
}
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

## Code Hygiene & Startup Realities

### Pre-Launch Essentials (Free, Do Now)
Critical items that cost nothing but prevent disasters:

- **Remove all console statements** - Use proper logging instead
- **Delete commented-out code** - Keep git history, not dead code
- **Remove hardcoded API keys** - Use environment variables
- **Generic error messages** - No stack traces in production
- **Basic rate limiting** - 100 requests/minute minimum
- **Clean /experiments/ and /api/debug/** - Remove dev-only endpoints

### Post-Revenue Improvements ($10K MRR)
Invest in these once revenue justifies the effort:

- **Automated testing suite** - Jest/Playwright setup
- **Error tracking** - Sentry free tier integration
- **Database backups** - Supabase includes daily backups
- **Customer data export** - GDPR compliance preparation

### Scale Considerations ($50K MRR+)
Enterprise-grade improvements for significant revenue:

- **SOC 2 consideration** - ~$30K annual investment
- **Advanced monitoring** - DataDog, New Relic
- **Formal compliance** - HIPAA, SOC 2 implementation

### Financial Accuracy (Critical for meterr)
Never compromise on money calculations:

```typescript
import { BigNumber } from 'bignumber.js';

// ✅ Always use BigNumber for financial calculations
function calculateCost(tokens: number, rate: number): string {
  const cost = new BigNumber(tokens)
    .multipliedBy(rate)
    .dividedBy(1000)
    .toFixed(6); // Always 6 decimal places
  
  // Log for audit trail
  logger.info('Cost calculation', {
    tokens,
    rate,
    cost,
    timestamp: new Date().toISOString()
  });
  
  return cost;
}

// ❌ Never use floating point for money
function wrongCostCalculation(tokens: number, rate: number): number {
  return (tokens * rate) / 1000; // Precision errors!
}
```

## Pre-Commit Checklist

Before committing code:

- [ ] No `any` types used
- [ ] No hardcoded secrets
- [ ] All functions documented
- [ ] Error cases handled
- [ ] Tests written for new features
- [ ] No console statements (use logger)
- [ ] API keys masked in logs
- [ ] Input validation present
- [ ] Used proper TypeScript patterns
- [ ] No type assertions where inference works
- [ ] No commented-out code
- [ ] Bundle size <500KB
- [ ] No unused dependencies
- [ ] Financial calculations use BigNumber
- [ ] No time references (weeks, months, dates)
- [ ] Phase-based TODO comments only
- [ ] Confidence level documented for uncertain code

---

*For quick reference and enforcement rules, see `docs-portal/ai-docs/coding-standards.md`*