/**
 * Design tokens for the sketchbook.
 *
 * Colours and fonts are mirrored as CSS custom properties in app/globals.css
 * (`@theme` block), so Tailwind classes such as `text-graphite` or `font-hand`
 * resolve to the same values used by the SVG/JS side here.
 *
 * Motion timings live here too. Every draw-on, boil and transition reads from
 * `motion`, so the whole site can be sped up or slowed down from one place.
 */

export const colors = {
  paper: "#FDFDFB",
  paperShade: "#F4F3EE",
  graphite: "#2B2B2B", // primary strokes, body text
  graphite2: "#6B6B6B", // secondary strokes, meta text
  construction: "#B5B5B5", // construction / guide lines
  grid: "rgba(43, 43, 43, 0.05)",
  accentBlue: "#3A5BA0", // blue-pencil annotations
  accentRed: "#C0392B", // red-pencil corrections, sparingly
} as const;

export const stroke = {
  construction: 0.8,
  hairline: 1,
  outline: 1.4,
  heavy: 2,
} as const;

/**
 * Rough.js presets. `roughness` is how far a line strays from its ideal path;
 * `bowing` is how much long lines sag. Lower both for calmer drawings.
 */
export const rough = {
  border: { roughness: 0.9, bowing: 0.6 },
  sticker: { roughness: 1.2, bowing: 0.8 },
  illustration: { roughness: 0.8, bowing: 0.5 },
  construction: { roughness: 0.35, bowing: 0.2 },
} as const;

/**
 * Motion timings, in seconds.
 *
 * Draw-on layers run in this order: construction → outline → detail → hatch
 * → annotation. `speed` is in SVG units per second: when a pencil follows a
 * stroke, its duration is `length / speed`, clamped to [min, max]. Otherwise
 * each stroke takes `duration` and strokes start `stagger` apart. `overlap`
 * is how early a layer starts before the previous one finishes.
 */
export type LayerTiming = {
  duration: number;
  stagger: number;
  overlap: number;
  speed: number;
  min: number;
  max: number;
  ease: string;
};

export const layerTiming: Record<string, LayerTiming> = {
  construction: {
    duration: 0.55,
    stagger: 0.035,
    overlap: 0.15,
    speed: 2600,
    min: 0.12,
    max: 0.5,
    ease: "power1.inOut",
  },
  outline: {
    duration: 0.6,
    stagger: 0.07,
    overlap: 0.1,
    speed: 2300,
    min: 0.14,
    max: 0.55,
    ease: "power2.inOut",
  },
  detail: {
    duration: 0.45,
    stagger: 0.04,
    overlap: 0.1,
    speed: 2400,
    min: 0.1,
    max: 0.4,
    ease: "power1.inOut",
  },
  hatch: {
    duration: 0.3,
    stagger: 0.02,
    overlap: 0.05,
    speed: 3200,
    min: 0.1,
    max: 0.35,
    ease: "power1.out",
  },
  annotation: {
    duration: 0.5,
    stagger: 0.12,
    overlap: 0,
    speed: 1800,
    min: 0.2,
    max: 0.6,
    ease: "power2.out",
  },
};

export const motion = {
  /** Global multiplier for every GSAP draw timeline. 2 = twice as fast. */
  timeScale: 1,
  /** Extra speed-up on phones (< 768px), where drawings are simplified. */
  mobileTimeScale: 1.4,
  /** Line boil frame rate. Classic hand-drawn animation boils at ~8fps. */
  boilFps: 8,
  /** Heading handwriting: seconds between letters and per-letter stroke time. */
  letterStagger: 0.045,
  letterDuration: 0.34,
  /** CSS draw-on for borders and stickers (see `.draw-path` in globals.css). */
  borderDraw: 0.9,
  borderRedraw: 0.35,
  /** Eraser route transition. */
  eraseDuration: 0.6,
  revealDuration: 0.35,
  /** Custom cursor smoothing: 1 = locked to pointer, lower = more trailing. */
  cursorLerp: 0.38,
} as const;

export const layout = {
  /** Width of the reading column, matched by the `max-w-page` utility. */
  pageMax: "60rem",
  /** The margin building only appears at this width and up. */
  marginBuildingMin: 1280,
} as const;
