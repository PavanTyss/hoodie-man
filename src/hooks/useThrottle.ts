'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Returns a throttled value that updates at most once every `interval` ms.
 * Use for scroll position, resize, or values that change rapidly.
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(
        () => {
          lastUpdated.current = Date.now();
          setThrottledValue(value);
        },
        interval - (now - lastUpdated.current)
      );
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Returns a throttled callback that runs at most once every `interval` ms.
 * Use for scroll handlers, quantity +/- buttons, or any handler that should not run on every click/event.
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRan.current >= interval) {
        lastRan.current = now;
        fnRef.current(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(
          () => {
            lastRan.current = Date.now();
            timeoutRef.current = null;
            fnRef.current(...args);
          },
          interval - (now - lastRan.current)
        );
      }
    },
    [interval]
  );
}
