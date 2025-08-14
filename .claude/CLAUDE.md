# Claude Instructions for meterr.ai

*Last updated: 2025-08-14*

## 0) Prime Directive & Purpose

**Goal:** Ship correct, secure, maintainable code with minimal duplication.

**Prime Directive:** *Every line of code is a liability. Search → Reuse → Build the minimum.*

---

## 1) Critical Rules (The Five Commandments)

1. **NO `any` TYPES** - Use explicit, exported TypeScript types and interfaces
2. **BIGNUM FOR MONEY** - All financial calculations use BigNumber.js (never float/parseFloat)
3. **SEARCH BEFORE CREATE** - Run searches before writing new code; reuse/extend existing patterns
4. **NO CONSOLE.LOG** - Use structured logger (info/warn/error) with context
5. **TEST EVERYTHING PUBLIC** - Each exported function requires comprehensive tests

### Instant Failure Triggers
```typescript
// 🔴 These patterns FAIL code review immediately:
any                           // Banned: Use explicit types
console.log()                 // Banned: Use logger
parseFloat(money)             // Banned: Use BigNumber
catch(e) {}                   // Banned: Handle errors properly
// @ts-ignore                 // Banned: Fix the type issue
TODO: Complete in Phase 2     // Banned: Use phase-based planning
```

---

## 2) Performance Limits (Non-Negotiable)

- **API:** <200ms p95 response time, payload <1MB
- **Frontend:** JS bundle <500KB, first load <3s
- **Database:** Queries <50ms p95, select minimal fields only

---

## 3) Mandatory Workflow

### A. Before Writing ANY Code
```bash
# 1. Pull latest and check recent work
git pull --rebase origin main
git log --oneline -20 -- "packages/*" "app/api"

# 2. Search for similar implementations
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "FUNCTION_NAME"
grep -r "similar_feature" packages/ --include="*.ts"

# 3. Check existing patterns and utilities
grep -r "Result<\|z\.object\|BigNumber" packages/ --include="*.ts"
ls packages/*/src/utils/
```

**Decision Tree:**
```
Feature request
    ↓
Similar code exists? → YES → Reuse/extend existing
    ↓ NO
Library solves this? → YES → Use library
    ↓ NO
Is this MVP Phase 1? → NO → Defer to later phase
    ↓ YES
Build minimal version with validation, errors, tests, types
```

### B. While Writing Code
Every function follows this defensive pattern:
```typescript
export async function functionName(input: TypedInput): Promise<Result<Output, Error>> {
  // 1. Validate input
  const valid = Schema.safeParse(input);
  if (!valid.success) return Err(new ValidationError(valid.error));
  
  // 2. Check permissions/auth if needed
  if (!hasPermission(user, resource)) return Err(new UnauthorizedError());
  
  // 3. Execute with error handling
  try {
    const result = await doWork(valid.data);
    return Ok(result);
  } catch (error) {
    logger.error('Function failed', { error, input });
    return Err(new ProcessingError(error.message));
  }
}
```

### C. Before Committing
```bash
# Run ALL checks (no exceptions)
pnpm typecheck && pnpm lint && pnpm test

# Clean up code
grep -r "console\.log\|TODO:" --include="*.ts" --include="*.tsx"

# Commit with conventional format
git commit -m "feat: add token calculation" # or fix:, docs:, refactor:
```

### D. End of Session
```bash
# Verify clean state
git status
grep -r "TODO" --include="*.ts" # Review TODOs added
pnpm typecheck && pnpm test # Ensure nothing broken
```

---

## 4) Project Map & Pattern Locations

### Structure
```
meterr/
├── apps/
│   ├── app/           → Main Next.js application
│   └── marketing/     → Marketing website
├── packages/
│   ├── @meterr/ui/    → Shared UI components (CHECK HERE FIRST!)
│   ├── @meterr/database/ → DB schemas and queries
│   └── @meterr/llm-client/ → AI provider integrations
└── docs-portal/       → Documentation and standards
```

### Quick Lookup Table
| Need | Search Command | Location/Import |
|------|----------------|-----------------|
| **API endpoint** | `find app/api -name "route.ts" -exec grep -H "POST\|GET" {} \;` | `app/api/*/route.ts` |
| **UI component** | `find . -name "*.tsx" -exec grep -l "export.*function.*return.*<" {} \;` | `@meterr/ui` |
| **DB query** | `grep -r "db\." packages/@meterr/database` | `@meterr/database` |
| **Error handling** | `grep -r "Result<" --include="*.ts"` | `packages/*/src/utils/errors.ts` |
| **Validation** | `grep -r "z\." --include="*.ts"` | `packages/*/src/schemas/` |
| **Cost calculation** | `grep -r "BigNumber" --include="*.ts"` | `@meterr/llm-client/src/utils/cost.ts` |

---

## 5) Golden Patterns (Copy-Paste Ready)

### A. API Route (Next.js)
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  // Define your schema here
});

export async function POST(req: Request) {
  // 1. Authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Validation
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  
  // 3. Business logic
  const result = await processRequest(parsed.data, session.user);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  
  // 4. Response
  return NextResponse.json({ data: result.value });
}
```

### B. Cost/Token Calculation (Financial-Safe)
```typescript
import { BigNumber } from 'bignumber.js';
import { Ok, Err, Result } from '../types/result';

export function calculateCost(tokens: number, ratePerMillion: number): Result<string, Error> {
  try {
    const cost = new BigNumber(tokens)
      .dividedBy(1_000_000)
      .multipliedBy(ratePerMillion)
      .toFixed(6); // Always 6 decimal places for financial accuracy
    
    return Ok(cost);
  } catch (error) {
    return Err(new Error('Failed to calculate cost'));
  }
}
```

### C. Database Query (Minimal Select + Error Handling)
```typescript
export async function getUserById(id: string): Promise<Result<User, Error>> {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true 
        // Only select needed fields
      }
    });
    
    if (!user) {
      return Err(new NotFoundError('User not found'));
    }
    
    return Ok(user);
  } catch (error) {
    logger.error('Database query failed', { error, userId: id });
    return Err(new DatabaseError('Failed to fetch user'));
  }
}
```

### D. React Component with Performance
```typescript
import React, { memo, useMemo } from 'react';

interface TokenDisplayProps {
  tokens: number;
  rate: number;
}

export const TokenDisplay = memo(({ tokens, rate }: TokenDisplayProps) => {
  const cost = useMemo(() => 
    calculateCost(tokens, rate), 
    [tokens, rate]
  );
  
  return (
    <div className="token-display">
      {tokens} tokens = ${cost.ok ? cost.value : 'Error'}
    </div>
  );
});
```

---

## 6) Phase-Based Planning (No Time References)

```typescript
export const FEATURES = {
  // Phase 1: MVP (Ship first - Confidence: 85%)
  BASIC_TRACKING: true,
  SIMPLE_DASHBOARD: true,
  USER_AUTH: true,
  
  // Phase 2: Enhancement (After MVP validated - Confidence: 70%)
  ADVANCED_ANALYTICS: false,
  TEAM_COLLABORATION: false,
  EXPORT_REPORTS: false,
  
  // Phase 3: Scale (After product-market fit - Confidence: 60%)
  ENTERPRISE_SSO: false,
  CUSTOM_INTEGRATIONS: false,
  WHITE_LABEL: false,
};
```

**Rules:**
- Gate scope by phase completion, not time
- Use feature flags for easy toggling
- Annotate TODOs with phases (never dates)
- Cut non-MVP features ruthlessly

---

## 7) Anti-Pattern Detection & Quality Gates

### Automated Sweeps (Run Regularly)
```bash
# Find banned patterns
grep -r ": any\|console\.log" --include="*.ts" --include="*.tsx"

# Find unhandled promises
grep -r "await.*\(" --include="*.ts" | grep -v "try\|catch\|then"

# Find missing validations
grep -r "req\.body\|req\.query" app/api | grep -v "safeParse\|parse"

# Find performance issues
grep -r "SELECT \*\|findMany()" --include="*.ts"

# Find security issues
grep -r "eval\|innerHTML\|dangerouslySetInnerHTML" --include="*.ts" --include="*.tsx"
```

### Quality Checklist (All Must Pass)
- [ ] **Types explicit** - No implicit or `any` types
- [ ] **Errors handled** - All operations use `Result<T,E>` pattern
- [ ] **Tests exist** - Unit tests for public APIs, key paths covered
- [ ] **Performance within budgets** - Bundle/query analysis passes
- [ ] **Security validated** - Input validation, no secrets exposed
- [ ] **Documentation updated** - Exported signatures and behavior documented
- [ ] **Existing code reused** - Searched for and extended similar implementations

---

## 8) Security & Compliance Essentials

### Financial Accuracy (Critical for meterr)
```typescript
// ✅ ALWAYS use BigNumber for money
import { BigNumber } from 'bignumber.js';

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
```

### Input Validation & Error Messages
```typescript
// Always validate with Zod
const UserInputSchema = z.object({
  text: z.string().max(100000),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3']),
  userId: z.string().uuid()
});

// User-friendly error messages
const ERROR_MESSAGES = {
  INVALID_API_KEY: "Your API key is invalid. Please check your settings.",
  RATE_LIMIT_EXCEEDED: "You've exceeded your rate limit. Please try again in a few minutes.",
  INTERNAL_ERROR: "Something went wrong on our end. We've been notified and are fixing it."
};
```

---

## 9) Development Commands

### Search Commands (Use Before Creating)
```bash
# Find existing token/cost code
grep -r "calculateCost\|calculateToken\|tokenCount" packages/

# Find React components
find . -name "*.tsx" -exec grep -l "export.*function.*return.*<" {} \;

# Find validation schemas
grep -r "z\.object\|z\.string\|z\.number" packages/ --include="*.ts"

# Check recent work in area
git log --oneline -20 -- "packages/@meterr/llm-client"

# Impact analysis before changes
grep -r "from.*MODULE_NAME" --include="*.ts" --include="*.tsx"
grep -r "<COMPONENT_NAME" --include="*.tsx"
```

### Quality Commands (Use Before Committing)
```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Testing
pnpm test

# Bundle analysis
pnpm analyze

# All checks combined
pnpm typecheck && pnpm lint && pnpm test
```

---

## 10) Session Management & Self-Update

### Session Start Protocol
```bash
# Update knowledge
git pull origin main
git log --oneline -10

# Check current focus
cat .github/CURRENT_SPRINT.md 2>/dev/null || echo "No sprint file"

# Understand context
gh issue list --limit 5 --state open
```

### Self-Update Protocol (Every session/30min)
```bash
# Check for updates to standards
git diff HEAD~1 .claude/CLAUDE.md
ls -la docs-portal/docs/*-standards.md

# Verify structure
tree -L 2 -d

# Review recent changes
git log --oneline -10
```

### Continuous Improvement
**Every 10 interactions, reflect on:**
1. What patterns am I repeating? (Can they be automated?)
2. What mistakes did I make? (How can I prevent them?)
3. What took longest? (Can it be optimized?)
4. What questions remained? (Document uncertainties)

---

## 11) Reference Documentation

### Core Standards
- **[coding-standards.md](../docs-portal/docs/coding-standards.md)** - Complete TypeScript and React patterns
- **[api-design-standards.md](../docs-portal/docs/api-design-standards.md)** - REST API patterns
- **[error-handling-playbook.md](../docs-portal/docs/error-handling-playbook.md)** - Error patterns and recovery
- **[testing-guide.md](../docs-portal/docs/testing-guide.md)** - Testing standards and patterns

### Environment Variables
```bash
# Required for development
DATABASE_URL=             # Supabase connection string
NEXT_PUBLIC_SUPABASE_URL= # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
OPENAI_API_KEY=          # OpenAI API key
ANTHROPIC_API_KEY=       # Anthropic API key
```

---

## 12) Final Reminders & Success Metrics

### Session Metrics (Track These)
| Metric | Target | Track |
|--------|--------|-------|
| Code Reuse | >70% | Files reused vs created |
| Pattern Consistency | 100% | Patterns match standards |
| Test Coverage | >80% | New code has tests |
| Performance Budget | 100% | Within defined limits |
| Zero Duplicates | Yes | No duplicate implementations |

### The Never List
1. **Never trust user input** - Always validate with Zod
2. **Never catch without handling** - Log errors, return Result
3. **Never use float for money** - Use BigNumber exclusively
4. **Never SELECT *** - Select only needed fields
5. **Never skip tests** - Every public function needs tests
6. **Never use relative imports across packages** - Use package imports
7. **Never commit secrets** - Use environment variables

### Boy Scout Rule
**"Leave code better than you found it"**

Every time you touch code:
- Fix nearby code smells
- Add missing types
- Improve variable names
- Add missing tests
- Update outdated comments

---

## 13) Performance and Optimization Context

### Code Quality Standards
**See: `.claude/context/METERR_CODING_STANDARDS.md`**
- TypeScript patterns (satisfies, utility types, destructuring)
- React optimization (memo, hooks, dynamic imports)
- API patterns (response helpers, middleware)
- Functional programming (Result types)
- Bundle optimization rules

### Hardware Optimization
**See: `.claude/context/METERR_PERFORMANCE_OPTIMIZATION.md`**
- Parallel processing (32 CPU threads)
- GPU acceleration (RTX 5070 Ti CUDA)
- Memory utilization (256GB RAM)
- Build optimization
- Database optimization

### Apply These Patterns
1. **ALWAYS** check both context files before generating code
2. **ALWAYS** use hardware-optimized configurations
3. **ALWAYS** follow code quality standards
4. **NEVER** generate unoptimized code
5. **NEVER** ignore available hardware capabilities

---

*This document is the complete reference for world-class AI programming on meterr.ai*
*Follow these standards religiously for consistent, high-quality code*