// Utility functions following DRY principle

// Re-export all utility modules
export * from './string';

// Legacy exports (keeping for backward compatibility)
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Remove duplicate functions that are now in dedicated modules
// truncateText -> use truncate from string.ts
// isValidEmail -> use isValidEmail from validation.ts
// isEmpty -> use isEmpty from object.ts
// deepClone -> can be replaced with structuredClone in modern environments
