/**
 * Utility functions for string manipulation
 */

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Capitalizes the first letter of each word in a string
 */
export function capitalizeWords(value: string): string {
  if (!value) return '';
  return value
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toLowerCase());
}

/**
 * Converts a string to kebab-case
 */
export function toKebabCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to snake_case
 */
export function toSnakeCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncate(value: string, maxLength: number, suffix = '...'): string {
  if (!value || value.length <= maxLength) return value || '';
  return value.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Removes accents/diacritics from a string
 */
export function removeAccents(value: string): string {
  if (!value) return '';
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Checks if a string is null, undefined, or empty (including whitespace)
 */
export function isNullOrEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Generates a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Pads a string to the left with a specified character
 */
export function padLeft(value: string, length: number, padChar = ' '): string {
  if (!value) return padChar.repeat(length);
  return value.padStart(length, padChar);
}

/**
 * Pads a string to the right with a specified character
 */
export function padRight(value: string, length: number, padChar = ' '): string {
  if (!value) return padChar.repeat(length);
  return value.padEnd(length, padChar);
}
