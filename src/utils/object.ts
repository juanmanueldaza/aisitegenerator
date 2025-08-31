/**
 * Object utility functions
 * Following DRY principle for common object operations
 */

/**
 * Checks if a value is an object (not null and not array)
 * @param value - The value to check
 * @returns True if value is a plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks if an object is empty (no enumerable properties)
 * @param obj - The object to check
 * @returns True if object has no properties
 */
export function isEmpty(obj: unknown): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  if (isObject(obj)) return Object.keys(obj).length === 0;
  return false;
}

/**
 * Gets a nested property from an object using dot notation
 * @param obj - The object to get property from
 * @param path - Dot notation path (e.g., 'user.name')
 * @param defaultValue - Default value if property doesn't exist
 * @returns The property value or default value
 */
export function get<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (isObject(result) && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }

  return result as T;
}

/**
 * Sets a nested property in an object using dot notation
 * @param obj - The object to set property in
 * @param path - Dot notation path (e.g., 'user.name')
 * @param value - The value to set
 */
export function set(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!isObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Creates a new object with only the specified keys
 * @param obj - The source object
 * @param keys - Array of keys to pick
 * @returns New object with only picked keys
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Creates a new object without the specified keys
 * @param obj - The source object
 * @param keys - Array of keys to omit
 * @returns New object without omitted keys
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Merges multiple objects into one
 * @param objects - Objects to merge
 * @returns Merged object
 */
export function merge<T extends Record<string, unknown>>(...objects: (T | undefined | null)[]): T {
  return objects.reduce((result: T, obj) => {
    if (obj && result) {
      Object.keys(obj).forEach((key) => {
        (result as Record<string, unknown>)[key] = obj[key as keyof T];
      });
    }
    return result;
  }, {} as T);
}
