/**
 * Custom hooks following DRY principle and Single Responsibility
 * Extracted from useEffect chains throughout the codebase
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { User, SiteConfiguration } from '../types';

/**
 * Hook for managing authentication state
 * Single Responsibility: Handle only authentication logic
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize loading state
  useEffect(() => {
    setLoading(false);
  }, []);

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

  const loadSites = async () => {
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
  };

  const createSite = async (config: Partial<SiteConfiguration>) => {
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
  };

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

/**
 * Hook for async operations with loading and error states
 * DRY principle: Reusable async operation pattern
 */
export const useAsyncOperation = <T extends unknown[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: {
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<R | null>(null);

  const execute = useCallback(
    async (...args: T) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn, options]
  );

  return { execute, loading, error, data };
};

/**
 * Hook for managing toast notifications
 * DRY principle: Reusable toast notification logic
 */
export const useToast = () => {
  const [toast, setToast] = useState<string>('');

  const showToast = useCallback((message: string, duration = 2000) => {
    setToast(message);
    if (duration > 0) {
      setTimeout(() => setToast(''), duration);
    }
  }, []);

  const hideToast = useCallback(() => setToast(''), []);

  return { toast, showToast, hideToast, visible: !!toast };
};

/**
 * Hook for event listeners
 * DRY principle: Reusable event listener logic
 */
export const useEventListener = <K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: WindowEventMap[K]) => savedHandler.current(event);
    window.addEventListener(eventName, eventListener, options);
    return () => window.removeEventListener(eventName, eventListener, options);
  }, [eventName, options]);
};

/**
 * Hook for syncing multiple localStorage values to state
 * DRY principle: Reusable localStorage sync pattern
 */
export const useLocalStorageSync = <T extends Record<string, unknown>>(
  keys: (keyof T)[],
  defaultValues: T
) => {
  const [values, setValues] = useState<T>(() => {
    const initialValues = { ...defaultValues };
    keys.forEach((key) => {
      try {
        const item = window.localStorage.getItem(key as string);
        if (item !== null) {
          initialValues[key] = JSON.parse(item);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${String(key)}":`, error);
      }
    });
    return initialValues;
  });

  const updateValue = useCallback(
    <K extends keyof T>(key: K, value: T[K] | ((prev: T[K]) => T[K])) => {
      setValues((prev) => {
        const newValue = value instanceof Function ? value(prev[key]) : value;
        try {
          window.localStorage.setItem(key as string, JSON.stringify(newValue));
        } catch (error) {
          console.error(`Error setting localStorage key "${String(key)}":`, error);
        }
        return { ...prev, [key]: newValue };
      });
    },
    []
  );

  return [values, updateValue] as const;
};

// Export GitHub integration hook
// export { useGitHub } from './useGitHub';

// Export new editor-related hooks
export { useEditorContent } from './useEditorContent';
export { useSyntaxHighlighting } from './useSyntaxHighlighting';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useViewMode } from './useViewMode';
export { useEditorState } from './useEditorState';

// Export provider health monitoring hooks
export {
  useProviderHealth,
  useProviderHealthManager,
  useProviderFailover,
} from './useProviderHealth';
