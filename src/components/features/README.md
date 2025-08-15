# Feature Components

This directory contains feature-specific components related to business logic.

## Guidelines
- Components are feature-focused and domain-specific
- May contain multiple smaller UI components
- Handle specific business requirements
- Can use custom hooks and services
- Should maintain clear boundaries between features

## Example Structure
```
features/
├── SiteBuilder/
│   ├── index.ts
│   ├── SiteBuilder.tsx
│   ├── SiteBuilder.types.ts
│   └── components/
│       ├── StepWizard/
│       └── PreviewPanel/
└── Authentication/
    ├── index.ts
    ├── Authentication.tsx
    └── components/
        ├── LoginForm/
        └── GitHubAuth/
```