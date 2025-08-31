/**
 * Centralized Error Handling Utilities
 * Provides consistent error handling patterns across the application
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  originalError?: unknown;
  context?: Record<string, unknown>;
  timestamp?: number;
}

export interface ErrorHandlerOptions {
  logToConsole?: boolean;
  showUserMessage?: boolean;
  context?: Record<string, unknown>;
}

/**
 * Standard error handler that provides consistent error processing
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorInfo[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with consistent logging and user feedback
   */
  handle(error: unknown, options: ErrorHandlerOptions = {}): ErrorInfo {
    const errorInfo = this.parseError(error, options.context);

    // Log error if requested
    if (options.logToConsole !== false) {
      console.error('🚨 Error handled:', errorInfo);
    }

    // Store in error log for debugging
    this.errorLog.push({
      ...errorInfo,
      timestamp: Date.now(),
    });

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }

    return errorInfo;
  }

  /**
   * Parse various error types into a consistent format
   */
  private parseError(error: unknown, context?: Record<string, unknown>): ErrorInfo {
    if (error instanceof Error) {
      const err = error as Error & { code?: string };
      return {
        message: error.message,
        code: err.code,
        originalError: error,
        context,
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        context,
      };
    }

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      return {
        message: (err.message as string) || (err.error as string) || 'Unknown error',
        code: err.code as string,
        status: err.status as number,
        originalError: error,
        context,
      };
    }

    return {
      message: 'An unknown error occurred',
      originalError: error,
      context,
    };
  }

  /**
   * Get recent error log for debugging
   */
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

/**
 * Convenience function for handling errors
 */
export function handleError(error: unknown, options?: ErrorHandlerOptions): ErrorInfo {
  return ErrorHandler.getInstance().handle(error, options);
}

/**
 * Create a user-friendly error message
 */
export function createUserFriendlyMessage(error: ErrorInfo): string {
  // Map technical errors to user-friendly messages
  const messageMap: Record<string, string> = {
    'Network Error': 'Unable to connect to the server. Please check your internet connection.',
    Timeout: 'The request timed out. Please try again.',
    Unauthorized: 'You are not authorized to perform this action. Please check your credentials.',
    Forbidden: 'Access denied. You may not have permission for this action.',
    'Not Found': 'The requested resource was not found.',
    'Internal Server Error': 'A server error occurred. Please try again later.',
  };

  return messageMap[error.message] || error.message || 'An unexpected error occurred.';
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: ErrorInfo): boolean {
  const retryableStatuses = [408, 429, 500, 502, 503, 504]; // Timeout, rate limit, server errors
  const retryableMessages = ['network error', 'timeout', 'connection failed', 'server error'];

  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }

  const message = error.message.toLowerCase();
  return retryableMessages.some((retryable) => message.includes(retryable));
}

/**
 * Type guard for HTTP-like errors
 */
export function isHttpError(error: unknown): error is { status: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).status === 'number' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Type guard for validation errors
 */
export function isValidationError(error: unknown): error is { field: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).field === 'string' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}
