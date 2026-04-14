import { useState, useEffect, useRef } from "react";

/**
 * Lightweight wrapper around IntersectionObserver.
 * Returns a [ref, isIntersecting] tuple.
 * Attach `ref` to any DOM element to know when it enters/leaves the viewport.
 *
 * Used for lazy-loading images and triggering infinite scroll.
 *
 * @param {IntersectionObserverInit} options - Observer options (threshold, rootMargin, …)
 */
export function useIntersectionObserver(options = { threshold: 0.1 }) {
  const ref                         = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => observer.unobserve(el);
  // options object intentionally excluded — pass a stable ref/memo if you need reactivity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, isIntersecting];
}
