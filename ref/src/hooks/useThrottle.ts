import { useCallback, useRef } from 'react';

/**
 * Custom hook for throttling function calls
 * @param fn The function to throttle
 * @param delay Throttle delay in milliseconds
 * @returns Throttled function
 */
export function useThrottle<
  T extends (...args: Parameters<T>) => ReturnType<T>
>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  const lastCall = useRef<number>(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const pendingCall = useRef<{
    args: Parameters<T>;
    resolve: (value: ReturnType<T> | undefined) => void;
  } | null>(null);

  return useCallback(
    (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      return new Promise((resolve) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall.current;

        // Clear any existing timeout
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }

        if (timeSinceLastCall >= delay) {
          // If enough time has passed, execute immediately
          lastCall.current = now;
          resolve(fn(...args));
        } else {
          // Store the pending call
          pendingCall.current = { args, resolve };

          // Set timeout for the remaining delay
          timeout.current = setTimeout(() => {
            if (pendingCall.current) {
              lastCall.current = Date.now();
              const result = fn(...pendingCall.current.args);
              pendingCall.current.resolve(result);
              pendingCall.current = null;
            }
          }, delay - timeSinceLastCall);
        }
      });
    },
    [fn, delay]
  );
}
