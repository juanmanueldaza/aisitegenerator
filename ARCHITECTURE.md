# AI Site Generator - Architecture Documentation

This document outlines the folder structure, naming conventions, and architectural principles implemented in the AI Site Generator project.

## Folder Structure

The project follows a clean, organized structure that promotes separation of concerns and maintainability:

```
src/
├── components/           # React components organized by purpose
│   ├── ui/              # Reusable UI components (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Footer, Layout)
│   └── features/        # Feature-specific components (SiteBuilder, Auth)
├── hooks/               # Custom React hooks
├── services/            # API and external service integrations
├── utils/               # Pure utility functions
├── types/               # TypeScript type definitions
├── constants/           # Application constants and configuration
└── assets/              # Static assets (images, icons, styles)
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase for component names and directories (`Button`, `SiteBuilder`)
- **Files**: Match the component/export name (`Button.tsx`, `Button.types.ts`)
- **Utilities**: camelCase for utility files (`stringUtils.ts`, `validation.ts`)
- **Constants**: camelCase for files (`config.ts`, `routes.ts`)
- **Assets**: kebab-case for asset files (`logo-small.svg`, `hero-background.jpg`)

### Code Conventions
- **Components**: PascalCase (`<Button>`, `<SiteBuilder>`)
- **Functions**: camelCase (`capitalize`, `isValidEmail`)
- **Variables**: camelCase (`userName`, `apiResponse`)
- **Constants**: UPPER_SNAKE_CASE for primitives, PascalCase for objects (`API_URL`, `ApiConfig`)
- **Types/Interfaces**: PascalCase (`ButtonProps`, `ApiResponse`)

## Import/Export Patterns

### Absolute Imports
The project uses absolute imports with path mapping for clean, maintainable code:

```typescript
// Instead of relative imports
import { Button } from '../../../components/ui/Button';

// Use absolute imports
import { Button } from '@/components/ui';
import { useLocalStorage } from '@/hooks';
import { API_CONFIG } from '@/constants';
```

### Index File Pattern
Each directory includes an `index.ts` file that exports all public components/functions:

```typescript
// components/ui/index.ts
export * from './Button';
export * from './Input';

// Usage
import { Button, Input } from '@/components/ui';
```

### Component Structure
Each component follows a consistent structure:

```
Button/
├── index.ts          # Clean exports
├── Button.tsx        # Main component implementation
├── Button.types.ts   # TypeScript interfaces
└── Button.test.tsx   # Component tests (when added)
```

## Architectural Principles

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each component has a single, well-defined purpose
   - Utility functions perform one specific task
   - Hooks encapsulate one piece of stateful logic

2. **Open/Closed Principle (OCP)**
   - Components are extensible through props without modification
   - Interfaces allow for different implementations
   - Plugin-style architecture for features

3. **Liskov Substitution Principle (LSP)**
   - Components can be replaced with their variants without breaking functionality
   - Type system ensures substitutability

4. **Interface Segregation Principle (ISP)**
   - Components receive only the props they need
   - Types are specific and focused

5. **Dependency Inversion Principle (DIP)**
   - Components depend on abstractions (interfaces) not concretions
   - Service layer abstracts external dependencies

### CLEAN Architecture Concepts

1. **Separation of Concerns**
   - UI components are separated from business logic
   - Services handle external integrations
   - Utils contain pure, reusable functions

2. **Dependency Direction**
   - Dependencies point inward toward business logic
   - UI depends on hooks and services, not the other way around

3. **Testability**
   - Pure functions are easily testable
   - Components receive dependencies through props
   - Services can be mocked for testing

### DRY Principle

1. **Reusable Components**
   - UI components are generic and reusable
   - Common patterns are abstracted into hooks
   - Utilities handle repeated logic

2. **Centralized Configuration**
   - Constants are defined once and imported
   - Types are shared across the application
   - Configuration is environment-aware

## Development Guidelines

### Adding New Components

1. Create component directory in appropriate location (`ui`, `layout`, or `features`)
2. Follow the established file structure pattern
3. Define TypeScript interfaces in `.types.ts` file
4. Implement component following SOLID principles
5. Export through `index.ts` file
6. Update parent directory's `index.ts` if needed

### Adding New Utilities

1. Create utility file in `utils/` directory
2. Implement pure functions with clear responsibilities
3. Add comprehensive TypeScript types
4. Include JSDoc documentation
5. Export through `utils/index.ts`

### Adding New Constants

1. Group related constants in appropriate file
2. Use immutable patterns (`as const`, `Object.freeze()`)
3. Document purpose and usage
4. Export through `constants/index.ts`

## Path Mapping Configuration

The `tsconfig.json` includes path mapping for clean imports:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/services/*": ["services/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/constants/*": ["constants/*"],
      "@/assets/*": ["assets/*"]
    }
  }
}
```

This enables clean, absolute imports throughout the application while maintaining clear separation between different layers of the architecture.