# AI Site Generator - Documentation

## Overview

Welcome to the comprehensive documentation for the AI Site Generator application. This documentation provides detailed information about the project's architecture, APIs, components, and development practices.

## Project Description

The AI Site Generator is a modern web application that allows users to create websites step-by-step with AI assistance. It features live preview, Markdown support, Mermaid diagrams, and seamless GitHub deployment.

### Key Features

- **AI-Powered Content Generation**: Multiple AI providers (Google, OpenAI, Anthropic, Cohere)
- **Live Preview**: Real-time preview of generated content
- **GitHub Integration**: Authentication and deployment to GitHub Pages
- **Modern UI**: Sci-fi themed interface with DaisyUI and Tailwind CSS
- **Type-Safe**: Full TypeScript implementation with strict typing
- **Testable**: Comprehensive unit and E2E testing with Vitest and Playwright

## Documentation Structure

### 📚 API Documentation

- **[Main API Reference](./api/index.md)** - Complete API overview with examples
- **[Service Interfaces](./api/interfaces.md)** - Detailed interface documentation
- **[Hooks API](./api/hooks.md)** - Custom React hooks documentation

### 🏗️ Architecture

- **[Architecture Overview](./architecture/overview.md)** - System design and patterns
- **[Clean Architecture](./architecture/clean-architecture.md)** - SOLID principles implementation
- **[Component Architecture](./architecture/components.md)** - UI component structure

### 🛠️ Development

- **[Setup Guide](./development/setup.md)** - Getting started with development
- **[Coding Standards](./development/standards.md)** - Code style and conventions
- **[Testing Guide](./development/testing.md)** - Testing strategies and practices
- **[CI/CD Pipeline](./development/ci-cd.md)** - Build and deployment processes

### 📖 Guides

- **[User Guide](./guides/user-guide.md)** - How to use the application
- **[API Integration](./guides/api-integration.md)** - Integrating with external APIs
- **[Deployment Guide](./guides/deployment.md)** - Deployment and hosting options

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ai-site-generator.git
cd ai-site-generator

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start the AI proxy
npm run proxy
```

### Environment Setup

Create a `.env` file with your API keys:

```env
# AI Provider API Keys
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
COHERE_API_KEY=your_cohere_api_key

# GitHub OAuth (for deployment)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Architecture Overview

The application follows Clean Architecture principles with clear separation of concerns:

### Core Layers

1. **Domain Layer** - Business logic and entities
2. **Application Layer** - Use cases and application services
3. **Infrastructure Layer** - External dependencies and frameworks
4. **Presentation Layer** - UI components and user interactions

### Key Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand
- **UI Framework**: DaisyUI + Tailwind CSS
- **AI Integration**: Vercel AI SDK
- **Testing**: Vitest + React Testing Library + Playwright
- **Quality**: ESLint + Prettier + Husky

## API Reference

### Core Services

```typescript
// AI Service
import { SimpleAIProvider } from '@/services/ai/simple-provider';

const provider = new SimpleAIProvider('google', 'gemini-2.0-flash');
const result = await provider.generate([{ role: 'user', content: 'Create a simple HTML page' }]);
```

### React Hooks

```typescript
// Chat functionality
import { useChat } from '@/hooks/useChat';

const { handleMessage, isReady, ai } = useChat();

// GitHub integration
import { useGitHub } from '@/hooks/useGitHub';

const { login, repositories, deployToPages } = useGitHub();
```

## Development Workflow

### 1. Setup Development Environment

```bash
npm run dev          # Start development server
npm run proxy        # Start AI proxy server
npm run dev:all      # Start both concurrently
```

### 2. Run Tests

```bash
npm test                    # Run all tests
npm run test:coverage       # Run with coverage report
npm run test:watch          # Watch mode for development
npm run test:e2e            # End-to-end tests
```

### 3. Quality Gates

```bash
npm run quality-gates       # Run complete quality checks
npm run typecheck           # TypeScript compilation check
npm run lint                # ESLint code quality check
npm run build               # Production build check
```

### 4. Commit and Deploy

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

The CI/CD pipeline will automatically:

- Run quality gates
- Build the application
- Deploy to GitHub Pages (if configured)

## Contributing

### Code Style

- Use TypeScript with strict mode enabled
- Follow the established naming conventions
- Write comprehensive tests for new features
- Update documentation for API changes

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Contract Tests**: Test interface compliance

### Pull Request Process

1. Create a feature branch from `main`
2. Implement your changes with tests
3. Run quality gates locally
4. Create a pull request with description
5. Wait for CI checks to pass
6. Request review from maintainers

## Support

### Getting Help

- **Documentation**: Check this docs folder first
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Common Issues

#### AI Provider Issues

- Ensure API keys are properly configured
- Check provider availability status
- Verify rate limits haven't been exceeded

#### Build Issues

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript compilation errors
- Verify all dependencies are compatible

#### GitHub Integration Issues

- Verify OAuth app configuration
- Check repository permissions
- Ensure GitHub Pages is enabled

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history and updates.

---

_Documentation last updated: August 31, 2025_

_For the latest updates, please check the repository's main branch._
