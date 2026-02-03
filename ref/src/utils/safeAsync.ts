import { logger } from './logger';

/**
 * Safely executes an async function and handles any unhandled rejections
 * @param fn The async function to execute
 * @param errorMessage Custom error message
 * @returns Promise that resolves with the result or rejects with a handled error
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    logger.error(errorMessage, {
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

/**
 * Safely executes an async function and returns a default value on error
 * @param fn The async function to execute
 * @param defaultValue Default value to return on error
 * @param errorMessage Custom error message
 * @returns Promise that resolves with the result or the default value
 */
export const safeAsyncWithDefault = async <T>(
  fn: () => Promise<T>,
  defaultValue: T,
  errorMessage: string = 'Operation failed'
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    logger.error(errorMessage, {
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return defaultValue;
  }
};

/**
 * Wraps a function to prevent unhandled promise rejections
 * @param fn The function to wrap
 * @returns Wrapped function that handles errors
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage: string = 'Function execution failed'
): T => {
  return ((...args: Parameters<T>) => {
    return safeAsync(() => fn(...args), errorMessage);
  }) as T;
};
