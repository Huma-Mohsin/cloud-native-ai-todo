/**
 * Utility functions for the frontend application.
 *
 * This module provides common utility functions for formatting,
 * styling, and data manipulation.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 *
 * This utility combines clsx for conditional classes and tailwind-merge
 * to handle Tailwind class conflicts properly.
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * ```typescript
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4')
 * // Returns: 'py-1 bg-blue-500 px-4'
 * // Note: px-4 overrides px-2
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format ISO date string to human-readable format
 *
 * @param dateString - ISO date string (e.g., '2024-01-01T12:00:00Z')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate('2024-01-01T12:00:00Z')
 * // Returns: 'Jan 1, 2024'
 *
 * formatDate('2024-01-01T12:00:00Z', { dateStyle: 'full' })
 * // Returns: 'Monday, January 1, 2024'
 * ```
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format ISO date string to relative time (e.g., '2 hours ago')
 *
 * @param dateString - ISO date string
 * @returns Relative time string
 *
 * @example
 * ```typescript
 * formatRelativeTime('2024-01-01T12:00:00Z')
 * // Returns: '2 hours ago' (if current time is 2024-01-01T14:00:00Z)
 * ```
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(dateString);
}

/**
 * Truncate text to specified length with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```typescript
 * truncate('This is a very long text', 10)
 * // Returns: 'This is a...'
 * ```
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter of a string
 *
 * @param text - Text to capitalize
 * @returns Capitalized text
 *
 * @example
 * ```typescript
 * capitalize('hello world')
 * // Returns: 'Hello world'
 * ```
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Debounce function execution
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const handleSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 500);
 *
 * handleSearch('test'); // Will execute after 500ms of inactivity
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Sleep for specified milliseconds
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 *
 * @example
 * ```typescript
 * await sleep(1000); // Wait 1 second
 * console.log('Executed after 1 second');
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
