/**
 * React hook for GitHub integration
 * Provides authentication and API functionality with React state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import GitHubService, { getGitHubServiceSingleton } from '../services/github';
import { getRuntimeClientId, getRuntimeRedirectUri } from '../utils/github-config';
import { dlog, mask } from '../utils/debug';
import type {
  AuthStatus,
  GitHubUser,
  GitHubRepository,
  CreateRepositoryParams,
} from '../types/github';

// GitHub OAuth configuration
const ENV_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

interface UseGitHubReturn {
  // Authentication state
  isAuthenticated: boolean;
  user: GitHubUser | null;
  isLoading: boolean;
  error: string | null;
  scopes: readonly string[];

  // Authentication methods
  login: () => Promise<void>;
  startDeviceAuth: () => Promise<{
    user_code: string;
    verification_uri: string;
    expires_in: number;
    poll: () => Promise<void>;
  }>;
  logout: () => void;

  // Repository methods
  repositories: GitHubRepository[];
  createRepository: (params: CreateRepositoryParams) => Promise<GitHubRepository>;
  deployToPages: (
    repoName: string,
    files: Array<{ path: string; content: string; message?: string }>
  ) => Promise<string>;
  refreshRepositories: () => Promise<void>;

  // Utility methods
  clearError: () => void;
  testConnection: () => Promise<boolean>;
}

export const useGitHub = (): UseGitHubReturn => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    user: null,
    token: null,
    scopes: [],
  });
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to maintain service instance and current clientId across renders
  const serviceRef = useRef<GitHubService | null>(null);
  const clientIdRef = useRef<string>('');
  // Track last logged values across hook instances (module scope via static properties on function)
  // @ts-expect-error - augmenting function object for simple cross-instance state
  useGitHub.__LAST_LOGGED_CLIENT_ID = useGitHub.__LAST_LOGGED_CLIENT_ID || '';
  // @ts-expect-error - augmenting function object for simple cross-instance state
  useGitHub.__LAST_AUTH_SNAPSHOT = useGitHub.__LAST_AUTH_SNAPSHOT || '';

  // Initialize service
  const getService = useCallback(() => {
    const runtimeId = getRuntimeClientId() || ENV_CLIENT_ID || '';
    // Log clientId resolution only when it changes
    // @ts-expect-error - read/write on augmented function object
    if (useGitHub.__LAST_LOGGED_CLIENT_ID !== runtimeId) {
      dlog('resolve clientId', { runtime: mask(runtimeId) });
      // @ts-expect-error - read/write on augmented function object
      useGitHub.__LAST_LOGGED_CLIENT_ID = runtimeId;
    }

    // (Re)create service when first used or when clientId changed
    if (!serviceRef.current || clientIdRef.current !== runtimeId) {
      const redirectOverride = getRuntimeRedirectUri();
      serviceRef.current = getGitHubServiceSingleton({
        clientId: runtimeId,
        redirectUri: redirectOverride || `${window.location.origin}/oauth/callback`,
        scopes: ['user:email', 'public_repo'],
      });
      clientIdRef.current = runtimeId;
    }
    return serviceRef.current;
  }, []);

  // Initialize GitHub service and handle OAuth callback
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const service = getService();
        const status = await service.initialize();
        // Log status only when it changes (dedupe across components)
        const uid = status.user
          ? String(
              (status.user as { id?: number; login?: string }).id ??
                (status.user as { login?: string }).login ??
                'user'
            )
          : 'null';
        const snapshot = `${status.isAuthenticated}:${uid}`;
        // @ts-expect-error - read/write on augmented function object
        if (useGitHub.__LAST_AUTH_SNAPSHOT !== snapshot) {
          dlog('initialize status', {
            isAuthenticated: status.isAuthenticated,
            user: status.user,
          });
          // @ts-expect-error - read/write on augmented function object
          useGitHub.__LAST_AUTH_SNAPSHOT = snapshot;
        }

        setAuthStatus(status);

        // If authenticated, load repositories
        if (status.isAuthenticated) {
          await loadRepositories(service);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize GitHub service';
        setError(errorMessage);
        console.error('GitHub initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
  }, [getService]);

  // Load user repositories
  const loadRepositories = async (service: GitHubService) => {
    try {
      const repos = await service.getRepositories();
      setRepositories(repos);
    } catch (err) {
      console.error('Failed to load repositories:', err);
      // Don't set error for repository loading failure
    }
  };

  // Login method
  const login = useCallback(async () => {
    try {
      setError(null);
      const service = getService();
      dlog('login start');
      await service.login();
      dlog('login redirect initiated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dlog('login error', errorMessage, err);
      setError(errorMessage);
      throw err;
    }
  }, [getService]);

  // Device Flow
  const startDeviceAuth = useCallback(async () => {
    const service = getService();
    return service.startDeviceAuth();
  }, [getService]);

  // Logout method
  const logout = useCallback(() => {
    try {
      const service = getService();
      service.logout();
      setAuthStatus({
        isAuthenticated: false,
        user: null,
        token: null,
        scopes: [],
      });
      setRepositories([]);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [getService]);

  // Create repository
  const createRepository = useCallback(
    async (params: CreateRepositoryParams): Promise<GitHubRepository> => {
      try {
        setError(null);
        const service = getService();

        if (!service.isAuthenticated()) {
          throw new Error('User must be authenticated to create repositories');
        }

        const repo = await service.createRepository(params);

        // Refresh repositories list
        await loadRepositories(service);

        return repo;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create repository';
        setError(errorMessage);
        throw err;
      }
    },
    [getService]
  );

  // Deploy to GitHub Pages
  const deployToPages = useCallback(
    async (
      repoName: string,
      files: Array<{ path: string; content: string; message?: string }>
    ): Promise<string> => {
      try {
        setError(null);
        const service = getService();

        if (!service.isAuthenticated()) {
          throw new Error('User must be authenticated to deploy');
        }

        const url = await service.deployToPages(repoName, files);
        return url;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to deploy to GitHub Pages';
        setError(errorMessage);
        throw err;
      }
    },
    [getService]
  );

  // Refresh repositories
  const refreshRepositories = useCallback(async () => {
    try {
      setError(null);
      const service = getService();

      if (service.isAuthenticated()) {
        await loadRepositories(service);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh repositories';
      setError(errorMessage);
    }
  }, [getService]);

  // Test connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const service = getService();
      return await service.testConnection();
    } catch (err) {
      console.error('Connection test failed:', err);
      return false;
    }
  }, [getService]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Authentication state
    isAuthenticated: authStatus.isAuthenticated,
    user: authStatus.user,
    isLoading,
    error,
    scopes: authStatus.scopes,

    // Authentication methods
    login,
    startDeviceAuth,
    logout,

    // Repository methods
    repositories,
    createRepository,
    deployToPages,
    refreshRepositories,

    // Utility methods
    clearError,
    testConnection,
  };
};

export default useGitHub;
