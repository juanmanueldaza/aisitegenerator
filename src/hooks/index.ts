// Custom React hooks following DRY principle and Single Responsibility

import { useState, useEffect, useCallback } from 'react';
import type { User, SiteConfiguration } from '@types';

/**
 * Hook for managing authentication state
 * Single Responsibility: Handle only authentication logic
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement actual login logic
      console.log('Login logic to be implemented');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implement actual logout logic
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, login, logout };
};

/**
 * Hook for managing site configurations
 * Single Responsibility: Handle only site management logic
 */
export const useSites = () => {
  const [sites, setSites] = useState<SiteConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement actual API call
      const mockSites: SiteConfiguration[] = [];
      setSites(mockSites);
      console.log('Load sites logic to be implemented');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSite = useCallback(async (config: Partial<SiteConfiguration>) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement actual site creation
      console.log('Create site logic to be implemented', config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create site');
    } finally {
      setLoading(false);
    }
  }, []);

  return { sites, loading, error, loadSites, createSite };
};

/**
 * Hook for debounced input handling
 * DRY principle: Reusable debounced input logic
 */
export const useDebouncedValue = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for managing local storage state
 * DRY principle: Reusable local storage logic
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};
// Export GitHub integration hook
export { useGitHub } from './useGitHub';
