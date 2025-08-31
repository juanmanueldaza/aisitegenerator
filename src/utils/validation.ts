/**
 * Validates if a string is a valid email address
 * @param email - The email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string is a valid URL
 * @param url - The URL string to validate
 * @returns True if valid URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a string is not empty (after trimming)
 * @param value - The string to validate
 * @returns True if string is not empty
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates if a value is within a numeric range
 * @param value - The number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates if a string matches a regex pattern
 * @param value - The string to validate
 * @param pattern - The regex pattern
 * @returns True if string matches pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Validates minimum string length
 * @param value - The string to validate
 * @param minLength - Minimum length required
 * @returns True if string meets minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Validates maximum string length
 * @param value - The string to validate
 * @param maxLength - Maximum length allowed
 * @returns True if string is within maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}
