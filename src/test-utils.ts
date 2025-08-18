// Test utilities and helpers
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi, expect } from 'vitest';

// Mock implementations for commonly used services
export const mockGitHubService = {
  createRepository: vi.fn(),
  uploadFiles: vi.fn(),
  enablePages: vi.fn(),
  deleteRepository: vi.fn(),
  getUser: vi.fn(),
  getUserRepos: vi.fn(),
};

export const mockAIService = {
  generateSiteContent: vi.fn(),
  generateCode: vi.fn(),
  enhanceContent: vi.fn(),
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any provider-specific options here when providers exist
  initialState?: unknown;
}

export function renderWithProviders(ui: ReactElement, options: CustomRenderOptions = {}) {
  // TODO: Add providers when they exist (AuthProvider, etc.)
  return render(ui, options);
}

// Mock fetch responses
export const createMockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
});

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: '123',
  login: 'testuser',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  email: 'test@example.com',
  ...overrides,
});

export const createMockRepository = (overrides = {}) => ({
  id: '456',
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  html_url: 'https://github.com/testuser/test-repo',
  description: 'A test repository',
  private: false,
  owner: createMockUser(),
  ...overrides,
});

export const createMockSiteContent = (overrides = {}) => ({
  html: '<!DOCTYPE html><html><head><title>Test Site</title></head><body><h1>Test</h1></body></html>',
  css: 'body { font-family: Arial, sans-serif; }',
  ...overrides,
});

// Wait for async operations
export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

// Setup and cleanup helpers
export const setupMocks = () => {
  // Reset all mocks before each test
  Object.values(mockGitHubService).forEach((mock) => mock.mockReset());
  Object.values(mockAIService).forEach((mock) => mock.mockReset());
  vi.mocked(global.fetch).mockReset();
};

export const cleanupMocks = () => {
  vi.restoreAllMocks();
};

// Common test assertions
export const expectElementToBeInDocument = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toHaveTextContent(text);
};

// Mock error for testing error boundaries
export const mockError = new Error('Test error');
