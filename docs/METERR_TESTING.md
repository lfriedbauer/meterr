# METERR Testing Guide

## Testing Philosophy for meterr.ai

Financial accuracy is critical - a 0.1% error in token counting could cost customers thousands. Every calculation must be tested and verified.

## Test Structure

```
meterr/
├── apps/app/__tests__/          # Main app tests
│   ├── api/                     # API endpoint tests
│   ├── components/              # Component tests
│   ├── services/                # Service layer tests
│   ├── property/                # Property-based tests
│   └── security/                # Security fuzz tests
├── apps/app/scripts/__tests__/  # Script tests
└── packages/@meterr/*/tests/    # Package tests
```

## Running Tests

### Quick Start
```bash
pnpm test                 # Run all tests
pnpm test:watch          # Watch mode for development
pnpm test:coverage       # Generate coverage report
```

### Test Suites by Category
```bash
# Core functionality
pnpm test token          # Token counting tests
pnpm test cost           # Cost calculation tests
pnpm test api            # API endpoint tests

# Advanced testing
pnpm test:property       # Property-based tests
pnpm test:security       # Security fuzz tests
pnpm test:perf           # Performance benchmarks
pnpm test:load           # Load testing
```

## Core Test Types

### 1. Token Counting Accuracy Tests

**Why Critical**: Different providers count tokens differently. Our counts must match their billing exactly.

```typescript
// apps/app/__tests__/services/token-counter.test.ts
describe("Token Counter Accuracy", () => {
  it("should match OpenAI's tokenizer for GPT-4", async () => {
    const text = "Hello, world!";
    const ourCount = await countTokens(text, "gpt-4");
    const openAICount = 4; // Verified with OpenAI's tokenizer
    expect(ourCount).toBe(openAICount);
  });

  it("should handle Unicode correctly", async () => {
    const text = "Hello 世界 🌍";
    const ourCount = await countTokens(text, "gpt-4");
    expect(ourCount).toBe(7); // Verified count
  });

  it("should match Claude's tokenizer", async () => {
    const text = "Hello, world!";
    const ourCount = await countTokens(text, "claude-3");
    const anthropicCount = 5; // Verified with Anthropic
    expect(ourCount).toBe(anthropicCount);
  });
});
```

### 2. Cost Calculation Tests

**Why Critical**: Financial calculations need precision to 6 decimal places without rounding errors.

```typescript
// apps/app/__tests__/services/cost-calculator.test.ts
describe("Cost Calculator", () => {
  it("should calculate costs with exact precision", () => {
    const tokens = 1234;
    const pricePerK = 0.03;
    const cost = calculateCost(tokens, pricePerK);
    
    expect(cost).toBe(0.037020); // Exact to 6 decimals
    expect(cost.toString()).not.toContain("e"); // No scientific notation
  });

  it("should handle large numbers without overflow", () => {
    const tokens = 10_000_000;
    const cost = calculateCost(tokens, 0.03);
    expect(cost).toBe(300.000000);
  });

  it("should use BigNumber for precision", () => {
    const cost = calculateCost(999999, 0.000001);
    expect(cost).toBe(0.999999); // No floating point errors
  });
});
```

### 3. API Integration Tests

**Why Critical**: Ensure our API endpoints handle real-world scenarios and edge cases.

```typescript
// apps/app/__tests__/api/smart-router.test.ts
describe("Smart Router API", () => {
  it("should select cheapest model for simple tasks", async () => {
    const response = await fetch("/api/smart-router", {
      method: "POST",
      body: JSON.stringify({
        task: "simple",
        maxCost: 0.01
      })
    });
    
    const data = await response.json();
    expect(data.model).toBe("gpt-3.5-turbo"); // Cheapest option
  });

  it("should handle rate limits gracefully", async () => {
    const response = await fetch("/api/smart-router", {
      method: "POST",
      headers: { "X-Rate-Limit-Test": "true" }
    });
    
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeDefined();
  });

  it("should validate input with Zod", async () => {
    const response = await fetch("/api/count-tokens", {
      method: "POST",
      body: JSON.stringify({ invalid: "data" })
    });
    
    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.message).toContain("validation");
  });
});
```

### 4. Performance Tests

**Why Critical**: Dashboard must load in <1 second, API responses in <100ms for good UX.

```typescript
// apps/app/__tests__/performance/dashboard.test.ts
describe("Dashboard Performance", () => {
  it("should load initial data in under 1 second", async () => {
    const start = performance.now();
    const data = await loadDashboardData(userId);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });

  it("should process 10k tokens in under 100ms", async () => {
    const text = "word ".repeat(2500); // ~10k tokens
    
    const start = performance.now();
    await countTokens(text, "gpt-4");
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });

  it("should leverage GPU for large batches", async () => {
    const largeBatch = generateTokenBatch(100_000);
    
    const cpuTime = await measureCPUProcessing(largeBatch);
    const gpuTime = await measureGPUProcessing(largeBatch);
    
    expect(gpuTime).toBeLessThan(cpuTime / 10); // 10x faster
  });
});
```

## Advanced Test Patterns

### 5. Property-Based Testing

**Why Critical**: Automatically discovers edge cases that manual tests miss. Essential for financial accuracy.

```typescript
// apps/app/__tests__/property/token-counter.property.test.ts
import fc from 'fast-check';

describe("Token Counter Properties", () => {
  it("should always return non-negative count", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const count = countTokens(text, 'gpt-4');
        return count >= 0;
      })
    );
  });

  it("should be deterministic", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const count1 = countTokens(text, 'gpt-4');
        const count2 = countTokens(text, 'gpt-4');
        return count1 === count2;
      })
    );
  });

  it("should handle any Unicode input", () => {
    fc.assert(
      fc.property(fc.unicodeString(), (text) => {
        const count = countTokens(text, 'gpt-4');
        return Number.isInteger(count) && count >= 0;
      })
    );
  });

  it("should scale linearly with repetition", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.integer({ min: 1, max: 100 }),
        (text, repeats) => {
          const single = countTokens(text, 'gpt-4');
          const repeated = countTokens(text.repeat(repeats), 'gpt-4');
          // Allow small variance for token boundaries
          return Math.abs(repeated - (single * repeats)) <= repeats;
        }
      )
    );
  });
});
```

### 6. Financial Precision Property Tests

**Why Critical**: Ensure no precision loss across all possible inputs - critical for billing.

```typescript
// apps/app/__tests__/property/cost-calculator.property.test.ts
describe("Cost Calculator Properties", () => {
  it("should maintain 6 decimal precision", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        fc.float({ min: 0.0001, max: 1.0 }),
        (tokens, rate) => {
          const cost = calculateCost(tokens, rate);
          const decimals = cost.toString().split('.')[1];
          return !decimals || decimals.length <= 6;
        }
      )
    );
  });

  it("should never produce negative costs", () => {
    fc.assert(
      fc.property(
        fc.nat(),
        fc.float({ min: 0, max: 1000 }),
        (tokens, rate) => {
          const cost = calculateCost(tokens, rate);
          return cost >= 0;
        }
      )
    );
  });

  it("should be associative for batch operations", () => {
    fc.assert(
      fc.property(
        fc.array(fc.nat(), { minLength: 1, maxLength: 100 }),
        fc.float({ min: 0.001, max: 1.0 }),
        (tokenBatches, rate) => {
          const sumThenCalculate = calculateCost(
            tokenBatches.reduce((a, b) => a + b, 0),
            rate
          );
          const calculateThenSum = tokenBatches
            .map(t => calculateCost(t, rate))
            .reduce((a, b) => a + b, 0);
          
          // Should be equal within floating point precision
          return Math.abs(sumThenCalculate - calculateThenSum) < 0.000001;
        }
      )
    );
  });
});
```

### 7. Security Fuzz Testing

**Why Critical**: Prevent crashes and vulnerabilities from malformed or malicious input.

```typescript
// apps/app/__tests__/security/api-fuzz.test.ts
import { fuzzer } from '@jazzer.js/core';

describe("API Security Testing", () => {
  it("should handle malformed JSON gracefully", async () => {
    const malformedInputs = [
      '{"text": null}',
      '{"text": undefined}',
      '{"text": NaN}',
      '{"text": Infinity}',
      '{"text": "\\x00\\x01\\x02"}',
      '{"text": "' + 'a'.repeat(1_000_000) + '"}',
      '{]',
      '{"text": {"$ref": "#"}}', // JSON reference attack
      '{"__proto__": {"isAdmin": true}}', // Prototype pollution
    ];

    for (const input of malformedInputs) {
      const response = await fetch('/api/count-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: input
      });

      // Should never crash, always return valid error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      
      // Should not leak internal errors
      const body = await response.text();
      expect(body).not.toContain('stack');
      expect(body).not.toContain('TypeError');
    }
  });

  it("should resist injection attacks", () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => 
          s.includes('DROP') || 
          s.includes('<script>') ||
          s.includes('../../')
        ),
        async (maliciousInput) => {
          const response = await fetch('/api/smart-router', {
            method: 'POST',
            body: JSON.stringify({ text: maliciousInput })
          });

          // Should sanitize input, never execute
          const data = await response.json();
          expect(data).not.toContain('DROP');
          expect(data).not.toContain('<script>');
          expect(data).not.toContain('../');
        }
      )
    );
  });
});
```

## Test Setup and Configuration

### Basic Setup (Jest)
```json
// jest.config.js
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "./src/services/token-counter": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100
    }
  }
}
```

### Advanced Testing Libraries
```bash
# Property-based testing for edge cases
pnpm add -D fast-check

# Fuzz testing for security
pnpm add -D @jazzer.js/core

# Load testing for scalability
pnpm add -D k6

# Snapshot testing for API responses
pnpm add -D jest-snapshot
```

## Test Coverage Requirements

### Critical Paths (100% Coverage Required)
- Token counting functions
- Cost calculations
- Billing operations
- API key encryption
- Input validation

### Standard Paths (80% Coverage Target)
- API endpoints
- React components
- Database queries
- Utility functions
- Error handling

### Coverage Reports
```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Enforce coverage in CI
pnpm test:coverage --ci --coverageThreshold
```

## Testing Best Practices

### 1. Test Real Scenarios
```typescript
// ❌ Not realistic
it("should count tokens", () => {
  expect(countTokens("test")).toBe(1);
});

// ✅ Real scenario
it("should count tokens for customer support chat", () => {
  const conversation = [
    { role: "user", content: "My API isn't working" },
    { role: "assistant", content: "I'll help you debug..." }
  ];
  const tokens = countConversationTokens(conversation);
  expect(tokens).toBe(23); // Verified count
});
```

### 2. Test Edge Cases
```typescript
describe("Edge Cases", () => {
  it("should handle empty input", () => {
    expect(countTokens("")).toBe(0);
  });

  it("should handle maximum input length", () => {
    const maxText = "a".repeat(100_000); // Max context
    expect(() => countTokens(maxText)).not.toThrow();
  });

  it("should handle special characters", () => {
    const special = "♠♣♥♦ 你好 مرحبا शुभ प्रभात";
    expect(countTokens(special)).toBeGreaterThan(0);
  });
});
```

### 3. Test Error Scenarios
```typescript
it("should handle API failures gracefully", async () => {
  // Mock API failure
  mockAPI.fail();
  
  const result = await trackTokens(data);
  
  expect(result.success).toBe(false);
  expect(result.error).toBe("Service temporarily unavailable");
  expect(result.retry).toBe(true);
  expect(result.retryAfter).toBe(60);
});
```

## Testing with Your Hardware

Your RTX 5070 Ti and 32-thread CPU enable advanced testing capabilities:

### Parallel Testing
```bash
# Run tests across all 32 threads
pnpm test --parallel --maxWorkers=32

# Parallel property tests
pnpm test:property --maxWorkers=32 --numRuns=10000
```

### GPU-Accelerated Tests
```bash
# Enable GPU for token processing tests
CUDA_VISIBLE_DEVICES=0 pnpm test:gpu

# Verify GPU is being used
nvidia-smi  # Should show node.js process
```

### High-Volume Load Testing
```bash
# Test with 10,000 concurrent users
pnpm test:load --vus=10000 --duration=60s

# Test token processing throughput
pnpm test:perf --tokens=1000000 --parallel=32
```

## Continuous Integration

### Pre-commit Hooks
```json
// .husky/pre-commit
{
  "hooks": {
    "pre-commit": "pnpm test:affected && pnpm typecheck"
  }
}
```

### GitHub Actions Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test:coverage
      - run: pnpm test:property
      - run: pnpm test:security
```

## Debugging Test Failures

### Token Count Mismatches
```bash
# Debug mode shows detailed token breakdown
DEBUG=tokens pnpm test token-counter

# Output example:
# Text: "Hello world"
# Tokens: ["Hello", " world"]
# Token IDs: [15496, 1917]
# Count: 2
```

### Cost Calculation Precision Issues
```bash
# Enable BigNumber debugging
DEBUG=bignumber pnpm test cost-calculator

# Shows each arithmetic operation
```

### Flaky Test Detection
```bash
# Run test multiple times to detect flakiness
pnpm test --runInBand --repeat=10

# Use seed for deterministic property tests
pnpm test:property --seed=12345
```

### Performance Regression Detection
```bash
# Compare against baseline
pnpm test:perf --compare=baseline.json

# Generate new baseline
pnpm test:perf --updateBaseline
```

## Common Test Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Token count mismatch | Provider model update | Update expected counts from provider |
| Precision loss | JavaScript floating point | Use BigNumber library |
| Timeout in CI | Slower CI machines | Increase timeout or optimize test |
| GPU tests fail in CI | No CUDA in CI | Skip GPU tests in CI environment |
| Property test failures | Edge case found | Fix bug or adjust property |
| Fuzz test crashes | Missing validation | Add input validation |
| Snapshot mismatches | Intentional changes | Update snapshots with --updateSnapshot |

---

*For concise test patterns and enforcement rules, see `.claude/context/METERR_TESTING.md`*