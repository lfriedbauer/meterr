# Meterr Development Decision Guidelines

*When and why to make specific development choices*

---

## 1. Version & Dependency Management

### When to Check Versions

```bash
# ALWAYS check before:
1. Adding new LLM SDK: Read package.json → Check peer dependencies
2. Upgrading existing packages: Check breaking changes in CHANGELOG
3. After "Cannot find module" errors: Verify installation and version
4. When CI/CD fails: Compare local vs CI package versions
```

### LLM SDK Version Strategy

```typescript
// Check compatibility matrix
OpenAI SDK: "^4.24.1"     → Stable, update minor versions only
Anthropic SDK: "^0.17.0"  → Beta, pin exact version
Google AI: "^0.2.0"       → Alpha, expect breaking changes

// Decision tree:
Is it an LLM SDK? → YES → Pin to exact version if < 1.0.0
                  → NO  → Use ^ for minor updates
```

### Update vs Stay Decision

```
Security vulnerability? → UPDATE IMMEDIATELY
Breaking change? → Stay unless feature needed
Performance improvement > 20%? → Update after testing
Bug affecting our code? → Update
Otherwise → Stay on current version
```

---

## 2. Language Selection Logic

### TypeScript vs Python vs Node Scripts

```
┌─────────────────────────────────────┐
│ Is it production code?              │
│ YES → TypeScript (type safety)      │
│ NO ↓                                │
├─────────────────────────────────────┤
│ Needs GPU/AI libraries?             │
│ YES → Python (.py)                  │
│ NO ↓                                │
├─────────────────────────────────────┤
│ Needs to run in package.json?       │
│ YES → Node script (.cjs/.js)        │
│ NO → TypeScript (.ts)               │
└─────────────────────────────────────┘
```

### File Extension Decision

```javascript
.ts   → Default for all new code
.tsx  → React components only
.cjs  → Node scripts when package.json has "type": "module"
.mjs  → ES modules in Node (avoid, use .ts)
.py   → GPU acceleration, AI/ML, data analysis
.sh   → System setup, multi-step operations
```

### Specific Examples

```bash
Token counting:
  - Fast/simple → TypeScript (lib/token-counter.ts)
  - GPU/batch → Python (scripts/python/token_analyzer.py)
  
Data processing:
  - <10MB → TypeScript with streams
  - >10MB → Python with pandas
  
API endpoint:
  - Always TypeScript (type safety required)
  
Build script:
  - Simple → package.json script
  - Complex → Node .cjs file
  - System-level → Bash script
```

---

## 3. External Code Discovery

### Before Building Custom Solution

```bash
# 1. Check if we already have it
Grep: "function.*similar" packages/
Grep: "export.*TokenCounter" 

# 2. Check npm for existing solutions
WebSearch: "site:npmjs.com token counter typescript"
WebSearch: "tiktoken vs gpt-tokenizer benchmark"

# 3. Evaluate build vs buy
Development time > 4 hours? → Search for library
Core business logic? → Build custom
Already solved well? → Use library
```

### Library Evaluation Criteria

```
✅ Use external library when:
- Weekly downloads > 10,000
- Last updated < 6 months ago
- TypeScript support or @types available
- License compatible (MIT, Apache, BSD)
- Size < 100KB for frontend libraries
- Maintained by reputable org

❌ Build custom when:
- Library is abandoned (>1 year no updates)
- No TypeScript support
- Adds >500KB to bundle
- Security vulnerabilities
- Doesn't match our exact need
- Core competitive advantage
```

### Competitor Research

```bash
# When to check competitors:
- New feature planning → See how Helicone/Vellum do it
- Performance issues → Check their solutions
- Pricing model changes → Analyze their strategies

# Where to look:
WebFetch: "https://github.com/[competitor]/[repo]"
WebSearch: "site:helicone.ai token optimization"
WebSearch: "langfuse pricing model"
```

---

## 4. Performance Optimization Decisions

### When to Profile First

```typescript
// ALWAYS profile before optimizing if:
- No metrics exist → Establish baseline
- User-reported slowness → Identify bottleneck
- Optimization seems complex → Verify it's worth it
- Multiple solutions exist → Compare approaches

// Profile commands:
Bash: "npm run build -- --profile"
Bash: "node --inspect scripts/benchmark-tokens.ts"
Bash: "python -m cProfile scripts/python/token_analyzer.py"
```

### GPU Acceleration Decision

```
Batch size > 100? → Try GPU
Batch size < 10? → Use CPU
Real-time requirement? → CPU (lower latency)
Batch processing? → GPU (higher throughput)

// Verification:
Bash: "pnpm benchmark:tokens"  // Compare GPU vs CPU
Read: "scripts/benchmark-tokens.ts"  // Check results
```

### Memory Optimization Triggers

```javascript
// Watch for these patterns:
Heap > 1GB? → Investigate memory leaks
OOM errors? → Add streaming/pagination
Slow GC? → Reduce object creation

// Memory checks:
Bash: "node --expose-gc --trace-gc script.js"
Bash: "npm run dev -- --max-old-space-size=4096"

// Solutions by memory usage:
< 100MB → No optimization needed
100MB-1GB → Consider caching strategy
1GB-4GB → Add streaming/pagination
> 4GB → Redesign approach
```

---

## 5. Testing Strategy

### Before Modifying Code

```bash
# 1. Check existing coverage
Grep: "describe.*ComponentName" **/*.test.ts
Grep: "it\(.*should" **/*.spec.ts
Bash: "npm test -- --coverage path/to/file"

# 2. Run related tests
Bash: "npm test -- --watch path/to/file.test.ts"
Bash: "npm test -- --grep 'TokenCounter'"

# 3. Identify test gaps
No tests exist? → Write tests first (TDD)
Partial coverage? → Add edge cases
Full coverage? → Safe to modify
```

### Test Writing Priority

```
Priority 1: Public API functions → 100% coverage required
Priority 2: Financial calculations → Test all edge cases
Priority 3: Error handling → Test all error paths
Priority 4: UI components → Test user interactions
Priority 5: Internal utilities → Test if complex
```

### Test File Location

```bash
# Colocated (preferred):
lib/token-counter.ts
lib/token-counter.test.ts

# Separate test directory (legacy):
src/components/Button.tsx
__tests__/components/Button.test.tsx

# E2E tests:
apps/app/e2e/auth.spec.ts
```

---

## 6. Decision Quick Reference

### Common Scenarios

```yaml
New API endpoint:
  1. Check: Existing similar endpoints
  2. Language: TypeScript (always)
  3. Test: Create route.test.ts
  4. Generate: pnpm plop api

Token counting feature:
  1. Check: lib/gpu-tokenizer.ts
  2. Language: Python if batch > 100
  3. Test: benchmark first
  4. Library: tiktoken for accuracy

Database optimization:
  1. Check: Current query time
  2. Profile: Add query logging
  3. Memory: Use lib/dev-database.ts
  4. Test: Load test with 10x data

New LLM integration:
  1. Check: packages/@meterr/llm-client/
  2. Version: Pin if SDK < 1.0
  3. Test: Mock API responses
  4. Monitor: Add to Helicone
```

---

## 7. Anti-Patterns to Avoid

```typescript
// ❌ NEVER do these:
- Optimize without profiling
- Update all dependencies at once
- Use Python for API routes
- Skip tests for "simple" changes
- Trust benchmark claims without verifying
- Mix .mjs and .cjs in same project
- Use 'latest' tag in package.json
- Profile in development mode only
```

---

*This document guides WHEN and WHY to make development decisions*
*Always consider context and trade-offs before applying these guidelines*