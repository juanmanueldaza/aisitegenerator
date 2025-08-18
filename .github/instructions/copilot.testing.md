# Testing Guidelines for AI Site Generator

This document outlines comprehensive testing strategies, best practices, and standards for the AI Site Generator project.

## 🎯 Testing Philosophy

We follow a **quality-first approach** to testing, emphasizing:

- **User-centric testing**: Tests should validate user workflows and experiences
- **Comprehensive coverage**: Unit, integration, and E2E tests working together
- **Fast feedback loops**: Quick test execution for rapid development
- **Reliable automation**: Tests that consistently pass/fail based on actual issues
- **Maintainable test code**: Clean, readable tests that evolve with the codebase

## 📊 Testing Strategy

### Testing Pyramid

```
     E2E Tests (10%)
   ├─ Critical user journeys
   ├─ Cross-browser compatibility
   └─ Real API interactions

  Integration Tests (20%)
   ├─ Component interactions
   ├─ API integration flows
   ├─ Authentication workflows
   └─ State management

    Unit Tests (70%)
     ├─ Pure functions & utilities
     ├─ React components in isolation
     ├─ Custom hooks
     └─ Service layer functions
```

### Coverage Targets

- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 90%
- **Lines**: 85%

### Test Categories

1. **Unit Tests** (`*.test.ts`, `*.test.tsx`)
   - Pure function testing
   - Component behavior testing
   - Hook logic testing
   - Service method testing

2. **Integration Tests** (`*.integration.test.ts`)
   - API workflow testing
   - Component integration testing
   - Authentication flow testing
   - Data flow testing

3. **End-to-End Tests** (`*.spec.ts` in `/tests/e2e/`)
   - User journey testing
   - Cross-browser testing
   - Performance testing
   - Accessibility testing

## 🧪 Unit Testing Standards

### Component Testing

```typescript
// ✅ Good: Comprehensive component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ComponentName } from '../ComponentName';

// Test structure
describe('ComponentName', () => {
  // Mock setup
  const mockProps = {
    onAction: vi.fn(),
    data: mockData
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Rendering tests
  it('should render with required props', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Interaction tests
  it('should handle user interactions correctly', async () => {
    const user = userEvent.setup();
    render(<ComponentName {...mockProps} />);

    await user.click(screen.getByRole('button'));

    expect(mockProps.onAction).toHaveBeenCalledWith(expectedValue);
  });

  // State management tests
  it('should update state correctly', async () => {
    render(<ComponentName {...mockProps} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new value' }
    });

    expect(screen.getByDisplayValue('new value')).toBeInTheDocument();
  });

  // Error handling tests
  it('should handle errors gracefully', () => {
    const errorProps = { ...mockProps, data: null };
    render(<ComponentName {...errorProps} />);

    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// ✅ Good: Custom hook test
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useCustomHook());

    expect(result.current.value).toBe(initialValue);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle async operations correctly', async () => {
    const { result } = renderHook(() => useCustomHook());

    await act(async () => {
      await result.current.performAction();
    });

    expect(result.current.value).toBe(expectedValue);
  });

  it('should cleanup resources on unmount', () => {
    const cleanupSpy = vi.fn();
    vi.mocked(someService.cleanup).mockImplementation(cleanupSpy);

    const { unmount } = renderHook(() => useCustomHook());
    unmount();

    expect(cleanupSpy).toHaveBeenCalled();
  });
});
```

### Service Testing

```typescript
// ✅ Good: Service class test
describe('ServiceName', () => {
  let service: ServiceName;
  let mockHttpClient: MockHttpClient;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    service = new ServiceName(mockHttpClient);
  });

  describe('methodName', () => {
    it('should handle successful response', async () => {
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await service.methodName(inputData);

      expect(result).toEqual(expectedResult);
      expect(mockHttpClient.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should handle errors appropriately', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'));

      await expect(service.methodName(inputData)).rejects.toThrow('API Error');
    });

    it('should validate input parameters', async () => {
      await expect(service.methodName(invalidInput)).rejects.toThrow(ValidationError);
    });
  });
});
```

## 🔗 Integration Testing Standards

### API Integration Tests

```typescript
// ✅ Good: Integration test with real APIs
describe('GitHub Integration', () => {
  let githubService: GitHubService;

  beforeAll(async () => {
    githubService = new GitHubService(TEST_TOKEN);
  });

  afterEach(async () => {
    // Cleanup any created resources
    await cleanupTestResources();
  });

  it('should create and deploy site successfully', async () => {
    // Step 1: Create repository
    const repo = await githubService.createRepository({
      name: `test-repo-${Date.now()}`,
      description: 'Integration test repository',
    });

    expect(repo).toHaveProperty('id');
    expect(repo.name).toMatch(/^test-repo-/);

    // Step 2: Upload files
    await githubService.uploadFiles(repo.full_name, testFiles);

    // Step 3: Enable Pages
    const pages = await githubService.enablePages(repo.full_name);

    expect(pages.status).toBe('built');

    // Step 4: Verify deployment
    await waitForDeployment(pages.html_url);

    const response = await fetch(pages.html_url);
    expect(response.status).toBe(200);
  });
});
```

### Component Integration Tests

```typescript
// ✅ Good: Component integration test
describe('Chat to Preview Integration', () => {
  it('should complete full workflow from prompt to preview', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <ChatInterface />
        <LivePreview />
      </TestProviders>
    );

    // Enter prompt
    const input = screen.getByPlaceholder(/describe your website/i);
    await user.type(input, 'Create a portfolio site');

    // Generate site
    await user.click(screen.getByRole('button', { name: /generate/i }));

    // Wait for generation
    await waitFor(() => {
      expect(screen.getByText(/generation complete/i)).toBeInTheDocument();
    });

    // Verify preview appears
    const previewFrame = screen.getByTitle(/site preview/i);
    expect(previewFrame).toBeInTheDocument();

    // Verify preview content
    await waitFor(() => {
      const frameDocument = previewFrame.contentDocument;
      expect(frameDocument.querySelector('h1')).toBeInTheDocument();
    });
  });
});
```

## 🎭 End-to-End Testing Standards

### User Journey Tests

```typescript
// ✅ Good: Complete user journey test
import { test, expect } from '@playwright/test';

test.describe('Site Generation User Journey', () => {
  test('should complete full workflow from auth to deployment', async ({ page }) => {
    // Authentication
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Mock OAuth (in test environment)
    await page.goto('/auth/callback?code=test&state=test');
    await expect(page.getByText(/welcome/i)).toBeVisible();

    // Site generation
    await page.getByPlaceholder(/describe/i).fill('Portfolio for designer');
    await page.getByRole('button', { name: /generate/i }).click();

    // Wait for generation
    await expect(page.getByTestId('site-preview')).toBeVisible({ timeout: 30000 });

    // Deploy
    await page.getByRole('button', { name: /deploy/i }).click();
    await page.getByLabel(/repository name/i).fill('test-portfolio');
    await page.getByRole('button', { name: /create/i }).click();

    // Verify deployment
    await expect(page.getByText(/deployment successful/i)).toBeVisible({ timeout: 60000 });

    const deployUrl = await page.getByTestId('deploy-url').textContent();
    expect(deployUrl).toMatch(/github\.io/);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Service unavailable' }),
      });
    });

    await page.goto('/');
    await page.getByPlaceholder(/describe/i).fill('Test site');
    await page.getByRole('button', { name: /generate/i }).click();

    await expect(page.getByText(/service unavailable/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  });
});
```

### Cross-Browser Testing

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

## 📊 Test Quality Metrics

### Code Coverage

```javascript
// vitest.config.ts coverage configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 85,
          statements: 85,
        },
        // Per-file thresholds for critical modules
        'src/services/': {
          branches: 85,
          functions: 95,
          lines: 90,
          statements: 90,
        },
      },
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.config.*', 'src/setupTests.ts'],
    },
  },
});
```

### Performance Testing

```typescript
// Performance testing with Playwright
test('should load within performance budget', async ({ page }) => {
  await page.goto('/');

  // Measure load performance
  const performanceEntries = await page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('navigation'));
  });

  const navTiming = JSON.parse(performanceEntries)[0];
  const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;

  expect(loadTime).toBeLessThan(3000); // 3 second budget
});
```

## 🔄 Continuous Testing

### GitHub Actions Integration

```yaml
# .github/workflows/test.yml
name: Comprehensive Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-integration:
    runs-on: ubuntu-latest
    needs: test-unit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:integration
        env:
          TEST_GITHUB_TOKEN: ${{ secrets.TEST_GITHUB_TOKEN }}

  test-e2e:
    runs-on: ubuntu-latest
    needs: [test-unit, test-integration]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Quality Gates

```bash
#!/bin/bash
# scripts/quality-gates.sh

set -e

echo "🧪 Running quality gates..."

# Type checking
echo "📝 Type checking..."
npm run typecheck

# Linting
echo "🔍 Linting..."
npm run lint

# Unit tests with coverage
echo "🧪 Unit tests..."
npm run test

# Build verification
echo "🏗️ Build verification..."
npm run build

# E2E tests
echo "🎭 E2E tests..."
npm run e2e

echo "✅ All quality gates passed!"
```

## 🎯 AI Site Generator Specific Testing

### AI Service Testing

```typescript
describe('AI Content Generation', () => {
  const testPrompts = [
    {
      input: 'Create a simple blog',
      expectations: {
        hasValidHtml: true,
        hasCss: true,
        containsElements: ['header', 'main', 'article'],
        isAccessible: true,
      },
    },
    {
      input: 'Build an e-commerce site',
      expectations: {
        hasValidHtml: true,
        hasCss: true,
        containsElements: ['nav', 'product-grid', 'cart'],
        isResponsive: true,
      },
    },
  ];

  testPrompts.forEach(({ input, expectations }) => {
    it(`should generate appropriate content for: "${input}"`, async () => {
      const result = await aiService.generateSite(input);

      // Validate HTML structure
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toMatch(/<html[^>]*>/);

      // Validate expected elements
      expectations.containsElements.forEach((element) => {
        expect(result.html).toMatch(new RegExp(`<[^>]*${element}`, 'i'));
      });

      // Validate CSS
      if (expectations.hasCss) {
        expect(result.css).toBeTruthy();
        expect(result.css.length).toBeGreaterThan(0);
      }

      // Accessibility check
      if (expectations.isAccessible) {
        expect(result.html).toMatch(/<html[^>]*lang=/);
        expect(result.html).toContain('<title>');
      }
    });
  });
});
```

### GitHub Integration Testing

```typescript
describe('GitHub Deployment Integration', () => {
  it('should handle full deployment workflow', async () => {
    const siteData = await aiService.generateSite('Test portfolio');

    // Create repository
    const repo = await githubService.createRepository({
      name: `test-site-${Date.now()}`,
      description: 'Test deployment',
    });

    // Upload files
    const files = [
      { path: 'index.html', content: siteData.html },
      { path: 'styles.css', content: siteData.css },
    ];

    await githubService.uploadFiles(repo.full_name, files);

    // Configure Pages
    const pages = await githubService.enablePages(repo.full_name);
    expect(pages.status).toBe('built');

    // Cleanup
    await githubService.deleteRepository(repo.full_name);
  });
});
```

## 🏷️ Test Organization

### File Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # Unit tests
│   │   └── Button.integration.test.tsx  # Integration tests
│   └── Chat/
│       ├── ChatInterface.tsx
│       └── ChatInterface.test.tsx
├── services/
│   ├── ai/
│   │   ├── gemini.ts
│   │   ├── gemini.test.ts
│   │   └── gemini.integration.test.ts
│   └── github/
│       ├── api.ts
│       └── api.test.ts
├── utils/
│   ├── validation.ts
│   └── validation.test.ts
└── __tests__/
    ├── setup.ts
    ├── mocks/
    │   ├── handlers.ts
    │   └── server.ts
    └── fixtures/
        ├── sampleSites.ts
        └── mockResponses.ts

tests/
└── e2e/
    ├── auth.spec.ts
    ├── site-generation.spec.ts
    └── deployment.spec.ts
```

### Test Naming Conventions

- **Unit tests**: `ComponentName.test.tsx`, `serviceName.test.ts`
- **Integration tests**: `feature.integration.test.ts`
- **E2E tests**: `user-journey.spec.ts`

### Test Categories

Use describe blocks to organize tests:

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    // Rendering tests
  });

  describe('User Interactions', () => {
    // Interaction tests
  });

  describe('Error Handling', () => {
    // Error scenario tests
  });

  describe('Performance', () => {
    // Performance-related tests
  });
});
```

## 📝 Best Practices Summary

1. **Write tests first** for new features (TDD approach)
2. **Test behavior, not implementation** details
3. **Use descriptive test names** that explain what is being tested
4. **Keep tests independent** - no shared state between tests
5. **Mock external dependencies** appropriately
6. **Test error scenarios** as thoroughly as success scenarios
7. **Maintain test code quality** with the same standards as production code
8. **Run tests frequently** during development
9. **Review test coverage** regularly and identify gaps
10. **Update tests** when requirements change

Remember: **Good tests are an investment in code quality, developer confidence, and user satisfaction.**
