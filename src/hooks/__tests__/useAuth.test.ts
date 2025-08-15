import { renderHook, act, waitFor } from '@testing-library/react';
import useAuth from '../useAuth';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
});

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should initialize with unauthenticated state', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.token).toBe(null);
    expect(result.current.githubService).toBe(null);
  });

  it('should authenticate with existing token', async () => {
    mockLocalStorage.getItem.mockReturnValue('existing-token');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: 1,
      login: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      avatar_url: 'https://github.com/images/error/testuser_happy.gif',
    });
    expect(result.current.token).toBe('existing-token');
    expect(result.current.githubService).toBeDefined();
  });

  it('should handle login with authorization code', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login('test-code');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'github_token',
      'mock-github-token'
    );
  });

  it('should handle logout', async () => {
    mockLocalStorage.getItem.mockReturnValue('existing-token');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.token).toBe(null);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('github_token');
  });

  it('should generate correct auth URL', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const authUrl = result.current.getAuthUrl('test-client-id');

    expect(authUrl).toBe(
      'https://github.com/login/oauth/authorize?client_id=test-client-id&redirect_uri=http%3A//localhost%3A3000/callback&scope=repo,user'
    );
  });

  it('should handle authentication errors', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-token');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Authentication failed');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('github_token');
  });
});