# Custom React Hooks

This directory contains custom React hooks that encapsulate reusable stateful logic.

## Guidelines
- Follow the "use" naming convention (e.g., useAuth, useLocalStorage)
- Should be pure functions that may use other hooks
- Promote code reuse and separation of concerns
- Handle specific pieces of state management or side effects
- Should be well-typed with TypeScript

## Example Structure
```
hooks/
├── useAuth.ts
├── useLocalStorage.ts
├── useDebounce.ts
└── useApi/
    ├── index.ts
    ├── useApi.ts
    └── useApi.types.ts
```

## Example Hook
```typescript
// useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
```