/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts a string to kebab-case URL slug
 * @param str - The string to convert
 * @returns A URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a string to camelCase
 * @param str - The string to convert
 * @returns CamelCase string
 */
export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Converts a string to PascalCase
 * @param str - The string to convert
 * @returns PascalCase string
 */
export function pascalCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '');
}

/**
 * Converts a string to snake_case
 * @param str - The string to convert
 * @returns Snake_case string
 */
export function snakeCase(str: string): string {
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
}

/**
 * Checks if a string is empty or contains only whitespace
 * @param str - The string to check
 * @returns True if string is empty or whitespace
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Removes all whitespace from a string
 * @param str - The string to process
 * @returns String without whitespace
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s/g, '');
}

/**
 * Reverses a string
 * @param str - The string to reverse
 * @returns Reversed string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Counts occurrences of a substring in a string
 * @param str - The string to search
 * @param substring - The substring to count
 * @returns Number of occurrences
 */
export function countOccurrences(str: string, substring: string): number {
  if (!substring) return 0;
  let count = 0;
  let position = 0;
  while ((position = str.indexOf(substring, position)) !== -1) {
    count++;
    position += substring.length;
  }
  return count;
}
