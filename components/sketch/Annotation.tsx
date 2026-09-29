"use client";

import { type CSSProperties, useMemo } from "react";
import { colors } from "@/lib/design-tokens";
import { useInViewOnce } from "@/lib/hooks";
import { curvedArrow, seedFrom } from "@/lib/sketch";
import { cn } from "@/lib/utils";

type Direction =
  | "left"
  | "right"
  | "down"
  | "up"
  | "down-left"
  | "down-right"
  | "up-left"
  | "up-right";

/**
 * Arrow geometry per direction, in a 64×40 box. `from`/`to` are the arrow's
 * tail and tip; `bend` is how much the shaft curves (sign flips the side).
 */
const ARROWS: Record<
  Direction,
  {
    from: [number, number];
    to: [number, number];
    bend: number;
    w: number;
    h: number;
  }
> = {
  left: { from: [58, 16], to: [6, 22], bend: -0.28, w: 64, h: 36 },
  right: { from: [6, 16], to: [58, 22], bend: 0.28, w: 64, h: 36 },
  down: { from: [14, 4], to: [20, 46], bend: 0.3, w: 36, h: 50 },
  up: { from: [20, 46], to: [14, 6], bend: 0.3, w: 36, h: 50 },
  "down-left": { from: [56, 6], to: [8, 40], bend: -0.25, w: 64, h: 46 },
  "down-right": { from: [8, 6], to: [56, 40], bend: 0.25, w: 64, h: 46 },
  "up-left": { from: [56, 40], to: [8, 8], bend: 0.25, w: 64, h: 46 },
  "up-right": { from: [8, 40], to: [56, 8], bend: -0.25, w: 64, h: 46 },
};

/** Where the arrow sits relative to the note. */
const LAYOUT: Record<Direction, string> = {
  left: "flex-row items-center",
  right: "flex-row-reverse items-center",
  down: "flex-col-reverse items-start",
  up: "flex-col items-start",
  "down-left": "flex-col-reverse items-start",
  "down-right": "flex-col-reverse items-end",
  "up-left": "flex-col items-start",
  "up-right": "flex-col items-end",
};

/**
 * A handwritten margin note with a pencil arrow.
 *
 * The arrow draws in first (shaft, then head), then the note inks in beside
 * it. Everything waits `delay` seconds after the note scrolls into view, so
 * annotations always land after the content they point at.
 */
export function Annotation({
  text,
  direction = "left",
  color = "blue",
  delay = 0.6,
  className,
  textClassName,
  arrowScale = 1,
  immediate = false,
}: {
  text: string;
  direction?: Direction;
  color?: "blue" | "red" | "graphite";
  delay?: number;
  className?: string;
  textClassName?: string;
  arrowScale?: number;
  immediate?: boolean;
}) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>({ immediate });
  const stroke =
    color === "blue"
      ? colors.accentBlue
      : color === "red"
        ? colors.accentRed
        : colors.graphite2;
  const a = ARROWS[direction];
  const { shaft, head } = useMemo(
    () => curvedArrow(a.from, a.to, a.bend, seedFrom(text)),
    [a, text],
  );

  return (
    <span
      ref={ref}
      data-play={inView || undefined}
      className={cn(
        "pointer-events-none inline-flex gap-1 select-none",
        LAYOUT[direction],
        className,
      )}
      aria-hidden="true"
    >
      <svg
        width={a.w * arrowScale}
        height={a.h * arrowScale}
        viewBox={`0 0 ${a.w} ${a.h}`}
        fill="none"
        className="shrink-0 overflow-visible"
      >
        <g
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pencil-grain)"
        >
          <path
            d={shaft}
            pathLength={1}
            className="draw-path"
            style={
              {
                "--draw-dur": "0.45s",
                "--draw-delay": `${delay}s`,
              } as CSSProperties
            }
          />
          <path
            d={head}
            pathLength={1}
            className="draw-path"
            style={
              {
                "--draw-dur": "0.18s",
                "--draw-delay": `${delay + 0.42}s`,
              } as CSSProperties
            }
          />
        </g>
      </svg>
      <span
        className={cn(
          "ink-in font-arch text-sm leading-tight whitespace-nowrap",
          textClassName,
        )}
        style={
          { color: stroke, "--ink-delay": `${delay + 0.3}s` } as CSSProperties
        }
      >
        {text}
      </span>
    </span>
  );
}
