# UI Components

This directory contains reusable UI components that can be used across the application.

## Guidelines
- Components should be pure and stateless when possible
- Highly reusable across different features
- Well-documented with TypeScript interfaces
- Follow single responsibility principle
- Use consistent naming conventions (PascalCase)

## Example Structure
```
ui/
├── Button/
│   ├── index.ts
│   ├── Button.tsx
│   ├── Button.types.ts
│   └── Button.test.tsx
└── Input/
    ├── index.ts
    ├── Input.tsx
    ├── Input.types.ts
    └── Input.test.tsx
```