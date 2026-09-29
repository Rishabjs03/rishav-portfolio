"use client";

/**
 * The draw-on engine shared by <DrawOnSVG>, <ScrollBuilding> and the hero.
 *
 * How the pencil effect works:
 *   1. Every stroke gets `pathLength="1"`, so its length is normalised to 1
 *      whatever its real size.
 *   2. `stroke-dasharray: 1 2` means one dash as long as the whole path
 *      followed by a gap twice as long.
 *   3. `stroke-dashoffset: 1.01` slides the gap over the path (hidden). As
 *      it tweens to 0 the dash slides in from the start: the line looks
 *      like it's being drawn. The extra 0.01 hides the dot a round line cap
 *      would otherwise leave at the start.
 *
 * The pre-hidden state is set in CSS (`.js [data-draw-root] [data-draw]`,
 * see globals.css), so strokes never flash before JavaScript runs. Without
 * JavaScript, or with reduced motion, the drawing is simply shown finished.
 */
import { layerTiming, motion, type LayerTiming } from "./design-tokens";
import { gsap } from "./gsap";

export const LAYER_ORDER = [
  "construction",
  "outline",
  "detail",
  "hatch",
  "annotation",
] as const;

export const SHAPES = "path, line, polyline, polygon, circle, ellipse, rect";

export const HIDDEN_OFFSET = 1.01;

/** Normalise strokes and put them in the pre-draw (hidden) state. */
export function prepareStrokes(els: Element[]) {
  if (!els.length) return;
  for (const el of els) {
    if (!el.hasAttribute("pathLength")) el.setAttribute("pathLength", "1");
  }
  gsap.set(els, {
    strokeDasharray: "1 2",
    strokeDashoffset: HIDDEN_OFFSET,
    opacity: 1,
  });
}

export function timingFor(
  layer: string,
  overrides?: Partial<Record<string, Partial<LayerTiming>>>,
): LayerTiming {
  return {
    ...(layerTiming[layer] ?? layerTiming.outline),
    ...(overrides?.[layer] ?? {}),
  };
}

type Follower = {
  /** An SVG <g> in the same <svg>, moved so its origin sits on the pencil tip. */
  el: SVGGraphicsElement;
  layers: string[];
};

export type BuildOptions = {
  layers?: readonly string[];
  order?: "layers" | "dom";
  drawAll?: boolean;
  timing?: Partial<Record<string, Partial<LayerTiming>>>;
  follower?: Follower | null;
};

/**
 * Build a paused timeline that draws everything inside `root`, layer by layer.
 * Elements opt in with `data-draw="<layer>"`; `data-draw-fade` elements
 * (usually <text>) fade in with the layer named by the attribute value.
 */
export function buildDrawTimeline(root: Element, opts: BuildOptions = {}) {
  const {
    layers = LAYER_ORDER,
    order = "layers",
    drawAll = false,
    timing,
    follower,
  } = opts;
  const tl = gsap.timeline({ paused: true });
  const phone = window.matchMedia("(max-width: 767px)").matches;
  tl.timeScale(motion.timeScale * (phone ? motion.mobileTimeScale : 1));

  // Skip strokes hidden by CSS (e.g. details dropped on mobile), so the
  // pencil never "draws" something that isn't there.
  const visible = (el: Element) =>
    typeof el.checkVisibility === "function" ? el.checkVisibility() : true;
  const pick = (sel: string) =>
    Array.from(root.querySelectorAll(sel)).filter(visible);

  const groups: Array<{ layer: string; els: Element[] }> =
    order === "dom" || drawAll
      ? [{ layer: "outline", els: pick(drawAll ? SHAPES : "[data-draw]") }]
      : layers.map((layer) => ({ layer, els: pick(`[data-draw="${layer}"]`) }));

  prepareStrokes(groups.flatMap((g) => g.els));

  const fades = Array.from(
    root.querySelectorAll<SVGElement | HTMLElement>("[data-draw-fade]"),
  );
  if (fades.length) gsap.set(fades, { opacity: 0 });

  let first = true;
  for (const { layer, els } of groups) {
    const t = timingFor(layer, timing);
    const position = first ? 0 : `>-${t.overlap}`;
    const layerFades = fades.filter(
      (el) => (el.dataset.drawFade || "annotation") === layer,
    );

    if (els.length === 0 && layerFades.length === 0) continue;

    if (follower && follower.layers.includes(layer)) {
      // Sequential strokes with the pencil riding the tip of each one.
      // Duration scales with stroke length so the pencil moves at a
      // believable, roughly constant speed.
      const sub = gsap.timeline();
      for (const el of els) {
        const geo = el as SVGGeometryElement;
        const len =
          typeof geo.getTotalLength === "function" ? geo.getTotalLength() : 100;
        const duration = gsap.utils.clamp(t.min, t.max, len / t.speed);
        const proxy = { p: 0 };
        sub.to(proxy, {
          p: 1,
          duration,
          ease: "power1.inOut",
          onUpdate: () => {
            geo.style.strokeDashoffset = String(HIDDEN_OFFSET * (1 - proxy.p));
            const pt = geo.getPointAtLength(len * proxy.p);
            follower.el.setAttribute(
              "transform",
              `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`,
            );
          },
        });
      }
      tl.add(sub, position);
    } else if (els.length) {
      tl.to(
        els,
        {
          strokeDashoffset: 0,
          duration: t.duration,
          stagger: t.stagger,
          ease: t.ease,
        },
        position,
      );
    }

    if (layerFades.length) {
      tl.to(
        layerFades,
        { opacity: 1, duration: 0.4, stagger: 0.08, ease: "power1.out" },
        els.length ? "<0.1" : position,
      );
    }
    first = false;
  }

  return tl;
}

/** Remove the inline styles the timeline left, so CSS (and resizes) win. */
export function clearDrawStyles(root: Element) {
  const els = root.querySelectorAll<SVGElement>(`${SHAPES}, [data-draw-fade]`);
  if (els.length)
    gsap.set(els, { clearProps: "strokeDasharray,strokeDashoffset,opacity" });
}
