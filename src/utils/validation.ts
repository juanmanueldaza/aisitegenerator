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