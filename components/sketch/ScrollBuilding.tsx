"use client";

import { useEffect, useRef } from "react";
import { colors } from "@/lib/design-tokens";
import { DASH_TWEEN, prepareStrokes } from "@/lib/draw";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  useIsClient,
  useMediaQuery,
  usePrefersReducedMotion,
} from "@/lib/hooks";
import { hatchRect, line, lines, polygon, rect } from "@/lib/sketch";

/*
 * ─── Geometry (viewBox 0 0 150 420), computed once at module load ─────────
 * Ground at y=396, six 48px floors between the footing (y=380) and the roof.
 */
const GROUND = 396;
const FOOT = 380;
const FLOOR_H = 48;
const FLOORS = 6;
const L = 22;
const R = 128;

const ground = {
  line: line(2, GROUND, 148, GROUND, { seed: 3, roughness: 0.7 }),
  earth: hatchRect(6, GROUND + 3, 138, 12, { gap: 5, seed: 4, angle: -50 }),
  footing: rect(16, FOOT, 118, GROUND - FOOT, { seed: 5, roughness: 0.7 })
    .stroke,
  footingHatch: hatchRect(18, FOOT + 2, 114, GROUND - FOOT - 4, {
    gap: 4,
    seed: 6,
    style: "cross-hatch",
  }),
};

const scaffold = {
  standards: lines(
    [
      [8, GROUND, 8, 70],
      [14, GROUND, 14, 76],
      [136, GROUND, 136, 76],
      [142, GROUND, 142, 70],
    ],
    { seed: 20, roughness: 0.5 },
  ),
  ledgers: lines(
    Array.from(
      { length: 7 },
      (_, i) =>
        [4, 356 - i * 46, 146, 356 - i * 46] as [
          number,
          number,
          number,
          number,
        ],
    ),
    { seed: 30, roughness: 0.6, disableMultiStroke: true },
  ),
  braces: lines(
    Array.from({ length: 6 }, (_, i) => {
      const y = 356 - i * 46;
      return i % 2
        ? ([8, y, 14, y - 46] as [number, number, number, number])
        : ([14, y, 8, y - 46] as [number, number, number, number]);
    }).concat(
      Array.from({ length: 6 }, (_, i) => {
        const y = 356 - i * 46;
        return i % 2
          ? ([136, y, 142, y - 46] as [number, number, number, number])
          : ([142, y, 136, y - 46] as [number, number, number, number]);
      }),
    ),
    { seed: 40, roughness: 0.5, disableMultiStroke: true },
  ),
};

const floors = Array.from({ length: FLOORS }, (_, n) => {
  const bottom = FOOT - FLOOR_H * n;
  const top = bottom - FLOOR_H;
  const s = 100 + n * 17;
  const wins = n === 0 ? [34, 98] : [34, 66, 98];
  return {
    walls:
      line(L, bottom, L, top, { seed: s }) +
      line(R, bottom, R, top, { seed: s + 1 }),
    slab:
      line(L - 5, top, R + 5, top, { seed: s + 2 }) +
      line(L - 3, top + 3, R + 3, top + 3, {
        seed: s + 3,
        disableMultiStroke: true,
        roughness: 0.4,
      }),
    windows:
      wins
        .map(
          (x, i) =>
            rect(x, top + 11, 18, 22, {
              seed: s + 4 + i,
              roughness: 0.6,
              disableMultiStroke: true,
            }).stroke,
        )
        .join("") +
      (n === 0
        ? rect(66, bottom - 30, 18, 30, { seed: s + 9, roughness: 0.6 }).stroke
        : ""),
    glass: wins
      .map((x, i) =>
        hatchRect(x + 2, top + 13, 14, 18, {
          gap: 5,
          seed: s + 12 + i,
          angle: -55,
        }),
      )
      .join(""),
  };
});

const ROOF_Y = FOOT - FLOOR_H * FLOORS; // 92
const PEAK: [number, number] = [75, 50];
const roof = {
  parapet: rect(L - 4, ROOF_Y - 8, R - L + 8, 8, { seed: 300, roughness: 0.6 })
    .stroke,
  gable: polygon([[L - 6, ROOF_Y - 8], PEAK, [R + 6, ROOF_Y - 8]], {
    seed: 301,
    roughness: 0.7,
  }).stroke,
  chimney: lines(
    [
      [104, 70, 104, 54],
      [104, 54, 113, 54],
      [113, 54, 113, 76],
    ],
    { seed: 302, roughness: 0.5 },
  ),
  shade: hatchRect(78, 62, 36, 18, { gap: 4, seed: 303, angle: -25 }),
};

const flag = {
  pole: line(PEAK[0], PEAK[1], PEAK[0], 16, { seed: 400, roughness: 0.4 }),
  cloth: polygon(
    [
      [PEAK[0], 16],
      [PEAK[0] + 24, 22],
      [PEAK[0], 29],
    ],
    { seed: 401, roughness: 0.8 },
  ).stroke,
  fill: hatchRect(PEAK[0] + 1, 17, 18, 11, { gap: 2.5, seed: 402, angle: -30 }),
};

/*
 * ─── Mobile: a pencil ruler across the top + a tiny house at its end ──────
 */
const ruler = line(0, 5, 100, 5, {
  seed: 500,
  roughness: 0.3,
  bowing: 0.2,
  disableMultiStroke: true,
});
const rulerTicks = Array.from(
  { length: 11 },
  (_, i) => `M${i * 10} ${i % 5 === 0 ? 1 : 2.5}V5`,
).join("");
const house = {
  base: line(1, 25, 29, 25, { seed: 510, roughness: 0.5 }),
  walls: lines(
    [
      [5, 25, 5, 12],
      [25, 25, 25, 12],
      [12, 25, 12, 18],
      [18, 25, 18, 18],
    ],
    { seed: 511, roughness: 0.5, disableMultiStroke: true },
  ),
  roof: polygon(
    [
      [3, 13],
      [15, 4],
      [27, 13],
    ],
    { seed: 512, roughness: 0.6 },
  ).stroke,
  flag:
    line(15, 4, 15, -4, {
      seed: 513,
      roughness: 0.2,
      disableMultiStroke: true,
    }) + "M15 -4L21 -2L15 0",
};

const pct = (p: number) => `${Math.round(p * 100)}%`;

/**
 * Scroll-driven storytelling: a building is constructed in the page margin
 * as you read. Scroll progress (whole page) maps onto one GSAP timeline of
 * length 1:
 *
 *   0.00-0.08  foundation + ground
 *   0.08-0.20  scaffolding
 *   0.20-0.84  six floors, bottom to top (walls → slab → windows → glass)
 *   0.84-0.93  roof
 *   0.90-0.96  scaffolding comes down
 *   0.95-1.00  flag on the roof: you've reached the footer
 *
 * `scrub: 0.6` smooths the drawing by 0.6s behind the scrollbar. Move the
 * positions above to re-pace the story. Below 1280px the same progress
 * drives a slim ruler + house sketch under the navbar instead.
 */
export function ScrollBuilding() {
  const deskRef = useRef<SVGSVGElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const reduced = usePrefersReducedMotion();
  // Client-only: at 0% progress there's nothing drawn yet, so server-rendering
  // it would only add markup. Only the variant for this viewport is mounted.
  const client = useIsClient();
  const desktop = useMediaQuery("(min-width: 1280px)");

  useEffect(() => {
    if (reduced || !client) return;
    const ctx = gsap.context(() => (desktop ? buildDesktop() : buildMobile()));
    return () => ctx.revert();

    function buildDesktop() {
      const root = deskRef.current;
      if (!root) return;
      const q = (sel: string) => Array.from(root.querySelectorAll(sel));
      prepareStrokes(q("[data-draw]"));

      const tl = gsap.timeline({ defaults: { ease: "none", ...DASH_TWEEN } });
      tl.to(
        q('[data-draw="foundation"]'),
        { strokeDashoffset: 0, duration: 0.08, stagger: 0.012 },
        0,
      );
      tl.to(
        q('[data-draw="scaffold"]'),
        { strokeDashoffset: 0, duration: 0.08, stagger: 0.02 },
        0.08,
      );
      q("[data-floor]").forEach((g, i) => {
        const parts = Array.from(g.querySelectorAll("[data-draw]"));
        tl.to(
          parts,
          { strokeDashoffset: 0, duration: 0.07, stagger: 0.012 },
          0.2 + i * 0.107,
        );
      });
      tl.to(
        q('[data-draw="roof"]'),
        { strokeDashoffset: 0, duration: 0.06, stagger: 0.01 },
        0.84,
      );
      tl.to(q("[data-scaffold]"), { opacity: 0.12, duration: 0.06 }, 0.9);
      tl.to(
        q('[data-draw="flag"]'),
        { strokeDashoffset: 0, duration: 0.04, stagger: 0.005 },
        0.95,
      );
      tl.set({}, {}, 1);

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: "max",
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => {
          if (labelRef.current)
            labelRef.current.textContent =
              self.progress > 0.985
                ? "topped out ✓"
                : `building · ${pct(self.progress)}`;
        },
      });
    }

    function buildMobile() {
      const root = mobileRef.current;
      if (!root) return;
      const q = (sel: string) => Array.from(root.querySelectorAll(sel));
      prepareStrokes(q("[data-draw]"));
      const tl = gsap.timeline({ defaults: { ease: "none", ...DASH_TWEEN } });
      tl.to(
        q('[data-draw="progress"]'),
        { strokeDashoffset: 0, duration: 1 },
        0,
      );
      tl.to(
        q('[data-draw="house"]'),
        { strokeDashoffset: 0, duration: 0.08, stagger: 0.07 },
        0.7,
      );
      tl.to(
        q('[data-draw="flag"]'),
        { strokeDashoffset: 0, duration: 0.04 },
        0.96,
      );
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: "max",
        scrub: 0.4,
        animation: tl,
      });
    }
  }, [reduced, client, desktop]);

  if (!client) return null;

  const g = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

  return (
    <>
      {/* Desktop: in the right margin */}
      {desktop && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed right-4 bottom-6 z-0 w-[130px]"
        >
          <svg
            ref={deskRef}
            data-draw-root=""
            viewBox="0 0 150 420"
            className="w-full overflow-visible"
            fill="none"
          >
            <g filter="url(#pencil)" {...g}>
              <g data-scaffold="" opacity={reduced ? 0.12 : 1}>
                <path
                  data-draw="scaffold"
                  pathLength={1}
                  d={scaffold.standards}
                  stroke={colors.graphite2}
                  strokeWidth={0.9}
                />
                <path
                  data-draw="scaffold"
                  pathLength={1}
                  d={scaffold.ledgers}
                  stroke={colors.construction}
                  strokeWidth={0.9}
                />
                <path
                  data-draw="scaffold"
                  pathLength={1}
                  d={scaffold.braces}
                  stroke={colors.construction}
                  strokeWidth={0.8}
                />
              </g>
              <path
                data-draw="foundation"
                pathLength={1}
                d={ground.line}
                stroke={colors.graphite}
                strokeWidth={1.4}
              />
              <path
                data-draw="foundation"
                pathLength={1}
                d={ground.earth}
                stroke={colors.construction}
                strokeWidth={0.8}
              />
              <path
                data-draw="foundation"
                pathLength={1}
                d={ground.footing}
                stroke={colors.graphite}
                strokeWidth={1.2}
              />
              <path
                data-draw="foundation"
                pathLength={1}
                d={ground.footingHatch}
                stroke={colors.graphite2}
                strokeWidth={0.6}
              />
              {floors.map((f, i) => (
                <g key={i} data-floor="">
                  <path
                    data-draw="floor"
                    pathLength={1}
                    d={f.walls}
                    stroke={colors.graphite}
                    strokeWidth={1.3}
                  />
                  <path
                    data-draw="floor"
                    pathLength={1}
                    d={f.slab}
                    stroke={colors.graphite}
                    strokeWidth={1.2}
                  />
                  <path
                    data-draw="floor"
                    pathLength={1}
                    d={f.windows}
                    stroke={colors.graphite}
                    strokeWidth={0.9}
                  />
                  <path
                    data-draw="floor"
                    pathLength={1}
                    d={f.glass}
                    stroke={colors.graphite2}
                    strokeWidth={0.6}
                  />
                </g>
              ))}
              <path
                data-draw="roof"
                pathLength={1}
                d={roof.parapet}
                stroke={colors.graphite}
                strokeWidth={1.2}
              />
              <path
                data-draw="roof"
                pathLength={1}
                d={roof.gable}
                stroke={colors.graphite}
                strokeWidth={1.3}
              />
              <path
                data-draw="roof"
                pathLength={1}
                d={roof.chimney}
                stroke={colors.graphite}
                strokeWidth={1.1}
              />
              <path
                data-draw="roof"
                pathLength={1}
                d={roof.shade}
                stroke={colors.graphite2}
                strokeWidth={0.6}
              />
              <path
                data-draw="flag"
                pathLength={1}
                d={flag.pole}
                stroke={colors.graphite}
                strokeWidth={1.1}
              />
              <path
                data-draw="flag"
                pathLength={1}
                d={flag.cloth}
                stroke={colors.accentRed}
                strokeWidth={1.2}
              />
              <path
                data-draw="flag"
                pathLength={1}
                d={flag.fill}
                stroke={colors.accentRed}
                strokeWidth={0.7}
              />
            </g>
          </svg>
          <p
            ref={labelRef}
            className="text-graphite-2 mt-1 text-center font-mono text-[9px] tracking-[0.15em] whitespace-nowrap uppercase"
          >
            {reduced ? "topped out ✓" : "building · 0%"}
          </p>
        </div>
      )}

      {/* Mobile / tablet: a ruler under the navbar */}
      {!desktop && (
        <div
          ref={mobileRef}
          data-draw-root=""
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-1 z-40 flex items-end gap-2 px-4"
        >
          <svg
            viewBox="0 0 100 6"
            preserveAspectRatio="none"
            className="h-2 flex-1 overflow-visible"
            fill="none"
          >
            {/* Ticks aren't animated, so non-scaling-stroke is safe here. */}
            <path
              d={rulerTicks}
              stroke={colors.construction}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <path
              data-draw="progress"
              pathLength={1}
              d={ruler}
              stroke={colors.graphite}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          </svg>
          <svg
            viewBox="0 -6 30 32"
            className="h-7 w-7 overflow-visible"
            fill="none"
          >
            <g {...g} stroke={colors.graphite} strokeWidth={1.2}>
              <path data-draw="house" pathLength={1} d={house.base} />
              <path data-draw="house" pathLength={1} d={house.walls} />
              <path data-draw="house" pathLength={1} d={house.roof} />
              <path
                data-draw="flag"
                pathLength={1}
                d={house.flag}
                stroke={colors.accentRed}
              />
            </g>
          </svg>
        </div>
      )}
    </>
  );
}
