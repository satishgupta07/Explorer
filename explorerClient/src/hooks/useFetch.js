import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic data-fetching hook with:
 *  - automatic AbortController cleanup on unmount / dep change
 *  - loading / error state management
 *  - manual `refetch()` trigger
 *
 * @param {string|null}  url     - Full URL to fetch. Pass null to skip.
 * @param {RequestInit}  options - fetch() options (method, headers, body, …)
 * @param {any[]}        deps    - Extra dependencies that should re-trigger the fetch.
 */
export function useFetch(url, options = {}, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError]     = useState(null);

  // Stable reference to options so we don't need to memoize at call-sites.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async (signal) => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(url, { ...optionsRef.current, signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      // AbortError is expected on cleanup — don't treat it as a real error.
      if (err.name !== "AbortError") {
        setError(err.message ?? "Fetch failed");
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchData(controller.signal);

    // Cancel the in-flight request when the component unmounts or deps change.
    return () => controller.abort();
  }, [fetchData, url]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
  }, [fetchData]);

  return { data, loading, error, refetch };
}
