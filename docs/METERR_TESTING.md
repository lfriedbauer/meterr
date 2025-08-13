# METERR Testing Guide

## Testing Philosophy for meterr.ai

Financial accuracy is critical - a 0.1% error in token counting could cost customers thousands. Every calculation must be tested and verified.

## Test Structure

```
meterr/
├── apps/app/__tests__/          # Main app tests
│   ├── api/                     # API endpoint tests
│   ├── components/              # Component tests
│   └── services/                # Service layer tests
├── apps/app/scripts/__tests__/  # Script tests
└── packages/@meterr/*/tests/    # Package tests
```

## Types of Tests

### 1. Token Counting Accuracy Tests

**Why Critical**: Different providers count tokens differently. Our counts must match their billing.

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
});
```

### 2. Cost Calculation Tests

**Why Critical**: Financial calculations need precision to 6 decimal places.

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
});
```

### 3. API Integration Tests

**Why Critical**: Ensure our API endpoints handle real-world scenarios.

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
    // Simulate rate limit scenario
    const response = await fetch("/api/smart-router", {
      method: "POST",
      headers: { "X-Rate-Limit-Test": "true" }
    });
    
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeDefined();
  });
});
```

### 4. Performance Tests

**Why Critical**: Dashboard must load in <1 second, API responses in <100ms.

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
});
```

## Running Tests

### All Tests
```bash
pnpm test                 # Run all tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # Coverage report
```

### Specific Tests
```bash
pnpm test token          # Token counting tests
pnpm test cost           # Cost calculation tests
pnpm test api            # API tests
```

### Performance Tests
```bash
pnpm test:perf           # Performance benchmarks
pnpm test:load           # Load testing
```

## Test Coverage Requirements

### Critical Paths (100% Required)
- Token counting functions
- Cost calculations
- Billing operations
- API key encryption

### Standard Paths (80% Target)
- API endpoints
- React components
- Database queries
- Utility functions

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

  it("should handle very long input", () => {
    const longText = "a".repeat(1_000_000);
    expect(() => countTokens(longText)).not.toThrow();
  });

  it("should handle special characters", () => {
    const special = "♠♣♥♦ 你好 مرحبا";
    expect(countTokens(special)).toBeGreaterThan(0);
  });
});
```

### 3. Test Error Handling
```typescript
it("should handle API failures gracefully", async () => {
  // Mock API failure
  mockAPI.fail();
  
  const result = await trackTokens(data);
  
  expect(result.success).toBe(false);
  expect(result.error).toBe("Service temporarily unavailable");
  expect(result.retry).toBe(true);
});
```

## Continuous Testing

### Pre-commit Hooks
```json
// .husky/pre-commit
{
  "hooks": {
    "pre-commit": "pnpm test:affected"
  }
}
```

### CI Pipeline
```yaml
# .github/workflows/test.yml
- Run type checking
- Run unit tests
- Run integration tests
- Check coverage thresholds
- Performance benchmarks
```

## Debugging Failed Tests

### 1. Token Count Mismatches
```bash
# Debug mode shows token breakdown
DEBUG=tokens pnpm test token-counter

# Output:
# Text: "Hello world"
# Tokens: ["Hello", " world"]
# IDs: [15496, 1917]
# Count: 2
```

### 2. Cost Calculation Errors
```bash
# Use precise math debugging
DEBUG=math pnpm test cost-calculator

# Shows each calculation step
```

### 3. Flaky Tests
```bash
# Run test multiple times to identify flakiness
pnpm test --run-in-band --repeat 10
```

## Testing with Your Hardware

Your RTX 5070 Ti and 32-thread CPU enable:

### Parallel Testing
```bash
# Runs tests across all 32 threads
pnpm test --parallel --maxWorkers=32
```

### GPU-Accelerated Tests
```bash
# Tests GPU token counting
pnpm test:gpu

# Verifies GPU acceleration is working
nvidia-smi  # Should show node process
```

### Load Testing
```bash
# Simulate 10,000 concurrent users
pnpm test:load --users=10000 --duration=60s
```

## Common Test Failures

| Failure | Cause | Solution |
|---------|-------|----------|
| Token count mismatch | Model update | Update expected counts |
| Timeout errors | Slow CI server | Increase timeout |
| Database connection | No local DB | Run `supabase start` |
| GPU tests fail | No CUDA | Skip on CI, run locally |

---

*For test implementation patterns, see `.claude/context/METERR_TESTING.md`*