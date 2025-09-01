/**
 * Custom hooks following DRY principle and Single Responsibility
 * Extracted from useEffect chains throughout the codebase
 */

import { useState, useCallback } from 'react';

// Export new container/presentational hooks
export { useChat } from './useChat';
export { useDeployment } from './useDeployment';
export { useSettings } from './useSettings';

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
          // Check if this is a JSON string that represents a string (starts and ends with quotes)
          if (item.startsWith('"') && item.endsWith('"')) {
            try {
              const parsed = JSON.parse(item);
              // If parsing gives us a string, use it directly
              if (typeof parsed === 'string') {
                (initialValues as Record<string, unknown>)[key as string] = parsed;
                return;
              }
            } catch {
              // If parsing fails, fall back to original behavior
            }
          }
          // Default behavior for objects and other values
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

// Export new editor-related hooks
export { useEditorContent } from './useEditorContent';
export { useEditorState } from './useEditorState';
