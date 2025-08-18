// Vitest setup file
// Add any global test setup here (e.g., jest-dom matchers equivalents)
import '@testing-library/jest-dom/vitest';

// Global test utilities
import { vi, beforeAll, afterAll } from 'vitest';

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

// Mock console methods to reduce noise in tests
beforeAll(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Silence React 19 act warnings for simple counter demo if they appear
// (keep minimal; prefer fixing real issues in actual components)
