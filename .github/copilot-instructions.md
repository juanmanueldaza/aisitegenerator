# GitHub Copilot Instructions for AI Site Generator

## Project Overview

The **AI Site Generator** is a modern React TypeScript application that enables users to create websites step-by-step with AI assistance. It features a sci-fi themed UI with glassmorphism effects, live preview capabilities, Markdown support, Mermaid diagrams, and seamless GitHub integration for deployment.

### Key Features

- **AI-Powered Content Generation**: Support for multiple AI providers (Google Gemini, OpenAI, Anthropic, Cohere)
- **Live Preview**: Real-time preview of generated content with Markdown and Mermaid rendering
- **GitHub Integration**: OAuth authentication and deployment to GitHub Pages
- **Modern UI**: Custom sci-fi theme using DaisyUI and Tailwind CSS with glassmorphism effects
- **Type-Safe Architecture**: Full TypeScript implementation with strict typing
- **Clean Architecture**: SOLID principles with clear separation of concerns
- **Comprehensive Testing**: Unit tests (Vitest), integration tests, and E2E tests (Playwright)

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite 7** for build tooling and development server
- **Tailwind CSS 3.4** + **DaisyUI 5.0** for styling
- **Custom Sci-Fi Theme** with glassmorphism and neon effects

### Development & Quality

- **ESLint** + **Prettier** for code quality
- **Husky** + **lint-staged** for pre-commit hooks
- **TypeScript** with strict configuration
- **Vitest** + **React Testing Library** for unit/integration tests
- **Playwright** for E2E testing

### Architecture

- **Clean Architecture** with SOLID principles
- **Dependency Injection** container pattern
- **Custom Hooks** following DRY principle
- **Service Layer** abstraction
- **Path Mapping** for clean imports (`@/*`, `@components/*`, etc.)

## Project Structure

```
src/
├── components/          # UI components (presentational layer)
│   ├── ui/             # Reusable UI components (buttons, inputs, etc.)
│   ├── auth/           # Authentication-related components
│   ├── chat/           # Chat interface components
│   ├── deployment/     # Deployment-related components
│   └── LivePreview/    # Live preview functionality
├── hooks/              # Custom React hooks (application layer)
│   ├── index.ts        # Main hooks export with DRY implementations
│   ├── useChat.ts      # Chat functionality
│   ├── useDeployment.ts # Deployment logic
│   └── useLocalStorage.ts # Storage utilities
├── services/           # Service layer (domain/infrastructure)
│   ├── interfaces.ts   # Abstract service interfaces (SOLID)
│   ├── ai/            # AI provider integrations
│   ├── github/        # GitHub API integrations
│   └── site/          # Site management services
├── types/              # TypeScript type definitions
│   ├── index.ts        # Main types export
│   ├── ai.ts          # AI-related types
│   ├── github.ts      # GitHub integration types
│   └── common.ts      # Shared/common types
├── utils/              # Pure utility functions
│   ├── content.ts     # Content processing utilities
│   ├── array.ts       # Array manipulation helpers
│   └── index.ts       # Main utils export
├── di/                 # Dependency injection
│   ├── container.ts   # DI container implementation
│   └── service-registry.ts # Service registration
└── store/              # State management (Zustand)
    └── siteStore.ts    # Site configuration state
```

## Coding Conventions

### TypeScript Best Practices

- **Strict Mode**: All TypeScript strict checks enabled
- **Interface Segregation**: Small, focused interfaces following SOLID
- **Type Safety**: Avoid `any`, use proper union types and generics
- **Path Mapping**: Use `@/*` imports for clean, relative-path-free code

### React Patterns

- **Functional Components** with hooks (no class components)
- **Custom Hooks** for reusable logic (DRY principle)
- **Props Interface**: Define props types for all components
- **Error Boundaries**: Implement error handling at component level

### Naming Conventions

- **Components**: PascalCase (e.g., `ChatTab`, `UserProfile`)
- **Hooks**: camelCase with `use` prefix (e.g., `useChat`, `useLocalStorage`)
- **Types**: PascalCase with descriptive names (e.g., `ChatMessage`, `SiteConfiguration`)
- **Files**: kebab-case for components, camelCase for utilities
- **Services**: PascalCase with `I` prefix for interfaces (e.g., `IAuthService`)

### File Organization

- **Barrel Exports**: Use `index.ts` files for clean imports
- **Single Responsibility**: One component/hook/service per file
- **Co-location**: Keep related files together (styles, tests, types)

## Development Workflow

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run quality gates (typecheck + lint + test + build)
npm run quality-gates
```

### Available Scripts

- `npm run dev` - Development server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` / `npm run lint:fix` - ESLint checking/fixing
- `npm run format` - Prettier formatting
- `npm run typecheck` - TypeScript type checking
- `npm run test` - Run all tests
- `npm run test:coverage` - Tests with coverage report
- `npm run test:watch` - Watch mode for development
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:e2e` - E2E tests with Playwright

### Quality Gates

The project uses automated quality gates that must pass:

1. **TypeScript Type Checking** (`npm run typecheck`)
2. **ESLint Code Quality** (`npm run lint`)
3. **Test Coverage** (`npm run test:coverage`) - Minimum 80%
4. **Production Build** (`npm run build`)

### Pre-commit Hooks

- **Husky** + **lint-staged** ensure code quality before commits
- Automatic formatting and linting fixes
- Type checking validation

## Testing Strategy

### Testing Pyramid

- **70% Unit Tests**: Component and utility testing
- **20% Integration Tests**: Service and hook testing
- **10% E2E Tests**: Critical user journey testing

### Testing Tools

- **Vitest** for fast unit/integration testing
- **React Testing Library** for component testing
- **Playwright** for E2E testing
- **jsdom** for DOM simulation
- **@testing-library/jest-dom** for custom matchers

### Test File Conventions

- **Unit Tests**: `*.test.ts` or `*.test.tsx`
- **Integration Tests**: `*.integration.test.ts`
- **E2E Tests**: Located in `tests/e2e/`
- **Test Utilities**: `src/test-utils.ts` and `src/setupTests.ts`

## Architecture Patterns

### Clean Architecture Layers

1. **Presentation Layer**: React components and hooks
2. **Application Layer**: Use cases and application services
3. **Domain Layer**: Business entities and domain services
4. **Infrastructure Layer**: External APIs and implementations

### SOLID Principles Implementation

- **Single Responsibility**: Each module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes are substitutable for base types
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### Dependency Injection

- **Service Container**: Centralized service registration
- **Interface-based**: Services implement abstract interfaces
- **Testable**: Easy mocking for unit tests

## UI/UX Guidelines

### Sci-Fi Design System

- **Primary Colors**: Electric cyan (#00d4ff), Indigo (#6366f1), Purple (#a855f7)
- **Background**: Dark slate theme (#0f172a, #1e293b)
- **Glassmorphism**: Backdrop blur and translucent surfaces
- **Neon Effects**: Subtle lighting effects on interactive elements
- **Typography**: Inter font family for modern appearance

### Component Patterns

- **DaisyUI Components**: Use DaisyUI for consistent styling
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Animation**: Smooth transitions and micro-interactions

## GitHub Integration

### Authentication

- **PKCE Flow**: Recommended for production
- **Device Flow**: Ideal for local development
- **Session Storage**: Temporary token storage
- **Security**: Proper token handling and revocation

### Deployment

- **GitHub Pages**: Automated deployment
- **Contents API**: File uploads with SHA conflict resolution
- **Repository Management**: Create and manage repositories
- **Branch Protection**: Safe deployment practices

## AI Integration

### Multi-Provider Support

- **Google Gemini**: Primary provider (gemini-2.0-flash)
- **OpenAI**: GPT models support
- **Anthropic**: Claude models support
- **Cohere**: Command models support

### Proxy Configuration

- **AI SDK Router**: Vercel AI SDK for unified interface
- **Legacy Proxy**: Direct provider integration
- **Environment Variables**: Secure API key management
- **Fallback Logic**: Automatic provider failover

## Best Practices

### Code Quality

- **DRY Principle**: Don't Repeat Yourself
- **KISS Principle**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **Fail Fast**: Early error detection and handling

### Performance

- **Code Splitting**: Lazy loading and chunk optimization
- **Bundle Analysis**: Monitor bundle sizes
- **Caching**: Efficient state and data caching
- **Optimization**: React.memo, useMemo, useCallback where appropriate

### Security

- **Input Sanitization**: DOMPurify for HTML content
- **CSP Headers**: Content Security Policy implementation
- **Token Security**: Proper OAuth token handling
- **Environment Variables**: Never commit sensitive data

### Documentation

- **JSDoc Comments**: Comprehensive function/component documentation
- **README Files**: Clear setup and usage instructions
- **Architecture Docs**: System design and patterns documentation
- **API Documentation**: Service and interface documentation

## Common Patterns

### Custom Hook Template

```typescript
export const useCustomHook = (param: Type) => {
  const [state, setState] = useState<ReturnType>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await someAsyncOperation(param);
      setState(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [param]);

  return { execute, loading, error, data: state };
};
```

### Component Template

```tsx
interface ComponentNameProps {
  title: string;
  onAction?: (value: string) => void;
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onAction,
  className = '',
}) => {
  return (
    <div className={`component-name ${className}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      <button className="btn btn-primary" onClick={() => onAction?.('action')} disabled={!onAction}>
        Action
      </button>
    </div>
  );
};
```

### Service Interface Template

```typescript
export interface IServiceName {
  methodName(params: ParamsType): Promise<ApiResponse<ReturnType>>;
}

export class ServiceNameImpl implements IServiceName {
  async methodName(params: ParamsType): Promise<ApiResponse<ReturnType>> {
    try {
      const result = await this.externalCall(params);
      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}
```

## Troubleshooting

### Common Issues

- **Type Errors**: Run `npm run typecheck` to identify issues
- **Lint Errors**: Run `npm run lint:fix` for automatic fixes
- **Test Failures**: Check test coverage with `npm run test:coverage`
- **Build Issues**: Ensure all dependencies are installed and up-to-date

### Development Tips

- Use VS Code with TypeScript and React extensions
- Enable ESLint and Prettier extensions for real-time feedback
- Use the integrated terminal for running scripts
- Check the browser console for runtime errors
- Use React DevTools for component debugging

This comprehensive guide ensures consistent development practices and high-quality code contributions to the AI Site Generator project.</content>
<parameter name="filePath">/home/ultravietnamita/TryOuts/aisitegenerator/.github/copilot-instructions.md
