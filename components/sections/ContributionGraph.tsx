"use client";

import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/lib/design-tokens";
import { prng, scribbleLoop } from "@/lib/sketch";
import { DrawOnSVG } from "@/components/sketch/DrawOnSVG";

export type CompactCalendar = {
  total: number;
  /** First day, YYYY-MM-DD (UTC). */
  start: string;
  counts: number[];
  levels: number[];
};

const CELL = 11;
const STEP = 14;
const LEFT = 34;
const TOP = 22;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const f = (n: number) => n.toFixed(1);

/** A wobbly hand-drawn square: four corners nudged by up to ±0.7px. */
function box(x: number, y: number, s: number, seed: number) {
  const r = prng(seed);
  const j = () => (r() - 0.5) * 1.4;
  return `M${f(x + j())} ${f(y + j())}L${f(x + s + j())} ${f(y + j())}L${f(x + s + j())} ${f(y + s + j())}L${f(x + j())} ${f(y + s + j())}Z`;
}

/**
 * Pencil shading for one cell. Busier days get more strokes:
 * level 1 one diagonal, 2 two, 3 three plus two cross strokes, 4 dense
 * cross-hatching. This replaces GitHub's green scale.
 */
function shade(x0: number, y0: number, s: number, level: number, seed: number) {
  if (level <= 0) return "";
  const r = prng(seed);
  const x = x0 + 1.6;
  const y = y0 + 1.6;
  const w = s - 3.2;
  const n = [0, 1, 2, 3, 4][level];
  const cross = [0, 0, 0, 2, 4][level];
  let d = "";
  for (let i = 0; i < n; i++) {
    const o = w * (((i + 1) / (n + 1)) * 2 - 1) * 0.85 + (r() - 0.5) * 0.6;
    d +=
      o < 0
        ? `M${f(x)} ${f(y + w + o)}L${f(x + w + o)} ${f(y)}`
        : `M${f(x + o)} ${f(y + w)}L${f(x + w)} ${f(y + o)}`;
  }
  for (let i = 0; i < cross; i++) {
    const o = w * (((i + 1) / (cross + 1)) * 2 - 1) * 0.85 + (r() - 0.5) * 0.6;
    d +=
      o < 0
        ? `M${f(x)} ${f(y - o)}L${f(x + w + o)} ${f(y + w)}`
        : `M${f(x + o)} ${f(y)}L${f(x + w)} ${f(y + w - o)}`;
  }
  return d;
}

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * GitHub contributions, drawn as a page of the site diary.
 *
 * All empty squares are one light path and all active ones another, so the
 * draw-on sweeps across the year week by week (<DrawOnSVG>: construction →
 * outline). The shading then builds up level by level (hatch layer). Five
 * hatch paths plus two outline paths keep the DOM tiny, whatever the year
 * held. Hover (or tap) a day to see its count.
 */
export function ContributionGraph({ calendar }: { calendar: CompactCalendar }) {
  const { counts, levels, total, start } = calendar;
  const startDate = utc(start);
  const offset = startDate.getUTCDay();
  const cols = Math.ceil((counts.length + offset) / 7);
  const W = LEFT + cols * STEP + 4;
  const H = TOP + 7 * STEP + 2;

  const geo = useMemo(() => {
    let empty = "";
    let active = "";
    const hatch = ["", "", "", "", ""];
    const months: Array<{ x: number; label: string }> = [];
    let lastMonth = -1;
    let lastLabelCol = -10;
    counts.forEach((_, i) => {
      const a = i + offset;
      const col = Math.floor(a / 7);
      const row = a % 7;
      const x = LEFT + col * STEP;
      const y = TOP + row * STEP;
      const lvl = levels[i];
      if (lvl > 0) active += box(x, y, CELL, i + 1);
      else empty += box(x, y, CELL, i + 1);
      hatch[lvl] += shade(x, y, CELL, lvl, i + 7);

      const date = new Date(startDate.getTime() + i * 86400000);
      const m = date.getUTCMonth();
      if (m !== lastMonth && (row === 0 || i === 0)) {
        if (col - lastLabelCol >= 3) {
          months.push({ x, label: MONTHS[m] });
          lastLabelCol = col;
        }
        lastMonth = m;
      }
    });
    return { empty, active, hatch, months };
    // Inputs are static props from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts, levels, offset]);

  const [hover, setHover] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // On narrow screens the graph scrolls sideways: start at the latest week.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const col = Math.floor((p.x - LEFT) / STEP);
    const row = Math.floor((p.y - TOP) / STEP);
    const i = col * 7 + row - offset;
    const inCell =
      p.x - LEFT - col * STEP <= CELL + 1 && p.y - TOP - row * STEP <= CELL + 1;
    setHover(
      row >= 0 && row < 7 && i >= 0 && i < counts.length && inCell ? i : null,
    );
  };

  const hovered =
    hover === null
      ? null
      : {
          i: hover,
          col: Math.floor((hover + offset) / 7),
          row: (hover + offset) % 7,
        };
  const tip = hovered && {
    left: ((LEFT + hovered.col * STEP + CELL / 2) / W) * 100,
    top: ((TOP + hovered.row * STEP) / H) * 100,
    text: `${counts[hovered.i] === 0 ? "No" : counts[hovered.i]} contribution${counts[hovered.i] === 1 ? "" : "s"} on ${fmt.format(new Date(startDate.getTime() + hovered.i * 86400000))}`,
  };
  const loop = hovered
    ? scribbleLoop(
        LEFT + hovered.col * STEP + CELL / 2,
        TOP + hovered.row * STEP + CELL / 2,
        11,
        10,
        hovered.i + 3,
      )
    : "";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-graphite-2 font-mono text-[10px] tracking-[0.2em] uppercase">
          Site diary · last 12 months
        </p>
        <p className="font-arch text-accent-blue text-sm">
          {total.toLocaleString("en-US")} contributions
        </p>
      </div>
      <div
        ref={scroller}
        className="-mx-2 overflow-x-auto px-2 pb-2"
        data-lenis-prevent-horizontal=""
      >
        <div className="relative min-w-[680px]">
          <DrawOnSVG
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`GitHub contribution graph: ${total} contributions in the last year`}
            className="block h-auto w-full touch-pan-x"
            timing={{
              construction: { duration: 1.1 },
              outline: { duration: 1.3 },
              hatch: { duration: 0.55, stagger: 0.22 },
            }}
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={() => setHover(null)}
          >
            <g
              fontFamily="var(--font-architects), cursive"
              fontSize="10"
              fill={colors.graphite2}
            >
              {geo.months.map((m) => (
                <text
                  key={`${m.label}-${m.x}`}
                  data-draw-fade="detail"
                  x={m.x}
                  y={12}
                >
                  {m.label}
                </text>
              ))}
              {[
                [1, "Mon"],
                [3, "Wed"],
                [5, "Fri"],
              ].map(([row, label]) => (
                <text
                  key={label}
                  data-draw-fade="detail"
                  x={0}
                  y={TOP + (row as number) * STEP + 9}
                >
                  {label}
                </text>
              ))}
            </g>
            <g
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#pencil-grain)"
            >
              <path
                data-draw="construction"
                pathLength={1}
                d={geo.empty}
                stroke={colors.construction}
                strokeWidth={0.8}
              />
              <path
                data-draw="outline"
                pathLength={1}
                d={geo.active}
                stroke={colors.graphite2}
                strokeWidth={0.9}
              />
              {geo.hatch.map((d, lvl) =>
                d ? (
                  <path
                    key={lvl}
                    data-draw="hatch"
                    pathLength={1}
                    d={d}
                    stroke={lvl >= 3 ? colors.graphite : colors.graphite2}
                    strokeWidth={lvl >= 3 ? 1 : 0.85}
                  />
                ) : null,
              )}
            </g>
            {loop && (
              <path
                d={loop}
                stroke={colors.accentBlue}
                strokeWidth={1.4}
                strokeLinecap="round"
                className="pointer-events-none"
              />
            )}
          </DrawOnSVG>
          {tip && (
            <span
              role="status"
              className="border-graphite bg-paper font-arch text-graphite pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] border px-2 py-0.5 text-xs whitespace-nowrap"
              style={{
                left: `${tip.left}%`,
                top: `${tip.top}%`,
                borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
              }}
            >
              {tip.text}
            </span>
          )}
        </div>
      </div>
      <div
        className="font-arch text-graphite-2 mt-2 flex items-center justify-end gap-2 text-xs"
        aria-hidden="true"
      >
        less
        <svg
          width={5 * STEP}
          height={CELL + 2}
          viewBox={`-1 -1 ${5 * STEP} ${CELL + 2}`}
          fill="none"
        >
          {[0, 1, 2, 3, 4].map((lvl) => (
            <g key={lvl} strokeLinecap="round">
              <path
                d={box(lvl * STEP, 0, CELL, 900 + lvl)}
                stroke={lvl ? colors.graphite2 : colors.construction}
                strokeWidth={0.9}
              />
              <path
                d={shade(lvl * STEP, 0, CELL, lvl, 950 + lvl)}
                stroke={lvl >= 3 ? colors.graphite : colors.graphite2}
                strokeWidth={0.9}
              />
            </g>
          ))}
        </svg>
        more
      </div>
    </div>
  );
}
