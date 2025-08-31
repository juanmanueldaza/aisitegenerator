# AI Site Generator - Custom Instructions for GitHub Copilot

## Project Overview

This is a modern AI-powered site generator application built with React and TypeScript. The app allows users to create websites step-by-step with AI assistance, featuring live preview, Markdown support, and Mermaid diagrams. It includes GitHub authentication and deployment via GitHub Pages.

The project follows Clean Architecture principles with SOLID design patterns, emphasizing maintainable and testable code.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **Quality**: ESLint + Prettier + Husky (pre-commit hooks)
- **CI/CD**: GitHub Actions with automated quality gates
- **UI Framework**: DaisyUI v5 + Tailwind CSS v4 with custom Sci-Fi theme
- **AI Integration**: Vercel AI SDK with support for Google, OpenAI, Anthropic, Cohere
- **Backend Proxy**: Express.js server for AI API routing
- **State Management**: Zustand
- **Content Processing**: Marked (Markdown), Mermaid (diagrams), Prism.js (syntax highlighting)

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   ├── layout/         # Layout components
│   ├── features/       # Feature-specific components
│   ├── tabs/           # Tab components (ChatTab, EditorTab, etc.)
│   └── auth/           # GitHub authentication components
├── hooks/              # Custom React hooks
├── services/           # External integrations and business logic
│   ├── ai/            # AI service integrations
│   └── github/        # GitHub API integrations
├── types/              # TypeScript type definitions
├── utils/              # Pure utility functions
├── constants/          # Application constants and configurations
├── store/              # State management (Zustand stores)
├── pages/              # Page components
└── assets/             # Static assets

server/
├── proxy.js           # Legacy AI proxy server
└── ai-sdk-router.js   # Modern AI SDK router

tests/
├── e2e/               # End-to-end tests (Playwright)
└── unit/              # Unit test files

docs/                  # Documentation
scripts/               # Build and utility scripts
```

## Coding Standards

- **Language**: TypeScript with strict type checking
- **Imports**: Use absolute imports with `@/` prefix (configured in tsconfig.json and vite.config.ts)
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Components**: Functional components with hooks, prefer arrow functions
- **Styling**: Tailwind CSS classes, custom sci-fi theme with DaisyUI
- **Testing**: 70% unit tests, 20% integration, 10% E2E following testing pyramid
- **Architecture**: Clean Architecture with separation of concerns, SOLID principles

## Libraries and Frameworks

### Core Dependencies

- `react`: ^19.1.1 - UI framework
- `react-dom`: ^19.1.1 - React DOM rendering
- `@ai-sdk/*`: AI provider integrations (Google, OpenAI, Anthropic, Cohere)
- `ai`: ^5.0.19 - Vercel AI SDK
- `zustand`: ^5.0.7 - State management
- `daisyui`: ^5.0.54 - UI component library
- `tailwindcss`: ^3.4.17 - Utility-first CSS framework

### Development Dependencies

- `vite`: ^7.1.2 - Build tool and dev server
- `vitest`: ^2.0.5 - Test runner
- `@playwright/test`: ^1.47.2 - E2E testing
- `eslint`: ^9.33.0 - Code linting
- `prettier`: ^3.6.2 - Code formatting
- `typescript`: ~5.8.3 - Type checking

## Build and Development

### Development Server

```bash
npm run dev          # Start dev server with HMR
npm run proxy        # Start AI proxy server
npm run dev:all      # Start both dev server and proxy concurrently
```

### Building

```bash
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing

```bash
npm test                    # Run all tests
npm run test:coverage       # Run tests with coverage report
npm run test:watch          # Watch mode for development
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # End-to-end tests
```

### Quality Gates

```bash
npm run quality-gates       # Run typecheck + lint + test:coverage + build
npm run typecheck           # TypeScript type checking
npm run lint                # ESLint code quality
npm run lint:fix            # Auto-fix ESLint issues
```

## AI Integration

The application supports multiple AI providers through a proxy system:

- **Primary**: Vercel AI SDK router with provider detection
- **Fallback**: Legacy proxy for direct API calls
- **Configuration**: Environment variables for API keys and provider selection

### Environment Variables

- `VITE_AI_PROXY_BASE_URL`: Proxy endpoint (e.g., `/api/ai-sdk`)
- `VITE_AI_DEFAULT_PROVIDER`: Default AI provider (`google`, `openai`, `anthropic`, `cohere`)
- `VITE_AI_DEFAULT_MODEL`: Specific model name
- `GOOGLE_API_KEY`, `OPENAI_API_KEY`, etc.: API keys for providers

## UI Guidelines

### Design System

- **Theme**: Custom Sci-Fi theme with glassmorphism effects
- **Colors**: Electric cyan (#00d4ff), indigo (#6366f1), purple (#a855f7)
- **Effects**: Neon glow, backdrop blur, smooth animations
- **Layout**: Responsive design with mobile-first approach

### Component Patterns

- Use DaisyUI components as base
- Apply sci-fi theme classes for consistent styling
- Implement loading states and error handling
- Follow accessibility guidelines

## Deployment

- **Platform**: GitHub Pages
- **Authentication**: GitHub OAuth
- **Build Process**: Automated via GitHub Actions
- **Quality Gates**: Must pass all checks before deployment

## Key Files and Locations

- **Main Entry**: `src/main.tsx` - React app initialization
- **App Component**: `src/App.tsx` - Main application component
- **AI Services**: `src/services/ai/` - AI integration logic
- **GitHub Services**: `src/services/github/` - GitHub API integrations
- **UI Components**: `src/components/ui/` - Reusable UI components
- **Types**: `src/types/` - TypeScript definitions
- **Utils**: `src/utils/` - Utility functions
- **Tests**: `src/**/*.test.{ts,tsx}` - Unit tests
- **E2E Tests**: `tests/e2e/` - End-to-end tests
- **Server**: `server/` - Backend proxy servers
- **Config**: `vite.config.ts`, `tailwind.config.js`, `tsconfig.json` - Build and type configs

## Development Workflow

1. **Setup**: Clone repo, run `npm install`
2. **Development**: Use `npm run dev` for local development
3. **Testing**: Run tests with `npm test` and coverage with `npm run test:coverage`
4. **Quality**: Use `npm run quality-gates` to validate code quality
5. **Build**: Run `npm run build` for production build
6. **Deploy**: Push to main branch for automated deployment

## Best Practices

- Always run quality gates before committing
- Maintain 80% test coverage minimum
- Use TypeScript strictly with no `any` types
- Follow component composition patterns
- Implement proper error handling and loading states
- Use custom hooks for reusable logic
- Keep components small and focused on single responsibility
- Document complex business logic in comments
- Use environment variables for configuration
- Follow Git commit conventions
