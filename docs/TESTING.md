# AI Site Generator - Testing Infrastructure

This document outlines the comprehensive testing strategy implemented for the AI Site Generator project, following testing pyramid best practices.

## 📊 Testing Pyramid Structure

Our testing strategy follows the **testing pyramid** principle with the recommended distribution:

- **70% Unit Tests** - Fast, isolated component and utility testing
- **20% Integration Tests** - Service and API integration testing
- **10% End-to-End Tests** - Full user journey testing

## 🛠️ Testing Stack

### Core Testing Framework

- **Vitest** - Fast, modern test runner with TypeScript support
- **React Testing Library** - Component testing with user-centric approach
- **jsdom** - DOM simulation for unit tests
- **Playwright** - End-to-end browser testing

### Coverage & Quality

- **V8 Coverage Provider** - Accurate coverage reporting
- **ESLint** - Code quality and consistency
- **TypeScript** - Type safety validation
- **Coverage Thresholds** - 80% minimum for all metrics

## 🧪 Test Categories

### 1. Unit Tests (70%)

**Location:** `src/**/*.test.{ts,tsx}`

**Purpose:** Test individual components, utilities, and functions in isolation.

**Examples:**

- Component rendering and behavior
- Utility function logic
- State management
- Content processing
- Diff algorithms

**Run Commands:**

```bash
npm test                    # Run all unit tests
npm run test:unit          # Run only unit tests
npm run test:watch         # Watch mode for development
npm run test:ui            # Visual test interface
```

### 2. Integration Tests (20%)

**Location:** `src/**/*.integration.test.{ts,tsx}`

**Purpose:** Test interactions between services, APIs, and external dependencies.

**Examples:**

- AI service integration (Gemini API)
- GitHub API integration
- Authentication flows
- Data persistence
- Service communication

**Key Features:**

- Mock external APIs
- Test error scenarios
- Validate retry logic
- Check data transformation

### 3. End-to-End Tests (10%)

**Location:** `tests/e2e/**/*.spec.ts`

**Purpose:** Test complete user journeys and application workflows.

**Examples:**

- Authentication → Site Generation → Preview
- Error handling and recovery
- Accessibility compliance
- Cross-browser compatibility
- Performance validation

**Run Commands:**

```bash
npx playwright test                    # Run all E2E tests
npx playwright test --project=chromium # Run in specific browser
npx playwright test --ui               # Interactive mode
npx playwright show-report             # View test results
```

## 📈 Coverage Requirements

All tests must maintain **80% minimum coverage** across:

- **Statements:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%

**Coverage Reports:**

```bash
npm run test:coverage      # Generate coverage report
```

Coverage reports are generated in:

- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI
- `coverage/coverage-final.json` - JSON format

## 🔧 Quality Gates

### Automated Script

Run all quality checks at once:

```bash
./scripts/quality-gates.sh
```

### Manual Steps

Run individual quality checks:

```bash
npm run typecheck          # TypeScript type checking
npm run lint              # ESLint code quality
npm run test:coverage     # Tests with coverage
npm run build             # Production build
npm audit                 # Security audit
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs:

1. **Quality Gates Job**
   - Type checking
   - Linting
   - Unit & integration tests
   - Build verification
   - Security audit

2. **E2E Tests Job**
   - Cross-browser testing
   - User journey validation
   - Performance checks

3. **Security & Performance**
   - Vulnerability scanning
   - Lighthouse audits
   - Bundle analysis

## 🎯 Test Writing Guidelines

### Unit Tests

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup mocks and test environment
  });

  it('should handle expected behavior', () => {
    // Arrange: Set up test data
    // Act: Execute the function/render component
    // Assert: Verify expected outcomes
  });

  it('should handle error scenarios', () => {
    // Test error states and edge cases
  });
});
```

### Integration Tests

```typescript
describe('Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup service mocks
  });

  it('should integrate with external service', async () => {
    // Mock external API responses
    // Test service interaction
    // Verify data transformation
  });
});
```

### E2E Tests

```typescript
test('complete user journey', async ({ page }) => {
  // Navigate to application
  await page.goto('/');

  // Interact with UI elements
  await page.click('[data-testid="auth-button"]');

  // Assert expected outcomes
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

## 🔍 Debugging Tests

### Visual Debugging

```bash
npm run test:ui           # Interactive test UI
npx playwright test --debug # E2E debugging mode
```

### Coverage Analysis

- Use HTML coverage report to identify untested code
- Focus on critical paths and error scenarios
- Ensure edge cases are covered

### Mock Debugging

- Use `vi.fn().mockImplementation()` for detailed mock behavior
- Check mock call counts and arguments
- Verify mock setup in test failures

## 🚀 Continuous Integration

### GitHub Actions Triggers

- **Push to main/develop** - Full test suite
- **Pull requests** - All quality gates
- **Daily schedule** - Regression testing

### Success Criteria

- All tests pass
- Coverage thresholds met
- No linting errors
- No TypeScript errors
- Successful build
- Security audit passes

### Deployment Gates

Production deployment requires:

- ✅ All quality gates pass
- ✅ E2E tests pass in all browsers
- ✅ Performance budgets met
- ✅ Security scan clear

## 📚 Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/write-tests)

### Test Utilities

- `src/test-utils.ts` - Shared test utilities and mocks
- `src/setupTests.ts` - Global test configuration
- `vitest.config.ts` - Test runner configuration
- `playwright.config.ts` - E2E test configuration

## 🔄 Maintenance

### Regular Tasks

- **Weekly:** Review coverage reports and test failures
- **Monthly:** Update testing dependencies
- **Quarterly:** Review and update test strategies
- **Release:** Verify all quality gates pass

### Performance

- Monitor test execution time
- Optimize slow tests
- Parallelize where possible
- Keep test data minimal

### Reliability

- Fix flaky tests immediately
- Maintain stable test environment
- Update mocks when APIs change
- Review test failures in CI
