---
title: Testing Guide
description: Coverage targets, mock patterns, and E2E flows for meterr.ai
audience: ["human", "ai"]
status: ready
last_updated: 2025-01-14
owner: engineering
---

# Testing Guide

<!-- audience: human -->
## Overview

This guide establishes testing standards for meterr.ai to ensure reliable, high-quality code through comprehensive test coverage and consistent testing patterns.

## Testing Strategy

### Test Pyramid
1. **Unit Tests (70%)**: Individual functions and components
2. **Integration Tests (20%)**: API endpoints and database interactions
3. **End-to-End Tests (10%)**: Complete user workflows

### Coverage Targets
- **Overall Code Coverage**: >80%
- **Critical Path Coverage**: >95%
- **API Endpoint Coverage**: 100%
- **Business Logic Coverage**: >90%

### Testing Philosophy
- **Fast Feedback**: Unit tests run in <10 seconds
- **Reliable**: Tests don't flake or depend on external services
- **Maintainable**: Tests are easy to read and update
- **Realistic**: Use realistic test data and scenarios
<!-- /audience -->

<!-- audience: ai -->
## Unit Testing Standards

### Test Structure Pattern
```typescript
// Follow AAA pattern: Arrange, Act, Assert
describe('TokenCalculator', () => {
  describe('calculateCost()', () => {
    it('should calculate cost correctly for GPT-4', () => {
      // Arrange
      const calculator = new TokenCalculator();
      const tokens = 1000;
      const model = 'gpt-4';
      
      // Act
      const cost = calculator.calculateCost(tokens, model);
      
      // Assert
      expect(cost).toBe(0.03); // $0.03 for 1000 tokens
    });
    
    it('should throw error for invalid model', () => {
      // Arrange
      const calculator = new TokenCalculator();
      const tokens = 1000;
      const invalidModel = 'invalid-model';
      
      // Act & Assert
      expect(() => {
        calculator.calculateCost(tokens, invalidModel);
      }).toThrow('Unsupported model: invalid-model');
    });
  });
});
```

### Mock Patterns
```typescript
// Mock external dependencies
import { jest } from '@jest/globals';

// Mock database
const mockDb = {
  query: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

// Mock Redis
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
};

// Mock API responses
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

// Setup mocks before tests
beforeEach(() => {
  jest.clearAllMocks();
  
  // Setup default mock responses
  mockDb.query.mockResolvedValue([]);
  mockRedis.get.mockResolvedValue(null);
  mockOpenAI.chat.completions.create.mockResolvedValue({
    usage: { total_tokens: 100 }
  });
});
```

### Testing Async Functions
```typescript
describe('async functions', () => {
  it('should handle successful API calls', async () => {
    // Mock successful response
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Hello' } }],
      usage: { total_tokens: 50 }
    });
    
    const result = await callOpenAI('Hello world');
    
    expect(result.tokens).toBe(50);
    expect(result.response).toBe('Hello');
  });
  
  it('should handle API errors gracefully', async () => {
    // Mock error response
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error('API rate limit exceeded')
    );
    
    const result = await callOpenAI('Hello world');
    
    expect(result.ok).toBe(false);
    expect(result.error).toContain('rate limit');
  });
});
```

### React Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TokenCounter } from './TokenCounter';

describe('TokenCounter', () => {
  it('should display token count', () => {
    render(<TokenCounter initialCount={100} />);
    
    expect(screen.getByText('100 tokens')).toBeInTheDocument();
  });
  
  it('should update count when text changes', () => {
    render(<TokenCounter />);
    
    const textInput = screen.getByLabelText('Enter text');
    fireEvent.change(textInput, { 
      target: { value: 'Hello world' } 
    });
    
    expect(screen.getByText(/\d+ tokens/)).toBeInTheDocument();
  });
  
  it('should handle loading state', () => {
    render(<TokenCounter loading={true} />);
    
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```
<!-- /audience -->

## Integration Testing

### API Endpoint Testing
```typescript
import request from 'supertest';
import { app } from '../app';

describe('POST /api/smart-router/route', () => {
  let authToken: string;
  
  beforeEach(async () => {
    // Setup test database
    await seedTestData();
    
    // Get auth token
    authToken = await getTestAuthToken();
  });
  
  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData();
  });
  
  it('should route request successfully', async () => {
    const response = await request(app)
      .post('/api/smart-router/route')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        data: {
          text: 'Hello world',
          model: 'gpt-4'
        }
      });
      
    expect(response.status).toBe(200);
    expect(response.body.data.provider).toBeDefined();
    expect(response.body.data.cost).toBeGreaterThan(0);
  });
  
  it('should handle authentication errors', async () => {
    const response = await request(app)
      .post('/api/smart-router/route')
      .send({
        data: {
          text: 'Hello world',
          model: 'gpt-4'
        }
      });
      
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_REQUIRED');
  });
  
  it('should validate input data', async () => {
    const response = await request(app)
      .post('/api/smart-router/route')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        data: {
          text: '', // Invalid: empty text
          model: 'invalid-model' // Invalid: unsupported model
        }
      });
      
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});
```

### Database Testing
```typescript
import { db } from '../database';

describe('Database operations', () => {
  beforeEach(async () => {
    // Start transaction for isolation
    await db.raw('BEGIN');
  });
  
  afterEach(async () => {
    // Rollback transaction
    await db.raw('ROLLBACK');
  });
  
  it('should insert user correctly', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const [user] = await db('users').insert(userData).returning('*');
    
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user.id).toBeDefined();
    expect(user.created_at).toBeDefined();
  });
  
  it('should enforce unique email constraint', async () => {
    const userData = {
      email: 'duplicate@example.com',
      name: 'User 1'
    };
    
    // Insert first user
    await db('users').insert(userData);
    
    // Try to insert duplicate email
    await expect(
      db('users').insert({
        email: 'duplicate@example.com',
        name: 'User 2'
      })
    ).rejects.toThrow(/unique constraint/);
  });
});
```

## End-to-End Testing

### E2E Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test('should allow user to sign up and sign in', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.fill('[data-testid="name"]', 'Test User');
    
    // Submit form
    await page.click('[data-testid="signup-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify user info is displayed
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
  });
  
  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid email or password');
    
    // Verify still on login page
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Token Calculation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsTestUser(page);
  });
  
  test('should calculate tokens correctly', async ({ page }) => {
    await page.goto('/tools/token-calculator');
    
    // Enter text
    await page.fill('[data-testid="text-input"]', 'Hello, world!');
    
    // Select model
    await page.selectOption('[data-testid="model-select"]', 'gpt-4');
    
    // Click calculate
    await page.click('[data-testid="calculate-button"]');
    
    // Verify results
    await expect(page.locator('[data-testid="token-count"]')).toContainText('4');
    await expect(page.locator('[data-testid="cost-estimate"]')).toContainText('$0.0001');
  });
});
```

### E2E Test Helpers
```typescript
// Helper functions for E2E tests
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'TestPassword123!');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

export async function createTestApiKey(page: Page): Promise<string> {
  await page.goto('/settings/api-keys');
  await page.click('[data-testid="create-key-button"]');
  await page.fill('[data-testid="key-name"]', 'Test Key');
  await page.click('[data-testid="confirm-create"]');
  
  const apiKey = await page.locator('[data-testid="new-api-key"]').textContent();
  return apiKey!;
}

export async function seedTestData(): Promise<void> {
  // Setup test user and data
  await db('users').insert({
    email: 'test@example.com',
    name: 'Test User',
    password: await hashPassword('TestPassword123!')
  });
}
```

## Performance Testing

### Load Testing
```typescript
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function () {
  const response = http.post('https://api.meterr.ai/v1/smart-router/route', 
    JSON.stringify({
      data: {
        text: 'Hello world',
        model: 'gpt-4'
      }
    }), 
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.API_KEY}`,
      },
    }
  );
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Test Data Management

### Test Fixtures
```typescript
// Test data factories
export const UserFactory = {
  build: (overrides: Partial<User> = {}): User => ({
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date(),
    ...overrides
  }),
  
  buildMany: (count: number, overrides: Partial<User> = {}): User[] => {
    return Array.from({ length: count }, (_, i) => 
      UserFactory.build({ 
        id: `user_${i}`,
        email: `test${i}@example.com`,
        ...overrides 
      })
    );
  }
};

export const TokenDataFactory = {
  build: (overrides: Partial<TokenData> = {}): TokenData => ({
    id: 'token_123',
    user_id: 'user_123',
    count: 100,
    cost: 0.001,
    model: 'gpt-4',
    provider: 'openai',
    created_at: new Date(),
    ...overrides
  })
};
```

### Database Seeding
```typescript
export async function seedTestDatabase(): Promise<void> {
  // Clear existing data
  await db('tokens').del();
  await db('users').del();
  
  // Insert test users
  const users = UserFactory.buildMany(10);
  await db('users').insert(users);
  
  // Insert test tokens
  const tokens = users.flatMap(user => 
    TokenDataFactory.buildMany(5, { user_id: user.id })
  );
  await db('tokens').insert(tokens);
}

export async function cleanupTestDatabase(): Promise<void> {
  await db('tokens').del();
  await db('users').del();
}
```

## CI/CD Testing

### GitHub Actions Test Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:unit
        
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Maintenance

### Regular Test Reviews
- **Weekly**: Review failing tests and flaky tests
- **Monthly**: Update test data and fixtures
- **Quarterly**: Review test coverage and add missing tests
- **After incidents**: Add regression tests for bugs

### Test Quality Metrics
- **Test Execution Time**: Unit tests <10s, Integration <60s
- **Test Flakiness**: <1% flaky test rate
- **Test Coverage**: Monitor coverage trends
- **Test Maintainability**: Regular refactoring of test code

---
*Follow these patterns for comprehensive, reliable testing of meterr.ai*