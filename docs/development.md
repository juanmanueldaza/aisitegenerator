# Development Guide

This guide covers the development workflow, coding standards, and best practices for the AI Site Generator project.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Development Scripts](#development-scripts)
- [Debugging](#debugging)
- [Performance](#performance)

## Development Setup

### Prerequisites

- Node.js 16+ and npm 8+
- Git
- Visual Studio Code (recommended)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/juanmanueldaza/aisitegenerator.git
   cd aisitegenerator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers (for E2E tests):**
   ```bash
   npx playwright install
   ```

4. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### VS Code Setup

Recommended extensions:

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Jest Runner
- Playwright Test for VSCode

**VS Code Settings (.vscode/settings.json):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "jest.autoRun": "off"
}
```

## Project Architecture

### Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── forms/          # Form-specific components
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   └── __tests__/      # Component tests
├── hooks/              # Custom React hooks
│   ├── __tests__/      # Hook tests
│   ├── useAuth.ts      # Authentication hook
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── services/           # External API services
│   ├── __tests__/      # Service tests
│   ├── GitHubService.ts
│   ├── GeminiService.ts
│   └── ApiClient.ts
├── types/              # TypeScript type definitions
│   ├── index.ts        # Common types
│   ├── github.ts       # GitHub-specific types
│   └── gemini.ts       # Gemini-specific types
├── utils/              # Utility functions
│   ├── __tests__/      # Utility tests
│   ├── constants.ts    # Application constants
│   ├── helpers.ts      # Helper functions
│   └── validation.ts   # Validation utilities
├── mocks/              # Mock data for testing
│   ├── handlers.ts     # MSW request handlers
│   └── data.ts         # Mock data objects
├── test/               # Test configuration
│   └── setup.ts        # Jest setup file
├── styles/             # Global styles and themes
└── assets/             # Static assets (images, icons, etc.)
```

### Architecture Principles

1. **Component-Based Architecture**: Build reusable, composable components
2. **Separation of Concerns**: Keep business logic separate from UI logic
3. **Single Responsibility**: Each module should have one reason to change
4. **Dependency Injection**: Pass dependencies as props or context
5. **Error Boundaries**: Handle errors gracefully at appropriate levels

### Data Flow

```
User Interaction
    ↓
Component (UI)
    ↓
Hook (State Management)
    ↓
Service (API Communication)
    ↓
External API
```

## Coding Standards

### TypeScript

- **Always use TypeScript**: No plain JavaScript files except configuration
- **Strict Mode**: Enabled for better type safety
- **Explicit Types**: Define interfaces for all data structures
- **No `any`**: Use specific types or `unknown` when necessary

**Example:**

```typescript
// ✅ Good
interface UserProps {
  user: GitHubUser;
  onUpdate: (user: GitHubUser) => void;
}

const UserComponent: React.FC<UserProps> = ({ user, onUpdate }) => {
  // Component implementation
};

// ❌ Bad
const UserComponent = ({ user, onUpdate }: any) => {
  // Component implementation
};
```

### React Components

- **Functional Components**: Use function components with hooks
- **TypeScript Props**: Always type component props
- **Default Props**: Use default parameters instead of defaultProps
- **Destructuring**: Destructure props in function signature

**Example:**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Hooks

- **Custom Hooks**: Extract reusable logic into custom hooks
- **Single Responsibility**: Each hook should have a clear, single purpose
- **Return Objects**: Return objects instead of arrays for better naming

**Example:**

```typescript
// ✅ Good
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  return {
    user,
    loading,
    login: (credentials: Credentials) => {},
    logout: () => {},
  };
};

// ❌ Bad
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  return [user, loading, login, logout]; // Hard to remember order
};
```

### Error Handling

- **Custom Error Classes**: Create specific error types
- **Error Boundaries**: Use React error boundaries for UI errors
- **Async Error Handling**: Always handle promise rejections

**Example:**

```typescript
class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

// In component
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  try {
    setError(null);
    await submitData();
  } catch (err) {
    if (err instanceof GitHubAPIError) {
      setError(`GitHub API Error: ${err.message}`);
    } else {
      setError('An unexpected error occurred');
    }
  }
};
```

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add GitHub OAuth integration
fix(api): handle rate limiting errors
docs(readme): update installation instructions
test(services): add GitHubService unit tests
```

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run all tests and linting
4. Create pull request with descriptive title and description
5. Request code review
6. Address review comments
7. Merge after approval

### Pre-commit Hooks

Husky is configured to run pre-commit hooks:

- ESLint checking
- Prettier formatting
- TypeScript compilation
- Test execution

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run test:e2e       # Run E2E tests
npm run test:e2e:ui    # Run E2E tests with UI

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
npm run type-check     # TypeScript type checking

# Documentation
npm run docs:build     # Generate API documentation
npm run docs:serve     # Serve documentation locally
```

## Debugging

### Browser DevTools

- **React Developer Tools**: Install for component debugging
- **Redux DevTools**: For state management debugging (if added later)
- **Network Tab**: Monitor API requests and responses

### VS Code Debugging

**Launch Configuration (.vscode/launch.json):**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "node",
      "program": "${workspaceFolder}/node_modules/vite/bin/vite.js",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Common Debugging Scenarios

1. **Component Not Rendering**: Check props, state, and conditional rendering
2. **API Calls Failing**: Check network tab, authentication, and error handling
3. **State Not Updating**: Verify state mutations and effect dependencies
4. **Performance Issues**: Use React Profiler and browser performance tools

## Performance

### Optimization Strategies

1. **Code Splitting**: Use dynamic imports for route-based splitting
2. **Lazy Loading**: Load components and resources on demand
3. **Memoization**: Use React.memo, useMemo, and useCallback appropriately
4. **Bundle Analysis**: Regularly analyze bundle size

### Performance Monitoring

```typescript
// Component performance measurement
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  return <div>{processedData}</div>;
});

// API performance monitoring
const measureAPICall = async (apiCall: () => Promise<any>) => {
  const start = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - start;
    console.log(`API call took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`API call failed after ${duration}ms:`, error);
    throw error;
  }
};
```

### Bundle Size Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for large dependencies
npm list --depth=0
npx bundlephobia [package-name]
```

## Best Practices

1. **Keep Components Small**: Aim for components under 100 lines
2. **Use Composition**: Prefer composition over inheritance
3. **Avoid Prop Drilling**: Use context for deeply nested props
4. **Handle Loading States**: Always show loading indicators
5. **Implement Error States**: Gracefully handle and display errors
6. **Write Tests First**: Follow TDD when possible
7. **Document Complex Logic**: Add comments for business logic
8. **Review Security**: Sanitize user inputs and validate data