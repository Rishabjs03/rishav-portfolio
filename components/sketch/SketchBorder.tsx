"use client";

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useElementSize, useInViewOnce } from "@/lib/hooks";
import { colors, motion } from "@/lib/design-tokens";
import { hatchRect, sketchRect } from "@/lib/sketch";
import { cn } from "@/lib/utils";

type SketchBorderProps<T extends ElementType> = {
  as?: T;
  seed?: number;
  /** How wild the lines are. 0.5 = neat draughtsman, 1.5 = hurried sketch. */
  roughness?: number;
  stroke?: string;
  strokeWidth?: number;
  /** How far strokes run past the corners, in px. */
  overshoot?: number;
  /** Diagonal hatching inside the box (a scribble fill instead of a shadow). */
  hatch?:
    | { gap?: number; angle?: number; color?: string; opacity?: number }
    | boolean;
  /** Regenerate the Rough.js seed on hover: the border is redrawn, the card wobbles. */
  redrawOnHover?: boolean;
  /** Start drawing on mount instead of when scrolled into view. */
  immediate?: boolean;
  drawDelay?: number;
  drawDuration?: number;
  /** Extra classes for the SVG layer. */
  svgClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * A box whose border is sketched rather than drawn with CSS.
 *
 * The wrapper is measured with a ResizeObserver; Rough.js turns that size
 * into four overshooting, double-stroked edges (lib/sketch.ts → sketchRect).
 * The SVG sits behind the children (isolate + -z-10) and draws itself with
 * the CSS `.draw-path` animation once the box scrolls into view.
 *
 * Tweak: `--draw-dur`/`--draw-delay` per instance via drawDuration/drawDelay,
 * or globally in lib/design-tokens.ts → motion.borderDraw.
 */
export function SketchBorder<T extends ElementType = "div">({
  as,
  seed = 1,
  roughness,
  stroke = colors.graphite,
  strokeWidth = 1.15,
  overshoot = 5,
  hatch,
  redrawOnHover = false,
  immediate = false,
  drawDelay = 0,
  drawDuration = motion.borderDraw,
  className,
  svgClassName,
  children,
  onPointerEnter,
  ...rest
}: SketchBorderProps<T>) {
  const Tag: ElementType = as ?? "div";
  // Two observers: `near` (well before it's visible) triggers measuring and
  // path generation; `inView` starts the draw. Off-screen borders cost nothing.
  const [nearRef, near] = useInViewOnce<HTMLElement>({
    immediate,
    rootMargin: "600px 0px",
  });
  const [sizeRef, size] = useElementSize<HTMLElement>({ enabled: near });
  const [viewRef, inView] = useInViewOnce<HTMLElement>({ immediate });
  const [currentSeed, setSeed] = useState(seed);
  const [redraws, setRedraws] = useState(0);
  const [wobbling, setWobbling] = useState(false);
  const lastRedraw = useRef(0);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      sizeRef.current = node;
      viewRef.current = node;
      nearRef.current = node;
    },
    [sizeRef, viewRef, nearRef],
  );

  const paths = useMemo(() => {
    if (!size || size.w < 4 || size.h < 4) return null;
    const border = sketchRect(size.w, size.h, {
      seed: currentSeed,
      overshoot,
      roughness,
    });
    let fill = "";
    if (hatch) {
      const h = hatch === true ? {} : hatch;
      fill = hatchRect(3, 3, size.w - 6, size.h - 6, {
        gap: h.gap ?? 7,
        angle: h.angle ?? -41,
        seed: currentSeed + 9,
      });
    }
    return { border, fill };
  }, [size, currentSeed, overshoot, roughness, hatch]);

  const hatchStyle = hatch && hatch !== true ? hatch : {};

  const handleEnter = (e: React.PointerEvent<HTMLElement>) => {
    onPointerEnter?.(e as never);
    if (!redrawOnHover || e.pointerType === "touch") return;
    const now = performance.now();
    if (now - lastRedraw.current < 450) return;
    lastRedraw.current = now;
    setSeed((s) => s + 101);
    setRedraws((n) => n + 1);
    setWobbling(false);
    requestAnimationFrame(() => setWobbling(true));
  };

  // After the first draw, hover redraws are quick and have no delay.
  const dur = redraws > 0 ? motion.borderRedraw : drawDuration;
  const delay = redraws > 0 ? 0 : drawDelay;

  return (
    <Tag
      ref={setRefs}
      className={cn("relative isolate", wobbling && "wobble-once", className)}
      data-play={inView || undefined}
      onPointerEnter={handleEnter}
      onAnimationEnd={(e: React.AnimationEvent) => {
        if (e.target === e.currentTarget) setWobbling(false);
      }}
      {...rest}
    >
      {paths && (
        <svg
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0 left-0 -z-10 overflow-visible",
            svgClassName,
          )}
          width={size!.w}
          height={size!.h}
          fill="none"
        >
          <g
            key={currentSeed}
            filter="url(#pencil-grain)"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {paths.fill && (
              <path
                d={paths.fill}
                pathLength={1}
                className="draw-path"
                stroke={hatchStyle.color ?? colors.construction}
                strokeWidth={0.9}
                opacity={hatchStyle.opacity ?? 0.8}
                style={
                  {
                    "--draw-dur": `${dur * 1.2}s`,
                    "--draw-delay": `${delay + dur * 0.6}s`,
                  } as React.CSSProperties
                }
              />
            )}
            <path
              d={paths.border}
              pathLength={1}
              className="draw-path"
              stroke={stroke}
              strokeWidth={strokeWidth}
              style={
                {
                  "--draw-dur": `${dur}s`,
                  "--draw-delay": `${delay}s`,
                } as React.CSSProperties
              }
            />
          </g>
        </svg>
      )}
      {children}
    </Tag>
  );
}
