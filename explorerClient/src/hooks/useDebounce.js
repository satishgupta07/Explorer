import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates after
 * `delay` ms of inactivity. Useful for search inputs and comment fields
 * to avoid firing API calls on every keystroke.
 *
 * @param {any}    value - The value to debounce.
 * @param {number} delay - Debounce delay in milliseconds (default 400ms).
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
