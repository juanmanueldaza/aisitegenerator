# Application Constants

This directory contains application-wide constants and configuration values.

## Guidelines
- Use UPPER_SNAKE_CASE for primitive constants
- Use PascalCase for object constants
- Group related constants in the same file
- Make constants immutable using `as const` or `Object.freeze()`
- Document the purpose of each constant group

## Example Structure
```
constants/
├── index.ts          # Main exports
├── api.ts           # API endpoints and configuration
├── routes.ts        # Application routes
├── messages.ts      # User-facing messages
└── config.ts        # Application configuration
```

## Example Constants
```typescript
// api.ts
export const API_ENDPOINTS = {
  AUTH: '/auth',
  SITES: '/sites',
  TEMPLATES: '/templates',
  DEPLOY: '/deploy',
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
} as const;

// routes.ts
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SITE_BUILDER: '/builder',
  PREVIEW: '/preview',
  SETTINGS: '/settings',
} as const;

// messages.ts
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

export const SUCCESS_MESSAGES = {
  SITE_CREATED: 'Your site has been created successfully!',
  SITE_DEPLOYED: 'Your site has been deployed to GitHub Pages!',
  CHANGES_SAVED: 'Your changes have been saved.',
} as const;

// config.ts
export const APP_CONFIG = {
  APP_NAME: 'AI Site Generator',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  GITHUB_CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/svg+xml'],
} as const;
```