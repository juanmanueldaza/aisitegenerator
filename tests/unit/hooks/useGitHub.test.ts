import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGitHub } from '../../../src/hooks/useGitHub';
import type { GitHubService } from '../../../src/services/github';

// Mock GitHub service
vi.mock('../../../src/services/github', () => ({
  getGitHubServiceSingleton: vi.fn(),
}));

// Mock GitHub config utils
vi.mock('../../../src/utils/github-config', () => ({
  getRuntimeClientId: vi.fn(() => 'test-client-id'),
  getRuntimeRedirectUri: vi.fn(() => 'http://localhost:3000'),
}));

// Mock debug utils
vi.mock('../../../src/utils/debug', () => ({
  dlog: vi.fn(),
  mask: vi.fn(),
}));

// Import mocked function
import { getGitHubServiceSingleton } from '../../../src/services/github';

describe('useGitHub Hook', () => {
  it('should initialize with default state', () => {
    // Mock the GitHub service singleton
    const mockGitHubService = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      scopes: [],
      login: vi.fn(),
      startDeviceAuth: vi.fn(),
      logout: vi.fn(),
      repositories: [],
      createRepository: vi.fn(),
      deployToPages: vi.fn(),
      refreshRepositories: vi.fn(),
      clearError: vi.fn(),
      testConnection: vi.fn(),
      initialize: vi.fn().mockResolvedValue({
        isAuthenticated: false,
        user: null,
        token: null,
        scopes: [],
      }),
      getRepositories: vi.fn().mockResolvedValue([]),
    };

    const mockedGetGitHubServiceSingleton = vi.mocked(getGitHubServiceSingleton);
    mockedGetGitHubServiceSingleton.mockReturnValue(mockGitHubService as unknown as GitHubService);

    const { result } = renderHook(() => useGitHub());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(true); // Initially loading
    expect(result.current.error).toBe(null);
    expect(result.current.scopes).toEqual([]);
  });

  it('should have authentication methods', () => {
    const mockGitHubService = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      scopes: [],
      login: vi.fn(),
      startDeviceAuth: vi.fn(),
      logout: vi.fn(),
      repositories: [],
      createRepository: vi.fn(),
      deployToPages: vi.fn(),
      refreshRepositories: vi.fn(),
      clearError: vi.fn(),
      testConnection: vi.fn(),
    };

    const mockedGetGitHubServiceSingleton = vi.mocked(getGitHubServiceSingleton);
    mockedGetGitHubServiceSingleton.mockReturnValue(mockGitHubService as unknown as GitHubService);

    const { result } = renderHook(() => useGitHub());

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.startDeviceAuth).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should have repository methods', () => {
    const mockGitHubService = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      scopes: [],
      login: vi.fn(),
      startDeviceAuth: vi.fn(),
      logout: vi.fn(),
      repositories: [],
      createRepository: vi.fn(),
      deployToPages: vi.fn(),
      refreshRepositories: vi.fn(),
      clearError: vi.fn(),
      testConnection: vi.fn(),
    };

    const mockedGetGitHubServiceSingleton = vi.mocked(getGitHubServiceSingleton);
    mockedGetGitHubServiceSingleton.mockReturnValue(mockGitHubService as unknown as GitHubService);

    const { result } = renderHook(() => useGitHub());

    expect(typeof result.current.createRepository).toBe('function');
    expect(typeof result.current.deployToPages).toBe('function');
    expect(typeof result.current.refreshRepositories).toBe('function');
  });
});
