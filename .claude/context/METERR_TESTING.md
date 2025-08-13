# METERR Testing - Claude Context

## Test Locations

```
apps/app/__tests__/         # Main app tests
apps/app/scripts/__tests__/ # Script tests
packages/@meterr/*/tests/   # Package tests
```

## Test Commands

```bash
pnpm test              # All tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
pnpm test token        # Token tests only
pnpm test:perf         # Performance tests
```

## Critical Test Requirements

### Must Test (100% Coverage)
- Token counting accuracy
- Cost calculations (6 decimal precision)
- API key encryption
- Billing operations

### Standard Tests (80% Coverage)
- API endpoints
- React components
- Database queries

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

### API Test Pattern
```typescript
it("should handle errors", async () => {
  const response = await fetch("/api/endpoint", {
    method: "POST",
    body: JSON.stringify(invalidData)
  });
  expect(response.status).toBe(400);
});
```

## Performance Targets

- Dashboard load: <1 second
- API response: <100ms
- Token processing: 100k tokens/second
- Test suite: <30 seconds

## Hardware Utilization

```bash
# Use all 32 threads
pnpm test --maxWorkers=32

# GPU tests
CUDA_VISIBLE_DEVICES=0 pnpm test:gpu
```

## Common Issues

- Token mismatch: Update expected counts
- Timeouts: Increase test timeout
- No DB: Run `supabase start`
- GPU fails: Check CUDA with `nvidia-smi`

---

*Test implementation reference for meterr.ai*