# Claude Instructions for meterr.ai

*Last updated: 2025-08-15*

## 0) Prime Directive & Purpose

**Goal:** Ship correct, secure, maintainable code with minimal duplication.

**Prime Directive:** *Every line of code is a liability. FlexSearch → Reuse → Build the minimum.*

**🎯 ORCHESTRATOR ENFORCEMENT ACTIVE**
- All development decisions subject to orchestrator approval
- FlexSearch must be used BEFORE writing any new code
- Agent hierarchy must be respected at all times
- See `.claude/ORCHESTRATOR_DIRECTIVES.md` for full details

---

## 1) Critical Rules (The Seven Commandments)

1. **FLEXSEARCH FIRST** - Use `pnpm research:search` BEFORE writing ANY new code
2. **NO `any` TYPES** - Use explicit, exported TypeScript types and interfaces
3. **BIGNUM FOR MONEY** - All financial calculations use BigNumber.js (never float/parseFloat)
4. **SEARCH BEFORE CREATE** - Run searches before writing new code; reuse/extend existing patterns
5. **NO CONSOLE.LOG** - Use structured logger (info/warn/error) with context
6. **TEST EVERYTHING PUBLIC** - Each exported function requires comprehensive tests
7. **ORCHESTRATOR RULES** - Follow agent hierarchy; lower priority cannot override higher

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

### Documentation Location Rules
- **ALL documentation MUST go in `docs-portal/`** - Never create `/docs` folder
- **Human-readable docs:** `docs-portal/docs/`
- **AI-specific docs:** `docs-portal/ai-docs/`
- **Blog posts:** `docs-portal/blog/`
- **NEVER create documentation files outside docs-portal**
- **Violations will be caught by pre-commit hooks**

---

## 2) Performance Limits (Non-Negotiable)

- **API:** <200ms p95 response time, payload <1MB
- **Frontend:** JS bundle <500KB, first load <3s
- **Database:** Queries <50ms p95, select minimal fields only

---

## 3) Mandatory Workflow - ORCHESTRATOR ENFORCED

### A. Before Writing ANY Code - FLEXSEARCH-FIRST MANDATE
```bash
# 🚨 MANDATORY: Use FlexSearch BEFORE writing new code
# 1. Search existing solutions with research coordinator
pnpm research:search "authentication"  # Find tools/libraries
pnpm orchestrate:status               # Verify orchestrator active

# 2. Pull latest and check recent work
git pull --rebase origin main
git log --oneline -20 -- "packages/*" "app/api"

# 3. Search for similar implementations IN ORDER:
# a) FlexSearch tool registry (REQUIRED FIRST)
pnpm research:search "FEATURE_NAME"
# b) Local codebase search
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "FUNCTION_NAME"
grep -r "similar_feature" packages/ --include="*.ts"
# c) Pattern search
grep -r "Result<\|z\.object\|BigNumber" packages/ --include="*.ts"
ls packages/*/src/utils/
```

**ORCHESTRATOR Decision Tree (ENFORCED):**
```
Feature request
    ↓
🔍 FLEXSEARCH FIRST → Tool exists? → YES → USE TOOL (No code!)
    ↓ NO
Similar code exists? → YES → Reuse/extend existing
    ↓ NO
Library solves this? → YES → Use library
    ↓ NO
Get Orchestrator approval → NO → STOP (Find alternative)
    ↓ YES
Is this MVP Phase 1? → NO → Defer to later phase
    ↓ YES
Build minimal version with validation, errors, tests, types
```

### 🎯 ORCHESTRATOR HIERARCHY (RESPECT THIS!)
```
Priority 10: Orchestrator → OVERRIDES ALL DECISIONS
Priority 8:  Architect   → Defines patterns YOU FOLLOW
Priority 7:  Researcher  → Finds solutions YOU USE
Priority 6:  Reviewer    → CAN BLOCK your code
Priority 5:  Developer   → MUST FOLLOW all above
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
# 🚨 FIRST: Check if solution already exists
pnpm research:search "FEATURE_YOU_NEED"
pnpm research:quick  # Find tools with <2hr setup
pnpm orchestrate:status  # Verify orchestrator compliance

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

# Find code written without FlexSearch check
git log --grep="feat:" --since="2025-01-15" | grep -v "research:search"
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
# 🚨 MANDATORY FIRST STEP: FlexSearch for existing solutions
pnpm research:search "WHAT_YOU_NEED"       # Search tool registry
pnpm research:quick                        # Find quick-win tools
pnpm orchestrate                          # Get orchestrator guidance

# Then search local codebase:
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

### Development Decisions
**See: `.claude/context/METERR_DEVELOPMENT_DECISIONS.md`**
- Version and dependency management
- Language selection (TypeScript vs Python vs Node)
- External code evaluation
- Performance profiling decisions
- Testing strategy

### Apply These Patterns
1. **ALWAYS** check all three context files before generating code
2. **ALWAYS** use hardware-optimized configurations
3. **ALWAYS** follow code quality standards
4. **ALWAYS** apply development decision criteria
5. **NEVER** generate unoptimized code
6. **NEVER** ignore available hardware capabilities

---

## 12) Date Handling Rules

### IMPORTANT: Automatic Date Correction
- **Scripts Available:** `pnpm fix:dates` automatically corrects all dates
- **Never worry about dates** - They will be auto-corrected
- **Use dynamic dates in code:**
  ```typescript
  import { getDynamicDate, CURRENT_YEAR } from '@/lib/constants/dates';
  ```

### Date Management
1. **Never hardcode dates** - A script will auto-fix them anyway
2. **Use placeholder dates** - The fix-dates script will correct them
3. **Scripts run automatically on:**
   - `pnpm dev` (start of development)
   - `pnpm build` (before building)
   - Git commits (if using Husky)

---

*This document is the complete reference for world-class AI programming on meterr.ai*
*Follow these standards religiously for consistent, high-quality code*