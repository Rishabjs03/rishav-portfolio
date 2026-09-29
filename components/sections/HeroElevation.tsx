"use client";

import { useRef, useState } from "react";
import { colors } from "@/lib/design-tokens";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { arrowHead, circle, hatchRect, line, lines, rect } from "@/lib/sketch";
import { Boil } from "@/components/sketch/Boil";
import { DrawOnSVG } from "@/components/sketch/DrawOnSVG";
import { PencilGlyph } from "@/components/sketch/Pencil";

/*
 * ─── A blueprint-style building elevation (viewBox 0 0 520 590) ──────────
 * Everything is generated once at module load with fixed seeds, so the
 * server and browser produce identical markup.
 *
 *   ground      y = 500
 *   main block  x 110 to 360, five floors of 64 (top at y = 180)
 *   core tower  x 262 to 352, up to y = 104, with an antenna
 *   side wing   x 360 to 460, up to y = 340
 */
type Seg = [number, number, number, number];
const G = 500;
const FLOOR_TOPS = [180, 244, 308, 372, 436];
const WIN_X = [128, 176, 224, 272, 316];

const construction = {
  verticals: lines(
    [110, 262, 352, 360, 460].map((x) => [x, 64, x, 548] as Seg),
    { seed: 1, roughness: 0.3, bowing: 0.1, disableMultiStroke: true },
  ),
  horizontals: lines(
    [104, ...FLOOR_TOPS, G].map((y) => [24, y, 500, y] as Seg),
    { seed: 2, roughness: 0.3, bowing: 0.1, disableMultiStroke: true },
  ),
  diagonal: line(110, G, 360, 180, {
    seed: 3,
    roughness: 0.3,
    disableMultiStroke: true,
  }),
  // Dash-dot centre line, built from separate strokes (the draw-on effect
  // already uses stroke-dasharray, so dashes have to be real geometry).
  axis: Array.from({ length: 13 }, (_, i) => {
    const y = 150 + i * 30;
    return `M235 ${y}V${y + 18}M235 ${y + 23}V${y + 25}`;
  }).join(""),
};

const outline = {
  ground: line(18, G, 502, G, { seed: 10, roughness: 0.6 }),
  main: lines(
    [
      [104, 180, 366, 180],
      [360, 174, 360, 506],
      [110, 506, 110, 174],
    ],
    { seed: 11 },
  ),
  tower: lines(
    [
      [262, 184, 262, 98],
      [256, 104, 358, 104],
      [352, 98, 352, 184],
      [258, 96, 356, 96],
    ],
    { seed: 12 },
  ),
  wing: lines(
    [
      [354, 340, 466, 340],
      [460, 334, 460, 506],
      [356, 348, 460, 348],
    ],
    { seed: 13 },
  ),
  slabs: lines(
    FLOOR_TOPS.slice(1).map((y) => [106, y, 364, y] as Seg),
    { seed: 14, roughness: 0.55 },
  ),
  windowRows: FLOOR_TOPS.slice(0, 4).map((top, r) =>
    WIN_X.map(
      (x, i) =>
        rect(x, top + 14, 30, 36, {
          seed: 20 + r * 7 + i,
          roughness: 0.55,
          disableMultiStroke: true,
        }).stroke +
        line(x - 4, top + 52, x + 34, top + 52, {
          seed: 60 + r * 7 + i,
          disableMultiStroke: true,
        }),
    ).join(""),
  ),
  groundFloor:
    rect(172, 448, 36, 52, { seed: 90, roughness: 0.5 }).stroke +
    line(190, 450, 190, 500, { seed: 91, disableMultiStroke: true }) +
    rect(124, 452, 36, 36, {
      seed: 92,
      roughness: 0.5,
      disableMultiStroke: true,
    }).stroke +
    rect(220, 452, 128, 36, {
      seed: 93,
      roughness: 0.5,
      disableMultiStroke: true,
    }).stroke +
    lines(
      [
        [263, 452, 263, 488],
        [305, 452, 305, 488],
      ],
      { seed: 94, disableMultiStroke: true },
    ),
  canopy:
    rect(150, 440, 80, 6, { seed: 95, roughness: 0.6 }).stroke +
    lines(
      [
        [158, 446, 168, 456],
        [222, 446, 212, 456],
      ],
      { seed: 96, disableMultiStroke: true },
    ),
  towerDetail:
    rect(292, 116, 30, 56, { seed: 100, roughness: 0.5 }).stroke +
    lines(
      [
        [292, 130, 322, 130],
        [292, 144, 322, 144],
        [292, 158, 322, 158],
        [332, 96, 332, 54],
        [323, 66, 341, 66],
        [326, 78, 338, 78],
      ],
      { seed: 101, disableMultiStroke: true },
    ),
  wingDetail:
    [376, 418]
      .map(
        (x, i) =>
          rect(x, 362, 28, 30, {
            seed: 110 + i,
            roughness: 0.55,
            disableMultiStroke: true,
          }).stroke +
          rect(x, 404, 28, 30, {
            seed: 114 + i,
            roughness: 0.55,
            disableMultiStroke: true,
          }).stroke,
      )
      .join("") +
    rect(378, 452, 68, 48, { seed: 118, roughness: 0.5 }).stroke +
    lines(
      [460, 470, 480, 490].map((y) => [380, y, 444, y] as Seg),
      { seed: 119, disableMultiStroke: true, roughness: 0.4 },
    ),
};

const tick = (x: number, y: number) => `M${x - 5} ${y + 5}L${x + 5} ${y - 5}`;
const detail = {
  heightChain:
    lines(
      [
        [104, 180, 60, 180],
        [104, G, 60, G],
        [72, 172, 72, 508],
      ],
      { seed: 130, roughness: 0.3, disableMultiStroke: true },
    ) + [180, 244, 308, 372, 436, G].map((y) => tick(72, y)).join(""),
  totalChain:
    lines(
      [
        [256, 104, 30, 104],
        [40, 96, 40, 508],
      ],
      { seed: 131, roughness: 0.3, disableMultiStroke: true },
    ) +
    tick(40, 104) +
    tick(40, G),
  widthChain:
    lines(
      [
        [110, 508, 110, 546],
        [360, 508, 360, 546],
        [460, 508, 460, 546],
        [102, 538, 468, 538],
      ],
      { seed: 132, roughness: 0.3, disableMultiStroke: true },
    ) +
    tick(110, 538) +
    tick(360, 538) +
    tick(460, 538),
  north:
    circle(470, 170, 40, { seed: 140, roughness: 0.8 }).stroke +
    line(470, 192, 470, 148, { seed: 141, disableMultiStroke: true }) +
    arrowHead(470, 148, -Math.PI / 2, 9, 0.45),
  titleRule: line(110, 578, 330, 578, { seed: 150, roughness: 0.5 }),
};

const hatch = {
  earth: hatchRect(24, G + 3, 472, 16, { gap: 6, seed: 160, angle: -50 }),
  tower: hatchRect(264, 106, 86, 72, { gap: 8, seed: 161, angle: -40 }),
  canopyShadow: hatchRect(152, 447, 76, 7, { gap: 3, seed: 162, angle: -60 }),
  wingParapet: hatchRect(362, 342, 96, 5, { gap: 3, seed: 163, angle: -60 }),
  glints: FLOOR_TOPS.slice(0, 4)
    .flatMap((top) =>
      WIN_X.map(
        (x) =>
          `M${x + 6} ${top + 30}L${x + 15} ${top + 21}M${x + 10} ${top + 42}L${x + 24} ${top + 28}`,
      ),
    )
    .join(""),
};

const annotation = {
  waves: "M324 48Q332 40 340 48M318 42Q332 30 346 42",
  leader: "M348 44Q366 30 386 34",
};

/** Paths hidden on small screens: the simplified mobile drawing. */
const MOBILE_HIDDEN = "max-md:hidden";

/**
 * Hero illustration. Draws itself on page load, layer by layer, with a
 * pencil riding the tip of every outline, detail and hatch stroke (see
 * <DrawOnSVG pencil>), then settles into a gentle line boil.
 */
export function HeroElevation() {
  const pencilRef = useRef<SVGGElement>(null);
  const [done, setDone] = useState(false);
  const reduced = usePrefersReducedMotion();
  // Pencil texture + line boil only with a mouse (desktop-class hardware).
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  const P = (
    layer: string,
    d: string,
    stroke: string,
    width: number,
    className?: string,
  ) => (
    <path
      data-draw={layer}
      pathLength={1}
      d={d}
      stroke={stroke}
      strokeWidth={width}
      className={className}
    />
  );
  const txt = {
    fontFamily: "var(--font-architects), cursive",
    fill: colors.graphite2,
  } as const;

  return (
    <DrawOnSVG
      trigger="load"
      delay={0.35}
      pencil={pencilRef}
      pencilLayers={["outline", "detail", "hatch"]}
      // Hero-only speed-up: the full sequence lands in ~6s.
      timing={{
        outline: { speed: 3400, min: 0.12, max: 0.42 },
        detail: { speed: 3200, max: 0.28 },
        hatch: { speed: 4200, max: 0.24 },
      }}
      onComplete={() => setDone(true)}
      viewBox="0 0 520 590"
      role="img"
      aria-label="Pencil sketch of a building elevation with measurement lines"
      className="h-auto w-full"
    >
      <Boil plain={!finePointer}>
        <g strokeLinecap="round" strokeLinejoin="round">
          {P("construction", construction.verticals, colors.construction, 0.8)}
          {P(
            "construction",
            construction.horizontals,
            colors.construction,
            0.8,
          )}
          {P(
            "construction",
            construction.diagonal,
            colors.construction,
            0.8,
            MOBILE_HIDDEN,
          )}
          {P(
            "construction",
            construction.axis,
            colors.construction,
            0.9,
            MOBILE_HIDDEN,
          )}

          {P("outline", outline.ground, colors.graphite, 2)}
          {P("outline", outline.main, colors.graphite, 1.6)}
          {P("outline", outline.tower, colors.graphite, 1.5)}
          {P("outline", outline.wing, colors.graphite, 1.5)}
          {P("outline", outline.slabs, colors.graphite, 1.2)}
          {outline.windowRows.map((d, i) => (
            <path
              key={i}
              data-draw="outline"
              pathLength={1}
              d={d}
              stroke={colors.graphite}
              strokeWidth={1.05}
            />
          ))}
          {P("outline", outline.groundFloor, colors.graphite, 1.15)}
          {P("outline", outline.canopy, colors.graphite, 1.2)}
          {P("outline", outline.towerDetail, colors.graphite, 1.05)}
          {P("outline", outline.wingDetail, colors.graphite, 1.05)}

          {P("detail", detail.heightChain, colors.graphite2, 0.9)}
          {P("detail", detail.totalChain, colors.graphite2, 0.9, MOBILE_HIDDEN)}
          {P("detail", detail.widthChain, colors.graphite2, 0.9)}
          {P("detail", detail.north, colors.graphite2, 1, MOBILE_HIDDEN)}
          {P("detail", detail.titleRule, colors.graphite, 1.1)}

          {P("hatch", hatch.earth, colors.graphite2, 0.7)}
          {P("hatch", hatch.tower, colors.construction, 0.8)}
          {P("hatch", hatch.canopyShadow, colors.graphite2, 0.6)}
          {P("hatch", hatch.wingParapet, colors.graphite2, 0.6)}
          {P("hatch", hatch.glints, colors.construction, 0.9, MOBILE_HIDDEN)}

          {P("annotation", annotation.waves, colors.accentBlue, 1.2)}
          {P(
            "annotation",
            annotation.leader,
            colors.accentBlue,
            1.1,
            MOBILE_HIDDEN,
          )}
        </g>

        <g fontSize="13" style={txt}>
          {[212, 276, 340, 404, 468].map((y) => (
            <text
              key={y}
              data-draw-fade="detail"
              x={62}
              y={y}
              transform={`rotate(-90 62 ${y})`}
              textAnchor="middle"
            >
              3.20
            </text>
          ))}
          <text
            data-draw-fade="detail"
            x={30}
            y={300}
            transform="rotate(-90 30 300)"
            textAnchor="middle"
            className={MOBILE_HIDDEN}
          >
            19.80
          </text>
          <text data-draw-fade="detail" x={235} y={532} textAnchor="middle">
            12.50
          </text>
          <text data-draw-fade="detail" x={410} y={532} textAnchor="middle">
            5.00
          </text>
          <text
            data-draw-fade="detail"
            x={470}
            y={136}
            textAnchor="middle"
            fontSize="15"
            fill={colors.graphite}
            className={MOBILE_HIDDEN}
          >
            N
          </text>
          <text
            data-draw-fade="detail"
            x={110}
            y={572}
            fontSize="16"
            fill={colors.graphite}
          >
            ELEVATION A · SOUTH
          </text>
          <text data-draw-fade="detail" x={460} y={572} textAnchor="end">
            SCALE 1:100
          </text>
          <text
            data-draw-fade="annotation"
            x={390}
            y={38}
            fontSize="14"
            fill={colors.accentBlue}
            className={MOBILE_HIDDEN}
          >
            on air: open to work
          </text>
        </g>
      </Boil>

      {!reduced && (
        <g
          ref={pencilRef}
          transform="translate(18 500)"
          style={{ opacity: done ? 0 : 1, transition: "opacity .6s ease .2s" }}
          className="pointer-events-none"
        >
          <PencilGlyph scale={0.7} />
        </g>
      )}
    </DrawOnSVG>
  );
}
