"use client";

import { type CSSProperties, useMemo } from "react";
import { useElementSize } from "@/lib/hooks";
import { scribbleLoop, scribbleUnderline, zigzagScribble } from "@/lib/sketch";
import { cn } from "@/lib/utils";

type Kind = "loop" | "underline" | "zigzag";

/**
 * A scribble drawn at the real pixel size of its box: an absolutely
 * positioned span measures itself, and the path is generated for exactly
 * that width and height. Stretching one fixed path with
 * preserveAspectRatio="none" would distort the stroke, and fixing that with
 * non-scaling-stroke breaks the pathLength-based draw-on in Chromium.
 */
export function MeasuredScribble({
  kind,
  seed,
  className,
  stroke = "currentColor",
  strokeWidth = 1.6,
  pathClassName,
  style,
  amplitude = 2,
  passes = 9,
}: {
  kind: Kind;
  seed: number;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
  pathClassName?: string;
  style?: CSSProperties;
  amplitude?: number;
  passes?: number;
}) {
  const [ref, size] = useElementSize<HTMLSpanElement>();
  const d = useMemo(() => {
    if (!size || size.w < 2 || size.h < 2) return "";
    const { w, h } = size;
    if (kind === "loop")
      return scribbleLoop(w / 2, h / 2, w / 2 - 3, h / 2 - 3, seed);
    if (kind === "underline")
      return scribbleUnderline(w, h / 2 - 2, seed, amplitude);
    return zigzagScribble(w, h, seed, passes);
  }, [size, kind, seed, amplitude, passes]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute block", className)}
    >
      {d && (
        <svg
          width={size!.w}
          height={size!.h}
          className="absolute inset-0 overflow-visible"
          fill="none"
        >
          <path
            d={d}
            pathLength={1}
            className={pathClassName}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pencil-grain)"
            style={style}
          />
        </svg>
      )}
    </span>
  );
}
