"use client";

import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { colors } from "@/lib/design-tokens";
import { curvedArrow, seedFrom } from "@/lib/sketch";
import { cn } from "@/lib/utils";
import { TransitionLink } from "./EraserTransition";
import { MeasuredScribble } from "./MeasuredScribble";
import { SketchBorder } from "./SketchBorder";

type Variant = "box" | "link" | "arrow";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  /** What gets scribbled on hover/focus. */
  hover?: "circle" | "underline";
  size?: "sm" | "md" | "lg";
  external?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  type?: "button" | "submit";
};

/**
 * Buttons and links that respond like a pencil would.
 *
 *  box    : sketched rectangle; on hover a loop is scribbled round it
 *  link   : plain text; on hover a wavy underline is drawn
 *  arrow  : text + hand-drawn arrow that stretches on hover
 *
 * The hover scribble is a `.scribble-hover` path: drawn when the parent
 * `.group` is hovered or keyboard-focused, erased (reversed) on leave. A new
 * seed on every hover means the scribble is never the same twice.
 * `data-scribble` tells <PencilCursor> and <FocusScribble> not to add
 * their own circle.
 */
export function ScribbleButton({
  children,
  href,
  onClick,
  variant = "box",
  hover = variant === "box" ? "circle" : "underline",
  size = "md",
  external = false,
  className,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  type = "button",
}: Props) {
  const baseSeed = seedFrom(
    typeof children === "string" ? children : (href ?? "btn"),
  );
  const [seed, setSeed] = useState(baseSeed);
  const bump = () => setSeed((s) => s + 17);

  const arrow = useMemo(
    () => curvedArrow([2, 12], [44, 10], 0.18, seed),
    [seed],
  );

  const sizes = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-2xl",
  } as const;

  const inner = (
    <>
      {variant === "box" ? (
        <SketchBorder
          seed={baseSeed}
          redrawOnHover
          className={cn(
            "font-arch text-graphite inline-flex items-center gap-2",
            sizes[size],
          )}
          hatch={false}
        >
          {children}
        </SketchBorder>
      ) : (
        <span
          className={cn(
            "font-arch text-graphite relative inline-flex items-center gap-2",
            size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base",
          )}
        >
          {children}
        </span>
      )}

      {variant === "arrow" && (
        <svg
          aria-hidden="true"
          width="48"
          height="22"
          viewBox="0 0 48 22"
          fill="none"
          className="overflow-visible transition-transform duration-300 ease-out group-hover:translate-x-1.5"
        >
          <g
            stroke={colors.graphite}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pencil-grain)"
          >
            <path d={arrow.shaft} />
            <path d={arrow.head} />
          </g>
        </svg>
      )}

      {hover === "circle" ? (
        <MeasuredScribble
          kind="loop"
          seed={seed}
          className="scribble-hover -inset-x-4 -inset-y-3"
          stroke={colors.accentBlue}
          strokeWidth={1.8}
        />
      ) : (
        <MeasuredScribble
          kind="underline"
          seed={seed}
          className="scribble-hover inset-x-0 -bottom-2 h-3"
          stroke={colors.graphite}
          strokeWidth={1.5}
          amplitude={1.4}
        />
      )}
    </>
  );

  // With a circle scribble, the scribble *is* the focus ring; underline
  // links keep the regular focus treatment (<FocusScribble> / outline).
  const cls = cn(
    "group relative inline-flex items-center gap-1",
    hover === "circle" && "outline-none",
    className,
  );
  const shared = {
    className: cls,
    "data-scribble": hover,
    onPointerEnter: bump,
    onFocus: bump,
    "aria-label": ariaLabel,
    style: { WebkitTapHighlightColor: "transparent" } as CSSProperties,
  };

  if (href) {
    if (external || /^https?:/.test(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>
          {inner}
        </a>
      );
    }
    return (
      <TransitionLink href={href} {...shared}>
        {inner}
      </TransitionLink>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      {...shared}
    >
      {inner}
    </button>
  );
}
