# Utility Functions

This directory contains pure utility functions that provide common functionality.

## Guidelines
- Functions should be framework-agnostic
- Have no side effects (pure functions)
- Are easily testable
- Provide common functionality across the application
- Should be well-typed and documented

## Example Structure
```
utils/
├── format/
│   ├── index.ts
│   ├── date.ts
│   └── string.ts
├── validation/
│   ├── index.ts
│   └── validators.ts
└── helpers/
    ├── index.ts
    ├── dom.ts
    └── array.ts
```

## Example Utilities
```typescript
// format/string.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// validation/validators.ts
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```