"use client";

import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

/**
 * Turns a filled brand icon (react-icons / Simple Icons) into a pencil
 * tracing: fill off, a thin stroke along every contour. Inside a
 * <DrawOnSVG drawAll> wrapper the contours then draw on like any sketch.
 * Hover shading is applied by the parent via the `.traced-icon` class and
 * the #crosshatch-icon pattern (see Skills).
 */
export function TracedIcon({
  icon: Icon,
  size = 34,
  className,
  title,
}: {
  icon: IconType;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <Icon
      size={size}
      aria-hidden={title ? undefined : true}
      title={title}
      className={cn("traced-icon overflow-visible", className)}
      style={{
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 0.55,
        strokeLinejoin: "round",
        strokeLinecap: "round",
      }}
    />
  );
}
