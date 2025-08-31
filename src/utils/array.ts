/**
 * Array utility functions
 * Following DRY principle for common array operations
 */

/**
 * Removes falsy values from an array
 * @param arr - The array to compact
 * @returns Array with falsy values removed
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * Removes duplicate values from an array
 * @param arr - The array to deduplicate
 * @returns Array with unique values
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Groups array items by a key function
 * @param arr - The array to group
 * @param keyFn - Function that returns the group key for each item
 * @returns Object with grouped items
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return arr.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
}

/**
 * Chunks an array into smaller arrays of specified size
 * @param arr - The array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Finds the first item that matches a predicate
 * @param arr - The array to search
 * @param predicate - Function to test each item
 * @returns The first matching item or undefined
 */
export function find<T>(arr: T[], predicate: (item: T) => boolean): T | undefined {
  return arr.find(predicate);
}

/**
 * Checks if array includes an item based on a predicate
 * @param arr - The array to search
 * @param predicate - Function to test each item
 * @returns True if any item matches the predicate
 */
export function includes<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.some(predicate);
}
