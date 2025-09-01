// Vitest setup file
// Add any global test setup here (e.g., jest-dom matchers equivalents)
import '@testing-library/jest-dom/vitest';
import React from 'react';

// Global test utilities
import { vi } from 'vitest';

// Mock environment variables for tests
process.env.VITE_GITHUB_CLIENT_ID = 'test-client-id';
process.env.VITE_GEMINI_API_KEY = 'test-api-key';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock deep-chat-react to prevent document access errors
vi.mock('deep-chat-react', () => ({
  DeepChat: ({ 'data-testid': testId, ...props }: Record<string, unknown>) =>
    React.createElement(
      'div',
      { 'data-testid': testId || 'deep-chat', ...props },
      'Mock Deep Chat Component'
    ),
}));

// Mock React.lazy and Suspense
vi.mock('react', async () => {
  const actualReact = await vi.importActual('react');
  return {
    ...actualReact,
    lazy: vi.fn(() =>
      vi.fn(() =>
        React.createElement('div', { 'data-testid': 'deep-chat' }, 'Mock Deep Chat Component')
      )
    ),
    Suspense: ({
      children,
      fallback,
    }: {
      children?: React.ReactNode;
      fallback?: React.ReactNode;
    }) => children || fallback,
  };
});

// Silence React 19 act warnings for simple counter demo if they appear
// (keep minimal; prefer fixing real issues in actual components)
