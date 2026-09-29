"use client";

import { useMemo } from "react";
import { useInViewOnce } from "@/lib/hooks";
import { colors } from "@/lib/design-tokens";
import { line } from "@/lib/sketch";
import { cn } from "@/lib/utils";

/**
 * A hand-drawn divider that stretches to its container without measuring:
 * the line lives in a 100×4 viewBox with preserveAspectRatio="none" and the
 * SVG is exactly 4px thick, so only the long axis is stretched and the
 * stroke width stays true. (Don't reach for `vector-effect:
 * non-scaling-stroke` here: Chromium then applies the dash pattern in screen
 * space and the pathLength-based draw-on only draws part of the line.)
 */
export function SketchLine({
  vertical = false,
  seed = 3,
  stroke = colors.graphite2,
  strokeWidth = 1,
  roughness = 0.6,
  className,
  delay = 0,
  duration = 0.8,
  immediate = false,
}: {
  vertical?: boolean;
  seed?: number;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  className?: string;
  delay?: number;
  duration?: number;
  immediate?: boolean;
}) {
  const [ref, inView] = useInViewOnce<SVGSVGElement>({ immediate });
  const d = useMemo(
    () =>
      vertical
        ? line(2, 0, 2, 100, { seed, roughness, bowing: 0.4 })
        : line(0, 2, 100, 2, { seed, roughness, bowing: 0.4 }),
    [vertical, seed, roughness],
  );
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      data-play={inView || undefined}
      viewBox={vertical ? "0 0 4 100" : "0 0 100 4"}
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none block overflow-visible",
        vertical ? "h-full w-1" : "h-1 w-full",
        className,
      )}
      fill="none"
    >
      <path
        d={d}
        pathLength={1}
        className="draw-path"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={
          {
            "--draw-dur": `${duration}s`,
            "--draw-delay": `${delay}s`,
          } as React.CSSProperties
        }
      />
    </svg>
  );
}
