# TypeScript Type Definitions

This directory contains TypeScript type definitions for the application.

## Guidelines
- Use clear, descriptive names for types and interfaces
- Group related types in the same file
- Export types that are used across multiple modules
- Use union types and generics appropriately
- Document complex types with JSDoc comments

## Example Structure
```
types/
├── index.ts          # Main exports
├── api.ts           # API-related types
├── auth.ts          # Authentication types
├── common.ts        # Common/shared types
└── site.ts          # Site generation types
```

## Example Types
```typescript
// common.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// site.ts
export interface SiteConfiguration {
  id: string;
  name: string;
  description?: string;
  template: SiteTemplate;
  pages: Page[];
  theme: Theme;
}

export interface SiteTemplate {
  id: string;
  name: string;
  category: 'business' | 'portfolio' | 'blog' | 'ecommerce';
  preview: string;
}

// auth.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  githubToken?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```