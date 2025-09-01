# AI Site Generator - GitHub Copilot Custom Instructions

## Project Overview

The AI Site Generator is a modern React TypeScript web application that enables users to create websites step-by-step with AI assistance. It features live preview, Markdown support, Mermaid diagrams, GitHub authentication, and seamless deployment to GitHub Pages.

**Key Features:**

- AI-powered content generation with multiple providers (Google Gemini, OpenAI, Anthropic, Cohere)
- Real-time live preview with Markdown and Mermaid diagram support
- GitHub OAuth authentication (PKCE and Device Flow)
- Automated deployment to GitHub Pages
- Modern sci-fi themed UI with DaisyUI and Tailwind CSS
- Comprehensive testing with 80% coverage requirement
- Clean Architecture following SOLID principles

## Tech Stack

- **Frontend:** React 19.1.1 + TypeScript 5.8.3
- **Build Tool:** Vite 7.1.2
- **Testing:** Vitest 2.0.5 + React Testing Library 16.2.0 + Playwright 1.47.2
- **UI Framework:** DaisyUI 5.0.54 + Tailwind CSS 3.4.17
- **AI Integration:** AI SDK 5.0.19 with multiple providers
- **Code Quality:** ESLint 9.33.0 + Prettier 3.6.2 + Husky 9.1.7
- **Architecture:** Clean Architecture with SOLID principles

## Project Structure

```
src/
├── components/          # UI components (tabs, auth, chat, deployment)
├── hooks/              # Custom React hooks
├── services/           # Business logic services (AI, GitHub, site)
│   ├── ai/            # AI provider implementations
│   ├── github/        # GitHub API integration
│   └── site/          # Site management services
├── types/             # TypeScript type definitions
├── utils/             # Pure utility functions
├── di/                # Dependency injection container
├── store/             # Zustand state management
├── assets/            # Static assets and help documentation
└── constants/         # Application constants and configuration

tests/
├── e2e/              # End-to-end tests (Playwright)
├── integration/      # Integration tests
└── unit/            # Unit tests

docs/                 # Comprehensive documentation
scripts/             # Quality gates and utility scripts
server/              # Proxy server for AI providers
```

## Build and Development

### Prerequisites

- Node.js 18+
- npm

### Development Setup

```bash
npm install
npm run dev
```

### Build Commands

```bash
npm run build          # Production build
npm run preview        # Preview production build
npm run typecheck      # TypeScript type checking
```

### Testing Commands

```bash
npm run test              # Run all tests
npm run test:coverage     # Tests with coverage (80% minimum)
npm run test:watch        # Watch mode for development
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:e2e          # End-to-end tests (Playwright)
```

### Quality Gates

```bash
npm run quality-gates    # Complete quality check pipeline
# OR
./scripts/quality-gates.sh
```

Quality gates include:

1. TypeScript type checking (`npm run typecheck`)
2. ESLint code quality (`npm run lint`)
3. Test coverage (80% minimum) (`npm run test:coverage`)
4. Production build verification (`npm run build`)

## Coding Conventions

### TypeScript Configuration

- **Target:** ES2022
- **Module:** ESNext with bundler resolution
- **Strict mode:** Enabled with all strict checks
- **JSX:** React JSX transform
- **Path mapping:** Clean imports with `@/` prefix

### Import Organization

```typescript
// External dependencies first
import React from 'react';
import { useState } from 'react';

// Internal imports with path mapping
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

// Relative imports for same directory
import { helper } from './utils';
```

### Component Patterns

- Use functional components with hooks
- Prefer custom hooks for reusable logic
- Follow interface segregation principle
- Use TypeScript strict typing

### Naming Conventions

- **Components:** PascalCase (e.g., `ChatInterface.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services:** PascalCase with service suffix (e.g., `AuthService.ts`)
- **Types:** PascalCase (e.g., `User.ts`)
- **Files:** kebab-case for components, camelCase for utilities

## Architecture Patterns

### Clean Architecture Implementation

The project follows Clean Architecture with clear separation of concerns:

1. **Domain Layer** (Innermost)
   - Core business entities and domain services
   - Independent of frameworks and external dependencies

2. **Application Layer**
   - Use cases and application services
   - Orchestrates domain objects

3. **Infrastructure Layer** (Outermost)
   - External concerns (UI, databases, web frameworks)
   - Implements interfaces defined in inner layers

### SOLID Principles

- **Single Responsibility:** Each service/class has one reason to change
- **Open/Closed:** Open for extension, closed for modification
- **Liskov Substitution:** Subtypes are substitutable for their base types
- **Interface Segregation:** Clients depend only on methods they use
- **Dependency Inversion:** Depend on abstractions, not concretions

### Dependency Injection

- Uses custom DI container (`src/di/container.ts`)
- Services registered with tokens for loose coupling
- Constructor injection for testability

## Key Files and Directories

### Configuration Files

- `tsconfig.json` - TypeScript project references
- `tsconfig.app.json` - Application TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Testing configuration
- `playwright.config.ts` - E2E testing configuration
- `eslint.config.js` - ESLint configuration with React and TypeScript rules
- `tailwind.config.js` - Tailwind CSS with DaisyUI themes

### Core Services

- `src/services/ai/` - AI provider implementations and strategies
- `src/services/github/` - GitHub API integration
- `src/services/interfaces.ts` - Service interface definitions
- `src/di/container.ts` - Dependency injection container

### UI Components

- `src/components/tabs/` - Main application tabs
- `src/components/auth/` - GitHub authentication components
- `src/components/chat/` - AI chat interface
- `src/components/ui/` - Reusable UI components

### State Management

- `src/store/siteStore.ts` - Zustand store for site state
- `src/hooks/` - Custom React hooks

## Testing Strategy

### Testing Pyramid

- **Unit Tests (70%)**: Individual functions and components
- **Integration Tests (20%)**: Service interactions and component integration
- **E2E Tests (10%)**: Full user workflows

### Coverage Requirements

- **Statements:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%

### Test File Organization

```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── services/
├── integration/
│   ├── fixtures/
│   └── workflows/
└── e2e/
    └── specs/
```

## Deployment and CI/CD

### GitHub Pages Deployment

1. Authenticate with GitHub OAuth
2. Create/select repository
3. Generate site content with AI
4. Deploy to GitHub Pages via Contents API

### Environment Variables

```bash
# AI Provider Configuration
VITE_AI_PROXY_BASE_URL=/api/ai-sdk
VITE_AI_DEFAULT_PROVIDER=google
VITE_AI_DEFAULT_MODEL=gemini-2.0-flash

# GitHub OAuth (for production)
VITE_GITHUB_CLIENT_ID=your_client_id
```

### Quality Gates in CI

The project uses automated quality gates that must pass before deployment:

1. TypeScript compilation
2. ESLint code quality
3. Test execution with coverage
4. Production build

## Common Patterns

### Error Handling

- Use custom error classes for different error types
- Centralized error handling in services
- User-friendly error messages in UI

### Async Operations

- Use custom `useAsyncOperation` hook for loading states
- Proper error boundaries for React components
- Cancellation support for long-running operations

### AI Integration

- Multiple provider support (Google, OpenAI, Anthropic, Cohere)
- Streaming responses for real-time chat
- Fallback mechanisms for provider failures
- Proxy server for API key management

### Security Considerations

- OAuth tokens stored in sessionStorage only
- Content Security Policy compliance
- Input sanitization for user-generated content
- Secure iframe handling for live preview

## Development Workflow

1. **Setup**: Clone repository and run `npm install`
2. **Development**: Use `npm run dev` for HMR development
3. **Testing**: Run `npm run test:watch` during development
4. **Quality**: Execute `npm run quality-gates` before commits
5. **Build**: Verify production build with `npm run build`

## Key Dependencies

### Runtime Dependencies

- `react@^19.1.1` - UI framework
- `ai@^5.0.19` - AI SDK for multiple providers
- `@ai-sdk/google@^2.0.7` - Google Gemini integration
- `zustand@^5.0.7` - State management
- `daisyui@^5.0.54` - UI component library
- `tailwindcss@^3.4.17` - CSS framework

### Development Dependencies

- `@vitejs/plugin-react@^5.0.0` - Vite React plugin
- `@testing-library/react@^16.2.0` - React testing utilities
- `@playwright/test@^1.47.2` - E2E testing framework
- `typescript-eslint@^8.39.1` - TypeScript ESLint rules
- `husky@^9.1.7` - Git hooks management

This project emphasizes code quality, maintainability, and user experience through modern web technologies and clean architecture principles.</content>
<parameter name="filePath">/home/ultravietnamita/TryOuts/aisitegenerator/.github/copilot-instructions.md
