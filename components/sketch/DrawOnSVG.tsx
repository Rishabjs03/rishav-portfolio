"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
} from "react";
import type { LayerTiming } from "@/lib/design-tokens";
import { buildDrawTimeline, clearDrawStyles, LAYER_ORDER } from "@/lib/draw";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Trigger = "view" | "load" | "scrub";

type DrawOnSVGProps = {
  children: ReactNode;
  className?: string;
  /** Render an <svg> (default) or a <div> that wraps several SVGs. */
  as?: "svg" | "div";
  /**
   * view  : draw once when scrolled into view (default)
   * load  : draw once on mount, after `delay`
   * scrub : progress follows the scroll position between `start` and `end`
   */
  trigger?: Trigger;
  delay?: number;
  start?: string;
  end?: string;
  /** Layer names, in drawing order. */
  layers?: readonly string[];
  /** "dom" ignores layers and draws strokes in document order. */
  order?: "layers" | "dom";
  /** Animate every shape inside, not only [data-draw] ones (used for icons). */
  drawAll?: boolean;
  timing?: Partial<Record<string, Partial<LayerTiming>>>;
  /** A <g> that rides the tip of each stroke in `pencilLayers`. */
  pencil?: RefObject<SVGGElement | null>;
  pencilLayers?: string[];
  /** Change it when the paths are regenerated (e.g. after a resize). */
  version?: string | number;
  onComplete?: () => void;
} & Omit<ComponentPropsWithoutRef<"svg">, "children">;

/**
 * Draws its contents as if by pencil.
 *
 * Mark strokes with `data-draw="construction" | "outline" | "detail" |
 * "hatch" | "annotation"` and `pathLength="1"`. They're drawn in that order
 * (light construction lines first, hatching last), each layer staggered;
 * `<text data-draw-fade="detail">` fades in alongside the detail layer.
 * Timings come from lib/design-tokens.ts → layerTiming, overridable per
 * instance with `timing`.
 */
export function DrawOnSVG({
  children,
  className,
  as = "svg",
  trigger = "view",
  delay = 0,
  start = "top 85%",
  end = "top 35%",
  layers = LAYER_ORDER,
  order = "layers",
  drawAll = false,
  timing,
  pencil,
  pencilLayers = ["outline", "detail", "hatch"],
  version,
  onComplete,
  ...svgProps
}: DrawOnSVGProps) {
  const rootRef = useRef<SVGSVGElement & HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.removeAttribute("data-drawn");

    if (prefersReducedMotion()) {
      root.setAttribute("data-drawn", "");
      onCompleteRef.current?.();
      return;
    }

    let io: IntersectionObserver | undefined;
    let st: ScrollTrigger | undefined;
    let timer: number | undefined;

    const ctx = gsap.context(() => {
      const follower = pencil?.current
        ? { el: pencil.current, layers: pencilLayers }
        : null;
      const tl = buildDrawTimeline(root, {
        layers,
        order,
        drawAll,
        timing,
        follower,
      });

      if (trigger === "scrub") {
        st = ScrollTrigger.create({
          trigger: root,
          start,
          end,
          scrub: 0.5,
          animation: tl,
        });
        return;
      }

      tl.eventCallback("onComplete", () => {
        root.setAttribute("data-drawn", "");
        clearDrawStyles(root);
        onCompleteRef.current?.();
      });

      if (trigger === "load") {
        timer = window.setTimeout(() => tl.play(), delay * 1000);
      } else {
        io = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            io?.disconnect();
            tl.delay(delay).play();
          },
          { rootMargin: "0px 0px -12% 0px" },
        );
        io.observe(root);
      }
    }, root);

    return () => {
      io?.disconnect();
      st?.kill();
      window.clearTimeout(timer);
      ctx.revert();
    };
    // Layer config is treated as static; `version` re-runs on new geometry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, version]);

  const shared = {
    "data-draw-root": "",
    "data-draw-all": drawAll ? "" : undefined,
  };

  if (as === "div") {
    return (
      <div ref={rootRef} className={className} {...shared}>
        {children}
      </div>
    );
  }

  return (
    <svg
      ref={rootRef}
      className={cn("overflow-visible", className)}
      fill="none"
      {...shared}
      {...svgProps}
    >
      {children}
    </svg>
  );
}
