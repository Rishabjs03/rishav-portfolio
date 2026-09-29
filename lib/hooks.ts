"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

const subscribers = new Map<string, (cb: () => void) => () => void>();

// One stable subscribe function per query, so useSyncExternalStore doesn't
// resubscribe on every render.
function subscribe(query: string) {
  let fn = subscribers.get(query);
  if (!fn) {
    fn = (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    };
    subscribers.set(query, fn);
  }
  return fn;
}

/** Live media-query match. Returns `serverValue` during SSR. */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true once running in the browser. */
export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * True when the visitor asked for less motion. Every animated component
 * checks this and renders its finished, static drawing instead.
 */
export function usePrefersReducedMotion() {
  return useMediaQuery(REDUCED, false);
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
}

/**
 * Flips to true the first time the element scrolls into view, then stops
 * observing. Used to start CSS-driven draw-ons (`data-play`).
 */
export function useInViewOnce<T extends Element>({
  rootMargin = "0px 0px -12% 0px",
  immediate = false,
}: { rootMargin?: string; immediate?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(immediate);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, rootMargin]);

  return [ref, inView] as const;
}

/**
 * Element size via ResizeObserver, rounded to whole pixels. Pass
 * `enabled: false` to postpone measuring (e.g. until the element is near
 * the viewport), which keeps off-screen sketches from costing anything.
 */
export function useElementSize<T extends Element>({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      const w = Math.round(box ? box.inlineSize : entry.contentRect.width);
      const h = Math.round(box ? box.blockSize : entry.contentRect.height);
      setSize((prev) =>
        prev && prev.w === w && prev.h === h ? prev : { w, h },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled]);

  return [ref, size] as const;
}
