# AI Site Generator

Aplicación moderna (frontend) para crear sitios paso a paso asistidos por IA, con vista previa en vivo, soporte de Markdown y diagramas Mermaid. Autenticación con GitHub y despliegue vía GitHub Pages.

<<<<<<< HEAD
<<<<<<< HEAD
## 🚀 Tech Stack

- Frontend: React 19 + TypeScript
- Build: Vite 7
- Quality: ESLint + Prettier + Husky + Vitest
- Architecture: Clean Architecture (SOLID)

## 📁 Project Structure

The project follows SOLID and CLEAN architecture principles:

```
src/
├── components/     # UI components
├── hooks/          # Custom React hooks
├── services/       # External integrations and business logic
├── types/          # Type definitions
├── utils/          # Pure utility functions
├── assets/         # Static assets
└── styles/         # Global styles
```

### Architecture Principles

- SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- CLEAN: Separation of concerns with clear boundaries between layers
- DRY: Reuse utilities and hooks; avoid duplication
- KISS: Keep it simple and maintainable

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/juanmanueldaza/aisitegenerator.git
   cd aisitegenerator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**: go to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix auto-fixable ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run typecheck` - TypeScript type checking
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode

## 🔧 Code Quality & Development Tools

### ESLint Configuration

- TypeScript-aware linting
- React hooks rules
- React refresh plugin for development

### Prettier Configuration

- Consistent code formatting
- 100 character line length
- Single quotes, semicolons

### Husky Pre-commit Hooks

- Automatic code linting and formatting before commits
- Ensures code quality consistency across the team

### TypeScript Configuration

- Strict mode enabled for maximum type safety
- Path aliases for clean imports:
   - `@types` → `src/types`
   - `@components` → `src/components`
   - `@hooks` → `src/hooks`
   - `@services` → `src/services`
   - `@utils` → `src/utils`
   - `@assets` → `src/assets`
   - `@styles` → `src/styles`

## 🏗️ Architecture Overview

### Service Layer (Dependency Inversion)

The `services/` directory contains abstract interfaces that define contracts for external integrations:

- `IAuthService` - GitHub authentication
- `IGitHubService` - Repository management and Pages deployment
- `ISiteService` - Site configuration management
- `IAIService` - AI chat and content generation

### Component Layer (Single Responsibility)

React components focus on a single responsibility:

- Presentation logic only
- Props-driven behavior
- Reusable and testable

### Hooks Layer (DRY Principle)

Custom hooks encapsulate reusable stateful logic:

- `useAuth` - Authentication state management
- `useSites` - Site configuration management
- `useDebouncedValue` - Debounced input handling
- `useLocalStorage` - Local storage state synchronization

### Utilities (Open/Closed Principle)

Pure functions that are open for extension but closed for modification:

- Date formatting
- Validation helpers
- Object manipulation utilities

## 🚦 Development Guidelines

### Code Style

- Use TypeScript strictly with proper type definitions
- Follow the established folder structure
- Implement proper error handling
- Write self-documenting code with clear naming

### Import Organization

```typescript
// External libraries
import React from 'react';

// Internal imports using path aliases
import { SomeComponent } from '@components/SomeComponent';
import { useAuth } from '@hooks';
import { formatDate } from '@utils';
import type { User } from '@types';
```

### Component Structure

```typescript
// Component props interface
interface ComponentProps {
  // prop definitions
}

// Component implementation
export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // hooks
  // event handlers
  // render logic
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the development guidelines
4. Run quality checks: `npm run lint && npm run format:check && npm run build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## 🎯 Roadmap

<<<<<<< HEAD
- [ ] GitHub OAuth integration
- [ ] AI chat interface implementation
- [ ] Site template system
- [ ] Real-time preview functionality
- [ ] GitHub Pages deployment automation
- [ ] Site management dashboard

---

Built with ❤️ using modern web technologies and clean architecture principles.
=======
- [Live Demo](https://juanmanueldaza.github.io/aisitegenerator) *(Coming Soon)*
- [Issue Tracker](https://github.com/juanmanueldaza/aisitegenerator/issues)
- [Discussions](https://github.com/juanmanueldaza/aisitegenerator/discussions)
>>>>>>> 0a91720 (fix: correct markdown formatting and code block structure)
=======
## ✨ Features
=======
## 🚀 Tech Stack
>>>>>>> 67cfc22 (Epic 1: Complete Initial Setup and Base Architecture with Modern Stack (#16))

- Frontend: React 19 + TypeScript
- Build: Vite 7
- Calidad: ESLint + Prettier + Husky + Vitest
- Arquitectura: Clean Architecture (SOLID)

## 📁 Estructura del proyecto

```
src/
├── components/     # Componentes de UI
├── hooks/          # Hooks personalizados
├── services/       # Integraciones externas y lógica de negocio
├── types/          # Tipos compartidos
├── utils/          # Utilidades puras
├── assets/         # Recursos estáticos
└── styles/         # Estilos globales
```

### Principios de arquitectura

- SOLID y CLEAN: separación de responsabilidades y límites claros
- DRY y KISS: reutiliza utilidades y manténlo simple

## 🛠️ Entorno de desarrollo

### Prerrequisitos

- Node.js 18+
- npm
- Git

### Instalación

1. Clona el repo
2. Instala dependencias con `npm install`
3. Inicia con `npm run dev`
4. Abre `http://localhost:5173`

## 📜 Scripts disponibles

- `npm run dev` — Dev server (HMR)
- `npm run build` — Build producción
- `npm run preview` — Previsualización del build
- `npm run lint` / `lint:fix` — Lint
- `npm run format` / `format:check` — Formato
- `npm run typecheck` — Tipado TS
- `npm run test` / `test:watch` — Tests con Vitest

## 🏗️ Arquitectura

### Capa de servicios
- Interfaces para Auth (GitHub), GitHub (repos/Pages), Sites, IA

### Capa de componentes
- Presentación pura, orientada a props y testeable

### Hooks
- Lógica reutilizable (e.g., `useLocalStorage`)

### Utilidades
- Sanitización de HTML y render de Markdown/Mermaid asíncrono y seguro

## ✨ Funcionalidades

- Vista previa de Markdown en vivo con sanitización
- Mermaid asíncrono a SVG sanitizado
- Manejo de errores y degradación
- Diseño responsivo
- Listo para GitHub Pages

## 🎯 Roadmap

- [ ] GitHub OAuth integration
- [ ] AI chat interface implementation
- [ ] Site template system
- [ ] GitHub Pages deployment automation
- [ ] Site management dashboard

## 🤝 Contribuir

1. Crea rama feature
2. Implementa siguiendo guías
3. `npm run lint && npm run typecheck && npm run test && npm run build`
4. PR con Conventional Commits

## 📄 Licencia

MIT

---

Hecho con ❤️ usando Vite, React y TypeScript.
## 🚀 Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Code Quality**: ESLint + Prettier + Husky
- **Architecture**: Clean Architecture following SOLID principles

## 📁 Project Structure

The project follows SOLID and CLEAN architecture principles:

```
src/
├── components/     # UI Components (Single Responsibility Principle)
├── hooks/         # Custom React Hooks (DRY Principle)
├── services/      # Business Logic & External Integrations (Dependency Inversion)
├── types/         # TypeScript Type Definitions (Interface Segregation)
├── utils/         # Utility Functions (Open/Closed Principle)
├── pages/         # Page Components
├── assets/        # Static Assets (images, icons)
└── styles/        # Global Styles & CSS
```

### Architecture Principles

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **CLEAN**: Separation of concerns with clear boundaries between layers
- **DRY**: Don't Repeat Yourself - reusable utilities and hooks
- **KISS**: Keep It Simple, Stupid - straightforward, maintainable code

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/juanmanueldaza/aisitegenerator.git
   cd aisitegenerator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix auto-fixable ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted

## 🔧 Code Quality & Development Tools

### ESLint Configuration

- TypeScript-aware linting
- React hooks rules
- React refresh plugin for development

### Prettier Configuration

- Consistent code formatting
- 100 character line length
- Single quotes, semicolons

### Husky Pre-commit Hooks

- Automatic code linting and formatting before commits
- Ensures code quality consistency across the team

### TypeScript Configuration

- Strict mode enabled for maximum type safety
- Path aliases for clean imports:
  - `@types` → `src/types`
  - `@components` → `src/components`
  - `@hooks` → `src/hooks`
  - `@services` → `src/services`
  - `@utils` → `src/utils`
  - `@pages` → `src/pages`
  - `@assets` → `src/assets`
  - `@styles` → `src/styles`

## 🏗️ Architecture Overview

### Service Layer (Dependency Inversion)

The `services/` directory contains abstract interfaces that define contracts for external integrations:

- `IAuthService` - GitHub authentication
- `IGitHubService` - Repository management and Pages deployment
- `ISiteService` - Site configuration management
- `IAIService` - AI chat and content generation

### Component Layer (Single Responsibility)

React components focus on a single responsibility:

- Presentation logic only
- Props-driven behavior
- Reusable and testable

### Hooks Layer (DRY Principle)

Custom hooks encapsulate reusable stateful logic:

- `useAuth` - Authentication state management
- `useSites` - Site configuration management
- `useDebouncedValue` - Debounced input handling
- `useLocalStorage` - Local storage state synchronization

### Utilities (Open/Closed Principle)

Pure functions that are open for extension but closed for modification:

- Date formatting
- Validation helpers
- Object manipulation utilities

## 🚦 Development Guidelines

### Code Style

- Use TypeScript strictly with proper type definitions
- Follow the established folder structure
- Implement proper error handling
- Write self-documenting code with clear naming

### Import Organization

```typescript
// External libraries
import React from 'react';

// Internal imports using path aliases
import { SomeComponent } from '@components/SomeComponent';
import { useAuth } from '@hooks';
import { formatDate } from '@utils';
import type { User } from '@types';
```

### Component Structure

```typescript
// Component props interface
interface ComponentProps {
  // prop definitions
}

// Component implementation
export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // hooks
  // event handlers
  // render logic
};
```

## 🤝 Contributing

<<<<<<< HEAD
Contributions are welcome! Please feel free to submit a Pull Request.
>>>>>>> 9e018a2 (Implement complete Mermaid diagram integration with markdown rendering)
=======
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the development guidelines
4. Run quality checks: `npm run lint && npm run format:check && npm run build`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] GitHub OAuth integration
- [ ] AI chat interface implementation
- [ ] Site template system
- [ ] Real-time preview functionality
- [ ] GitHub Pages deployment automation
- [ ] Site management dashboard

---

Built with ❤️ using modern web technologies and clean architecture principles.
>>>>>>> 513986a (Epic 1: Complete Initial Setup and Base Architecture with Modern Stack (#16))
>>>>>>> 67cfc22 (Epic 1: Complete Initial Setup and Base Architecture with Modern Stack (#16))
