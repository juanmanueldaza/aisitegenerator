/**
 * Test setup for vitest
 */

import { vi } from 'vitest';

// Mock performance.now
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10 // 10MB
  }
};

// Mock Intersection Observer
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Add any global DOM setup if needed
beforeEach(() => {
  document.body.innerHTML = '';
});