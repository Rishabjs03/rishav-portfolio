/**
 * Sketch geometry: every hand-drawn shape on the site comes from here.
 *
 * Rough.js does the heavy lifting for lines, rectangles and hachure fills. We
 * only use its *generator* (no canvas, no DOM), so these helpers run on the
 * server and in the browser with identical output: the same seed always
 * produces the same wobble, which keeps hydration stable.
 *
 * All functions return SVG path `d` strings so the caller can animate them
 * with stroke-dashoffset.
 */
import rough from "roughjs";
import type { Drawable, Options } from "roughjs/bin/core";
import { rough as roughPresets } from "./design-tokens";

type Pt = [number, number];

const generator = rough.generator();
const DECIMALS = 1;

/** Small, fast deterministic PRNG (mulberry32). */
export function prng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable numeric seed from a string, e.g. a project title. */
export function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000 || 1;
}

const f = (n: number) => Number(n.toFixed(DECIMALS));

/** Split a Rough.js drawable into its outline and its hatch (fill sketch). */
function split(drawable: Drawable) {
  let stroke = "";
  let fill = "";
  for (const set of drawable.sets) {
    const d = generator.opsToPath(set, DECIMALS);
    if (set.type === "fillSketch") fill += d;
    else if (set.type === "path") stroke += d;
  }
  return { stroke, fill };
}

const base: Options = { ...roughPresets.illustration, strokeWidth: 1 };

export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: Options = {},
) {
  return split(generator.line(x1, y1, x2, y2, { ...base, ...o })).stroke;
}

/** Several lines merged into one path, so they draw as one pencil pass. */
export function lines(
  segments: Array<[number, number, number, number]>,
  o: Options = {},
) {
  const seed = o.seed ?? 1;
  return segments
    .map(([x1, y1, x2, y2], i) =>
      line(x1, y1, x2, y2, { ...o, seed: seed + i * 13 }),
    )
    .join("");
}

export function polyline(points: Pt[], o: Options = {}) {
  return split(generator.linearPath(points, { ...base, ...o })).stroke;
}

export function polygon(points: Pt[], o: Options = {}) {
  return split(generator.polygon(points, { ...base, ...o }));
}

export function ellipse(
  cx: number,
  cy: number,
  w: number,
  h: number,
  o: Options = {},
) {
  return split(generator.ellipse(cx, cy, w, h, { ...base, ...o }));
}

export function circle(cx: number, cy: number, d: number, o: Options = {}) {
  return ellipse(cx, cy, d, d, o);
}

/** Rough.js rectangle; pass `fill` + `fillStyle` to get hatching back too. */
export function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  o: Options = {},
) {
  return split(generator.rectangle(x, y, w, h, { ...base, ...o }));
}

/**
 * Hachure-only fill for a rectangle (no outline): diagonal pencil shading.
 * `gap` is the spacing between strokes, `angle` their direction in degrees.
 */
export function hatchRect(
  x: number,
  y: number,
  w: number,
  h: number,
  {
    gap = 6,
    angle = -41,
    seed = 1,
    style = "hachure",
    roughness = 1,
  }: {
    gap?: number;
    angle?: number;
    seed?: number;
    style?: "hachure" | "cross-hatch" | "zigzag";
    roughness?: number;
  } = {},
) {
  if (w <= 0 || h <= 0) return "";
  return split(
    generator.rectangle(x, y, w, h, {
      ...base,
      roughness,
      seed,
      fill: "currentColor",
      fillStyle: style,
      hachureGap: gap,
      hachureAngle: angle,
      fillWeight: 1,
      disableMultiStrokeFill: true,
    }),
  ).fill;
}

export function hatchPolygon(
  points: Pt[],
  {
    gap = 6,
    angle = -41,
    seed = 1,
    style = "hachure",
  }: {
    gap?: number;
    angle?: number;
    seed?: number;
    style?: "hachure" | "cross-hatch";
  } = {},
) {
  return split(
    generator.polygon(points, {
      ...base,
      seed,
      fill: "currentColor",
      fillStyle: style,
      hachureGap: gap,
      hachureAngle: angle,
      disableMultiStrokeFill: true,
    }),
  ).fill;
}

/**
 * A sketched rectangle the way people really draw one: four separate strokes
 * that overshoot the corners and don't quite meet. Rough.js draws every line
 * twice (multi-stroke), which gives the doubled, overlapping edge.
 */
export function sketchRect(
  w: number,
  h: number,
  {
    seed = 1,
    overshoot = 5,
    inset = 2,
    roughness = roughPresets.border.roughness,
    bowing = roughPresets.border.bowing,
  }: {
    seed?: number;
    overshoot?: number;
    inset?: number;
    roughness?: number;
    bowing?: number;
  } = {},
) {
  const r = prng(seed);
  const o = () => overshoot * (0.35 + r() * 0.9);
  const j = () => (r() - 0.5) * 1.6;
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const opts = { roughness, bowing, seed };
  return [
    line(x0 - o(), y0 + j(), x1 + o(), y0 + j(), { ...opts, seed: seed + 1 }),
    line(x1 + j(), y0 - o(), x1 + j(), y1 + o(), { ...opts, seed: seed + 2 }),
    line(x1 + o(), y1 + j(), x0 - o(), y1 + j(), { ...opts, seed: seed + 3 }),
    line(x0 + j(), y1 + o(), x0 + j(), y0 - o(), { ...opts, seed: seed + 4 }),
  ].join("");
}

/** Catmull-Rom spline through points → smooth cubic Bézier path. */
export function smoothPath(pts: Pt[]) {
  if (pts.length < 2) return "";
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/**
 * The loop you scribble around something important: an ellipse that goes
 * round ~1.2 times, drifting outwards so the start and end don't line up.
 */
export function scribbleLoop(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed = 1,
  turns = 1.22,
) {
  const r = prng(seed);
  const start = -Math.PI * (0.55 + r() * 0.3);
  const tilt = (r() - 0.5) * 0.12;
  const phase = r() * Math.PI * 2;
  const steps = Math.round(26 * turns);
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + t * turns * Math.PI * 2;
    const k =
      1 + 0.045 * Math.sin(a * 2 + phase) + (r() - 0.5) * 0.025 + t * 0.07;
    const x = Math.cos(a) * rx * k;
    const y = Math.sin(a) * ry * k;
    pts.push([
      cx + x * Math.cos(tilt) - y * Math.sin(tilt),
      cy + x * Math.sin(tilt) + y * Math.cos(tilt),
    ]);
  }
  return smoothPath(pts);
}

/** A quick underline: a wavy stroke out, then a shorter return stroke. */
export function scribbleUnderline(
  w: number,
  y: number,
  seed = 1,
  amplitude = 2.2,
) {
  const r = prng(seed);
  const out: Pt[] = [];
  const n = Math.max(4, Math.round(w / 38));
  for (let i = 0; i <= n; i++) {
    out.push([
      (i / n) * w,
      y +
        Math.sin(i * 1.7 + r() * 2) * amplitude * (0.5 + r() * 0.5) +
        i * 0.15,
    ]);
  }
  const back: Pt[] = [];
  const m = Math.max(3, Math.round(n * 0.7));
  for (let i = 0; i <= m; i++) {
    back.push([
      w * (0.96 - (i / m) * 0.8),
      y + 4 + Math.sin(i * 2.1 + r() * 2) * amplitude * 0.7,
    ]);
  }
  return smoothPath(out) + smoothPath(back);
}

/** Back-and-forth scribble that covers a box: used to cross out content. */
export function zigzagScribble(w: number, h: number, seed = 1, passes = 7) {
  const r = prng(seed);
  const pts: Pt[] = [];
  for (let i = 0; i <= passes; i++) {
    const y = (i / passes) * h * 0.9 + h * 0.05;
    pts.push([
      i % 2 === 0 ? w * (0.02 + r() * 0.06) : w * (0.92 + r() * 0.06),
      y + (r() - 0.5) * 8,
    ]);
  }
  return smoothPath(pts);
}

/** Archimedean spiral, drawn outwards from the centre. */
export function spiral(
  cx: number,
  cy: number,
  turns = 3.2,
  spacing = 6,
  seed = 1,
) {
  const r = prng(seed);
  const pts: Pt[] = [];
  const steps = Math.round(turns * 22);
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * turns * Math.PI * 2;
    const rad = (spacing * a) / (Math.PI * 2) + (r() - 0.5) * 0.8;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.92]);
  }
  return smoothPath(pts);
}

/** Arrowhead: two short strokes flaring back from (x, y) against `angle`. */
export function arrowHead(
  x: number,
  y: number,
  angle: number,
  size = 9,
  spread = 0.5,
) {
  const a1 = angle + Math.PI - spread;
  const a2 = angle + Math.PI + spread;
  return `M${f(x + Math.cos(a1) * size)} ${f(y + Math.sin(a1) * size)}L${f(x)} ${f(y)}L${f(x + Math.cos(a2) * size * 0.9)} ${f(y + Math.sin(a2) * size * 0.9)}`;
}

/** Hand-drawn curved arrow from `from` to `to`, bulging by `bend`. */
export function curvedArrow(from: Pt, to: Pt, bend = 0.25, seed = 1) {
  const r = prng(seed);
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const ctrl: Pt = [
    mx - dy * bend + (r() - 0.5) * 2,
    my + dx * bend + (r() - 0.5) * 2,
  ];
  const shaft = `M${f(from[0])} ${f(from[1])}Q${f(ctrl[0])} ${f(ctrl[1])} ${f(to[0])} ${f(to[1])}`;
  const angle = Math.atan2(to[1] - ctrl[1], to[0] - ctrl[0]);
  return { shaft, head: arrowHead(to[0], to[1], angle) };
}
