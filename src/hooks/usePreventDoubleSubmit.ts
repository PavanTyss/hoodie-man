'use client';

import { useCallback, useState, useRef } from 'react';

interface Options {
  /** If true, reset isPending on error so the user can retry. Default true. */
  resetOnError?: boolean;
}

/**
 * Wraps an async function and prevents double submission while it is pending.
 * Returns [execute, isPending]. Use for form submit handlers (checkout, login, register, etc.).
 */
export function usePreventDoubleSubmit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: Options = {}
): [(...args: Parameters<T>) => Promise<void>, boolean] {
  const { resetOnError = true } = options;
  const [isPending, setIsPending] = useState(false);
  const submittedRef = useRef(false);

  const execute = useCallback(
    async (...args: Parameters<T>) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setIsPending(true);

      try {
        await fn(...args);
      } catch (err) {
        if (resetOnError) {
          submittedRef.current = false;
          setIsPending(false);
        }
        throw err;
      } finally {
        if (submittedRef.current) {
          submittedRef.current = false;
          setIsPending(false);
        }
      }
    },
    [fn, resetOnError]
  );

  return [execute, isPending];
}
