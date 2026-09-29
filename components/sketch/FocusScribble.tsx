"use client";

import { useEffect, useRef } from "react";
import { colors } from "@/lib/design-tokens";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { ScribbleRing, type ScribbleRingHandle } from "./ScribbleRing";

/**
 * Keyboard focus ring, drawn as a hand-scribbled loop around the focused
 * element. Only for :focus-visible (keyboard) focus, never for mouse clicks.
 * Elements that scribble their own circle on focus (ScribbleButton with
 * data-scribble="circle") are left alone.
 *
 * While it's mounted, <html> gets .focus-scribble, which turns the dashed
 * CSS fallback outline transparent (see globals.css).
 */
export function FocusScribble() {
  const ring = useRef<ScribbleRingHandle>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("focus-scribble");

    const onIn = (e: FocusEvent) => {
      const el = e.target as Element | null;
      if (!el || !(el instanceof HTMLElement || el instanceof SVGElement))
        return;
      if (!el.matches(":focus-visible")) return;
      if (el.getAttribute("data-scribble") === "circle")
        return ring.current?.hide();
      ring.current?.show(el);
    };
    const onOut = () => ring.current?.hide();

    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      root.classList.remove("focus-scribble");
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  return (
    <ScribbleRing
      ref={ring}
      color={colors.accentBlue}
      animate={!reduced}
      zIndex={90}
    />
  );
}
