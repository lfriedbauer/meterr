# METERR Testing - Claude Context

## Test Locations

```
apps/app/__tests__/         # Main app tests
├── api/                    # API endpoint tests
├── components/             # Component tests
├── services/               # Service tests
├── property/              # Property-based tests
└── security/              # Security fuzz tests
packages/@meterr/*/tests/   # Package tests
```

## Test Commands

```bash
pnpm test              # All tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
pnpm test token        # Token tests only
pnpm test:property     # Property-based tests
pnpm test:security     # Security fuzz tests
pnpm test:perf         # Performance tests
pnpm test:load         # Load testing
```

## Critical Test Requirements

### Must Test (100% Coverage)
- Token counting accuracy (99.9% match provider)
- Cost calculations (6 decimal precision)
- API key encryption
- Billing operations
- Input validation

### Standard Tests (80% Coverage)
- API endpoints
- React components
- Database queries
- Error handling

## Test Patterns

### Token Accuracy Test
```typescript
it("should match provider count", async () => {
  const text = "test text";
  const ourCount = await countTokens(text, "gpt-4");
  const expectedCount = 2; // Verified with OpenAI
  expect(ourCount).toBe(expectedCount);
});
```

### Cost Precision Test
```typescript
it("should calculate to 6 decimals", () => {
  const cost = calculateCost(1234, 0.03);
  expect(cost).toBe(0.037020);
  expect(Number(cost.toFixed(6))).toBe(cost);
});
```

### Property-Based Test Pattern
```typescript
import fc from 'fast-check';

// Test invariants that must always hold
fc.assert(
  fc.property(fc.string(), (text) => {
    const count = countTokens(text, 'gpt-4');
    return count >= 0 && Number.isInteger(count);
  })
);
```

### Security Fuzz Test Pattern
```typescript
// Test with malformed inputs
const malformedInputs = [
  '{"text": null}',
  '{"text": "' + 'a'.repeat(1_000_000) + '"}',
  '{"text": {"$ref": "#"}}' // JSON reference attack
];

for (const input of malformedInputs) {
  const response = await fetch('/api/endpoint', { body: input });
  expect(response.status).toBeGreaterThanOrEqual(400);
  expect(response.status).toBeLessThan(500);
}
```

### Financial Property Tests
```typescript
// Ensure precision never lost
fc.property(
  fc.integer({ min: 1, max: 10_000_000 }),
  fc.float({ min: 0.0001, max: 1.0 }),
  (tokens, rate) => {
    const cost = calculateCost(tokens, rate);
    const decimals = cost.toString().split('.')[1];
    return !decimals || decimals.length <= 6;
  }
);
```

## Performance Targets

- Dashboard load: <1 second
- API response: <100ms
- Token processing: 100k tokens/second
- Test suite: <30 seconds
- Property tests: 100 runs per property
- Fuzz tests: 1000 iterations minimum

## Test Priorities for meterr.ai

### HIGH Priority (Must Have)
- Token counting accuracy tests
- Cost calculation precision tests
- Property-based tests for financial calculations
- Fuzz tests for API security

### MEDIUM Priority (Should Have)
- Load testing for scalability
- Integration tests with providers
- Snapshot tests for API responses

### LOW Priority (Nice to Have)
- Visual regression (UI secondary)
- Mutation testing (overkill for now)
- Contract testing (we don't control APIs)

## Hardware Utilization

```bash
# Use all 32 threads
pnpm test --maxWorkers=32

# GPU tests
CUDA_VISIBLE_DEVICES=0 pnpm test:gpu

# Load test with high concurrency
pnpm test:load --vus=10000 --duration=60s
```

## Test Libraries Required

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "fast-check": "^3.0.0",    // Property-based testing
    "@jazzer.js/core": "^2.0.0", // Fuzz testing
    "k6": "^0.45.0"             // Load testing
  }
}
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Token mismatch | Update expected counts with provider |
| Precision loss | Use BigNumber for calculations |
| Timeouts | Increase test timeout or use parallel |
| No DB | Run `supabase start` |
| GPU fails | Check CUDA with `nvidia-smi` |
| Property test fails | Check edge cases and invariants |
| Fuzz test crashes | Add input validation |

## Test Quality Checklist

- [ ] Token tests match all providers
- [ ] Cost tests handle edge cases
- [ ] Property tests cover invariants
- [ ] Fuzz tests prevent crashes
- [ ] Load tests verify scalability
- [ ] Coverage meets requirements
- [ ] Tests run in <30 seconds

---

*Test enforcement reference for meterr.ai accuracy and security*