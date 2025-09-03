# Testing Documentation

## Overview

This project uses a comprehensive testing strategy with multiple layers:
- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test database operations and API endpoints
- **End-to-End Tests**: Test complete user workflows through the UI

## Test Stack

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **Supertest**: API endpoint testing

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests
```bash
npm run test:unit          # Run all unit tests
npm run test:unit:watch    # Watch mode
npm run test:coverage      # With coverage report
```

### Integration Tests
```bash
npm run test:integration   # Run all integration tests
```

### End-to-End Tests
```bash
npm run test:e2e           # Run headless
npm run test:e2e:headed    # Run with browser visible
npm run test:e2e:ui        # Run with Playwright UI
npm run test:e2e:debug     # Debug mode
```

## Test Structure

```
__tests__/
├── unit/                  # Unit tests
│   ├── api/              # API route tests
│   ├── components/       # React component tests
│   └── lib/              # Utility function tests
├── integration/          # Integration tests
│   ├── database/         # Database operation tests
│   └── services/         # Service integration tests
├── e2e/                  # End-to-end tests
│   └── *.spec.ts        # User flow tests
└── utils/               # Test utilities
    └── test-helpers.ts  # Shared test helpers
```

## Test Coverage Areas

### 1. Cash Advance System
- **Unit Tests**
  - Advance request validation
  - Credit limit calculations
  - Status transitions
  - Number generation

- **Integration Tests**
  - Database transactions
  - Wallet updates
  - Repayment tracking
  - Audit logging

- **E2E Tests**
  - Complete advance request flow
  - Admin approval workflow
  - Disbursement process
  - Repayment handling

### 2. Wallet Management
- **Unit Tests**
  - Balance calculations
  - Transaction creation
  - Hold/release logic

- **Integration Tests**
  - Wallet creation
  - Transaction history
  - Credit limit enforcement

### 3. User Interface
- **Component Tests**
  - Navigation menu
  - Form validation
  - Modal interactions
  - Table sorting/filtering

- **E2E Tests**
  - Login/logout
  - Navigation
  - Mobile responsiveness
  - Error handling

### 4. API Endpoints
- **Unit Tests**
  - Request validation
  - Response formatting
  - Error handling
  - Authentication

- **Integration Tests**
  - Database operations
  - Transaction rollback
  - Concurrent requests

## Writing Tests

### Unit Test Example
```typescript
describe('Advance Validation', () => {
  it('should reject amount exceeding limit', () => {
    const result = validateAdvanceAmount(6000, 5000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds limit')
  })
})
```

### Integration Test Example
```typescript
describe('Database Operations', () => {
  it('should create advance with wallet update', async () => {
    await prisma.$transaction(async (tx) => {
      const advance = await tx.cashAdvance.create({...})
      const wallet = await tx.sellerWallet.update({...})
      expect(advance.status).toBe('PENDING')
      expect(wallet.totalAdvances).toBe(1000)
    })
  })
})
```

### E2E Test Example
```typescript
test('User can request advance', async ({ page }) => {
  await page.goto('/advances')
  await page.click('button:has-text("Request Advance")')
  await page.fill('input[name="amount"]', '1000')
  await page.click('button:has-text("Submit")')
  await expect(page.locator('.toast')).toContainText('Success')
})
```

## Test Data Management

### Setup
- Use `test-helpers.ts` for creating test data
- Each test should be independent
- Clean up data after tests

### Test Database
For integration tests, use a separate test database:
```bash
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
```

### Mocking
- Mock external services
- Mock authentication in unit tests
- Use real database for integration tests

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:all
```

## Best Practices

1. **Test Naming**
   - Use descriptive test names
   - Follow "should [expected behavior] when [condition]" pattern

2. **Test Isolation**
   - Each test should be independent
   - Use beforeEach/afterEach for setup/cleanup

3. **Assertions**
   - Use specific assertions
   - Test both success and failure cases
   - Verify error messages

4. **Performance**
   - Keep unit tests fast (<100ms)
   - Use test databases for integration tests
   - Parallelize E2E tests when possible

5. **Maintenance**
   - Update tests when features change
   - Remove obsolete tests
   - Keep test code DRY with helpers

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure test database is running
   - Check DATABASE_URL in test environment

2. **Timeout Errors**
   - Increase timeout for slow operations
   - Check for unresolved promises

3. **Flaky Tests**
   - Add proper waits in E2E tests
   - Use data-testid attributes
   - Avoid timing-dependent assertions

### Debug Commands
```bash
# Run specific test file
npm test -- advances.test.ts

# Run tests matching pattern
npm test -- --grep "wallet"

# Debug Playwright test
npx playwright test --debug

# View test coverage
npm run test:coverage
open coverage/lcov-report/index.html
```

## Coverage Goals

- **Overall**: 80% coverage
- **Critical paths**: 95% coverage
- **API endpoints**: 90% coverage
- **UI components**: 70% coverage

## Contributing

When adding new features:
1. Write unit tests first (TDD)
2. Add integration tests for database operations
3. Create E2E tests for user workflows
4. Ensure all tests pass before submitting PR
5. Maintain or improve coverage