/**
 * useAsyncOperation Hook
 * Reusable hook for async operations with consistent loading, error, and success states
 * DRY principle: Eliminates repetitive async operation patterns
 */

import { useState, useCallback, useRef } from 'react';
import { handleError, type ErrorInfo } from '@/utils/error-handler';

export interface UseAsyncOperationOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: ErrorInfo) => void;
  onFinally?: () => void;
  successMessage?: string;
  errorMessage?: string;
  showErrorToast?: boolean;
}

export interface UseAsyncOperationReturn<T, Args extends unknown[] = []> {
  execute: (...args: Args) => Promise<T | undefined>;
  loading: boolean;
  error: ErrorInfo | null;
  data: T | null;
  reset: () => void;
  isSuccess: boolean;
}

/**
 * Generic hook for async operations with consistent error handling and state management
 */
export function useAsyncOperation<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
): UseAsyncOperationReturn<T, Args> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      // Cancel any previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);

        // Check if operation was cancelled
        if (abortController.signal.aborted) {
          return undefined;
        }

        setData(result);
        setError(null);

        // Call success callback
        options.onSuccess?.(result);

        return result;
      } catch (err) {
        // Check if operation was cancelled
        if (abortController.signal.aborted) {
          return undefined;
        }

        const errorInfo = handleError(err, {
          context: {
            operation: asyncFn.name,
            args,
            ...options,
          },
        });

        setError(errorInfo);
        setData(null);

        // Call error callback
        options.onError?.(errorInfo);

        return undefined;
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
          options.onFinally?.();
        }
      }
    },
    [asyncFn, options]
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  const isSuccess = data !== null && !loading && !error;

  return {
    execute,
    loading,
    error,
    data,
    reset,
    isSuccess,
  };
}

/**
 * Specialized hook for API operations with built-in retry logic
 */
export function useApiOperation<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOperationOptions<T> & {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): UseAsyncOperationReturn<T, Args> & { retryCount: number } {
  const [retryCount, setRetryCount] = useState(0);
  const { maxRetries = 3, retryDelay = 1000, ...asyncOptions } = options;

  const operation = useAsyncOperation(async (...args: Args): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        const result = await asyncFn(...args);
        setRetryCount(0); // Reset on success
        return result;
      } catch (error) {
        lastError = error;

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }, asyncOptions);

  return {
    ...operation,
    retryCount,
  };
}

/**
 * Hook for form submissions with validation
 */
export function useFormSubmission<T, Args extends unknown[] = []>(
  submitFn: (...args: Args) => Promise<T>,
  validationFn?: (...args: Args) => string | null,
  options: UseAsyncOperationOptions<T> = {}
): UseAsyncOperationReturn<T, Args> & {
  submit: (...args: Args) => Promise<T | undefined>;
  validationError: string | null;
} {
  const [validationError, setValidationError] = useState<string | null>(null);

  const operation = useAsyncOperation(submitFn, options);

  const submit = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      // Clear previous validation error
      setValidationError(null);

      // Run validation if provided
      if (validationFn) {
        const validationResult = validationFn(...args);
        if (validationResult) {
          setValidationError(validationResult);
          return undefined;
        }
      }

      return operation.execute(...args);
    },
    [validationFn, operation]
  );

  return {
    ...operation,
    submit,
    validationError,
  };
}
