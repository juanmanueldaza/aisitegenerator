# Development Guidelines & Architecture Principles

This document outlines the architectural principles and development guidelines for the AI Site Generator project.

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

Each module/class/function has only one reason to change:

- **Components**: Handle only UI presentation logic
- **Hooks**: Manage specific state or side effect logic
- **Services**: Handle only one type of external integration
- **Utils**: Perform one specific utility function

### Open/Closed Principle (OCP)

Software entities should be open for extension but closed for modification:

- **Utilities**: Pure functions that can be extended but don't need modification
- **Service Interfaces**: Abstract contracts that can be implemented differently
- **Component Props**: Extensible through composition rather than modification

### Liskov Substitution Principle (LSP)

Objects should be replaceable with instances of their subtypes:

- **Service Implementations**: Any implementation of `IAuthService` should work interchangeably
- **Component Variants**: Different implementations should maintain the same contract

### Interface Segregation Principle (ISP)

Clients should not be forced to depend on interfaces they don't use:

- **Service Interfaces**: Separated by functionality (Auth, GitHub, AI, Site)
- **Type Definitions**: Granular interfaces instead of monolithic ones

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:

- **Service Layer**: Components depend on interfaces, not concrete implementations
- **Hooks**: Abstract business logic from UI components

## Clean Architecture Layers

### Presentation Layer (`components/`, `pages/`)

- React components for UI
- Props-driven, stateless when possible
- No direct business logic

### Application Layer (`hooks/`)

- Custom React hooks
- State management
- Orchestration between UI and business logic

### Domain Layer (`types/`)

- Business entities and value objects
- Type definitions and interfaces
- Domain-specific types

### Infrastructure Layer (`services/`)

- External integrations (GitHub API, AI services)
- Abstract interfaces and concrete implementations
- Data persistence and retrieval

### Cross-cutting Concerns (`utils/`)

- Shared utilities and helpers
- Pure functions
- No dependencies on other layers

## DRY (Don't Repeat Yourself) Implementation

### Custom Hooks

Reusable stateful logic:

```typescript
// ✅ Good: Reusable hook
const useAuth = () => {
  /* auth logic */
};

// ❌ Bad: Repeated auth logic in multiple components
```

### Utility Functions

Common operations:

```typescript
// ✅ Good: Centralized utility
export const formatDate = (date: Date) => {
  /* formatting logic */
};

// ❌ Bad: Date formatting repeated across components
```

### Type Definitions

Shared interfaces:

```typescript
// ✅ Good: Centralized types
export interface User {
  /* user properties */
}

// ❌ Bad: User interface repeated in multiple files
```

## KISS (Keep It Simple, Stupid) Guidelines

### Component Design

- Single responsibility per component
- Clear prop interfaces
- Minimal state management
- Predictable behavior

### Function Design

- Pure functions when possible
- Clear input/output contracts
- Minimal side effects
- Self-documenting code

### File Organization

- Intuitive folder structure
- Clear naming conventions
- Logical grouping
- Easy navigation

## Path Alias Strategy

Clean imports reduce cognitive load and improve maintainability:

```typescript
// ✅ Good: Clean path aliases
import { useAuth } from '@hooks';
import { User } from '@types';
import { formatDate } from '@utils';

// ❌ Bad: Relative paths
import { useAuth } from '../../../hooks/useAuth';
import { User } from '../../types/User';
import { formatDate } from '../../../utils/formatDate';
```

## Error Handling Strategy

### Consistent Error Types

```typescript
interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
```

### Service Layer Error Handling

```typescript
// Services return standardized responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Component Error Boundaries

- Graceful error recovery
- User-friendly error messages
- Error reporting and logging

## Testing Strategy (Implemented ✅)

Our comprehensive testing infrastructure follows the **testing pyramid** principle:

### Unit Tests (70% - ✅ Implemented)

- **Location**: `src/**/*.test.{ts,tsx}`
- **Framework**: Vitest + React Testing Library
- **Coverage**: All pure functions in utils, custom hooks logic, and component behavior
- **Examples**: Content processing, diff algorithms, state management, component rendering

**Current Status**: 28 unit tests passing with high coverage

### Integration Tests (20% - ✅ Implemented)

- **Location**: `src/**/*.integration.test.{ts,tsx}`
- **Focus**: Service layer interactions, component integration, API mocking
- **Examples**:
  - AI service integration (Gemini API)
  - Authentication workflows
  - Error handling scenarios
  - Streaming responses

**Current Status**: 10 integration tests covering critical service interactions

### E2E Tests (10% - ✅ Ready)

- **Location**: `tests/e2e/**/*.spec.ts`
- **Framework**: Playwright
- **Coverage**: Critical user paths, cross-browser compatibility, performance validation
- **Examples**: Complete auth → generate → preview workflows

**Current Status**: E2E infrastructure ready, tests can be enabled with `RUN_E2E=true`

### Quality Gates (✅ Implemented)

**Automated Script**: `./scripts/quality-gates.sh`

- TypeScript type checking
- ESLint code quality
- Tests with 80% coverage minimum
- Production build verification
- Security audit

**CI/CD Integration**: GitHub Actions pipeline with cross-browser testing

### Coverage Requirements

- **Minimum**: 80% across all metrics (statements, branches, functions, lines)
- **Current**: Meeting all thresholds
- **Reports**: HTML, JSON, and LCOV formats generated

## Code Quality Tools

### ESLint Rules

- TypeScript strict checking
- React best practices
- Import organization
- Unused code detection

### Prettier Configuration

- Consistent formatting
- Team collaboration
- Automated styling

### Husky Pre-commit Hooks

- Automated quality checks
- Code formatting
- Test execution
- Build validation

## Performance Considerations

### Bundle Optimization

- Tree shaking
- Code splitting
- Lazy loading
- Asset optimization

### Runtime Performance

- Memoization strategies
- Efficient re-renders
- State management optimization
- Memory leak prevention

## Security Principles

### Type Safety

- Strict TypeScript configuration
- Runtime type validation
- Null safety

### Input Validation

- User input sanitization
- API response validation
- XSS prevention

### Authentication & Authorization

- Secure token handling
- Session management
- Access control

---

These principles guide our development process to ensure maintainable, scalable, and robust code that follows industry best practices.
