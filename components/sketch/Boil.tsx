"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { motion } from "@/lib/design-tokens";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { BOIL_FRAMES } from "./PencilDefs";

/**
 * Line boil: the gentle shimmer of hand-drawn animation, where every frame
 * is traced again and never quite matches the last.
 *
 * Rather than keeping several copies of each path, the <g> swaps between
 * pencil filters that differ only in their noise seed (#pencil-boil-0…2,
 * see PencilDefs). The swap is a direct setAttribute at `fps` (8 by default):
 * no React renders. An IntersectionObserver pauses it off-screen, and
 * reduced-motion visitors get the static #pencil filter.
 */
export function Boil({
  children,
  fps = motion.boilFps,
  active = true,
  plain = false,
}: {
  children: ReactNode;
  fps?: number;
  active?: boolean;
  plain?: boolean;
}) {
  const ref = useRef<SVGGElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const g = ref.current;
    if (!g || reduced || !active || plain) return;
    const svg = g.ownerSVGElement ?? g;
    let frame = 0;
    let timer: number | undefined;
    const tick = () => {
      frame = (frame + 1) % BOIL_FRAMES;
      g.setAttribute("filter", `url(#pencil-boil-${frame})`);
    };
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      timer = entry.isIntersecting
        ? window.setInterval(tick, 1000 / fps)
        : undefined;
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
      g.setAttribute("filter", "url(#pencil)");
    };
  }, [fps, reduced, active, plain]);

  // `plain` drops the filter entirely (used on touch devices, where
  // re-filtering a large drawing every frame costs too much).
  return (
    <g ref={ref} filter={plain ? undefined : "url(#pencil)"}>
      {children}
    </g>
  );
}
