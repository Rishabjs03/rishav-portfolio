"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { colors } from "@/lib/design-tokens";
import { experience, type Role } from "@/lib/content/experience";
import { useElementSize, useInViewOnce } from "@/lib/hooks";
import { hatchRect, line, lines, rect, seedFrom } from "@/lib/sketch";
import { Annotation } from "@/components/sketch/Annotation";
import { DrawOnSVG } from "@/components/sketch/DrawOnSVG";
import { TechStickers } from "@/components/sketch/TechSticker";
import { SectionHeader } from "./SectionHeader";

/** Wall / slab thickness of the section drawing, in px. */
const T = 11;
const FLOOR_HEIGHT_M = 3.2;

const elevation = (level: number) => {
  const m = (level - 1) * FLOOR_HEIGHT_M;
  return m === 0 ? "±0.00" : `+${m.toFixed(2).padStart(5, "0")}`;
};

/*
 * Each floor measures itself and redraws its walls for that exact size.
 * Walls are drawn "cut", as in an architectural section: two lines with
 * diagonal hatching (poché) between them. The draw is scrubbed to scroll,
 * so the floor is traced as it rises into view (DrawOnSVG trigger="scrub").
 */
function useFloorPaths(
  size: { w: number; h: number } | null,
  seed: number,
  kind: "floor" | "roof" | "ground",
) {
  return useMemo(() => {
    if (!size) return null;
    const { w, h } = size;
    if (kind === "roof") {
      // Parapet walls rising above the roof slab + a small rooftop unit.
      return {
        outline:
          lines(
            [
              [-6, h - T, w + 6, h - T],
              [-4, h, w + 4, h],
              [0, h - T - 26, 0, h],
              [T, h - T - 26, T, h - T],
              [w - T, h - T - 26, w - T, h - T],
              [w, h - T - 26, w, h],
              [-3, h - T - 26, T + 3, h - T - 26],
              [w - T - 3, h - T - 26, w + 3, h - T - 26],
            ],
            { seed, roughness: 0.7 },
          ) +
          rect(w * 0.62, h - T - 30, 64, 30, { seed: seed + 5, roughness: 0.8 })
            .stroke +
          line(w * 0.62 + 12, h - T - 30, w * 0.62 + 12, h - T - 44, {
            seed: seed + 6,
          }),
        hatch:
          hatchRect(0, h - T, w, T, { gap: 5, seed: seed + 7 }) +
          hatchRect(0, h - T - 26, T, 26, { gap: 5, seed: seed + 8 }) +
          hatchRect(w - T, h - T - 26, T, 26, { gap: 5, seed: seed + 9 }),
        construction: line(-40, h - T - 26, w + 40, h - T - 26, {
          seed: seed + 10,
          roughness: 0.2,
          disableMultiStroke: true,
        }),
      };
    }
    if (kind === "ground") {
      // Ground line running past the building, earth hatch, wall footings.
      return {
        outline:
          line(-120, 6, w + 60, 6, { seed, roughness: 0.6 }) +
          rect(-8, 6, T + 16, 16, { seed: seed + 1, roughness: 0.7 }).stroke +
          rect(w - T - 8, 6, T + 16, 16, { seed: seed + 2, roughness: 0.7 })
            .stroke,
        hatch: hatchRect(-110, 9, w + 160, h - 12, {
          gap: 7,
          seed: seed + 3,
          angle: -50,
        }),
        construction: "",
      };
    }
    return {
      outline: lines(
        [
          [0, -2, 0, h + 2],
          [T, -2, T, h - T],
          [w - T, -2, w - T, h - T],
          [w, -2, w, h + 2],
          [-5, h - T, w + 5, h - T],
          [-5, h, w + 5, h],
        ],
        { seed, roughness: 0.6, bowing: 0.3 },
      ),
      hatch:
        hatchRect(0, 0, T, h - T, { gap: 5, seed: seed + 3 }) +
        hatchRect(w - T, 0, T, h - T, { gap: 5, seed: seed + 4 }) +
        hatchRect(0, h - T, w, T, { gap: 5, seed: seed + 5 }),
      construction: line(-60, h - T / 2, w + 60, h - T / 2, {
        seed: seed + 6,
        roughness: 0.2,
        disableMultiStroke: true,
      }),
    };
  }, [size, seed, kind]);
}

function SectionFrame({
  kind,
  seed,
  children,
  className,
}: {
  kind: "floor" | "roof" | "ground";
  seed: number;
  children?: ReactNode;
  className?: string;
}) {
  const [nearRef, near] = useInViewOnce<HTMLDivElement>({
    rootMargin: "600px 0px",
  });
  const [ref, size] = useElementSize<HTMLDivElement>({ enabled: near });
  const paths = useFloorPaths(size, seed, kind);
  const setRefs = (node: HTMLDivElement | null) => {
    ref.current = node;
    nearRef.current = node;
  };
  return (
    <div ref={setRefs} className={className ?? "relative"}>
      {paths && size && (
        <DrawOnSVG
          trigger="scrub"
          start="top 88%"
          end={kind === "floor" ? "bottom 75%" : "bottom 80%"}
          version={`${size.w}x${size.h}`}
          aria-hidden="true"
          width={size.w}
          height={size.h}
          className="pointer-events-none absolute top-0 left-0"
        >
          <g filter="url(#pencil)" strokeLinecap="round" strokeLinejoin="round">
            {paths.construction && (
              <path
                data-draw="construction"
                pathLength={1}
                d={paths.construction}
                stroke={colors.construction}
                strokeWidth={0.8}
              />
            )}
            <path
              data-draw="outline"
              pathLength={1}
              d={paths.outline}
              stroke={colors.graphite}
              strokeWidth={1.3}
            />
            <path
              data-draw="hatch"
              pathLength={1}
              d={paths.hatch}
              stroke={colors.graphite2}
              strokeWidth={0.6}
            />
          </g>
        </DrawOnSVG>
      )}
      {children}
    </div>
  );
}

function LevelTag({
  level,
  label,
  start,
  end,
}: {
  level: string;
  label: string;
  start?: string;
  end?: string;
}) {
  return (
    <div className="text-graphite-2 font-mono text-[10px] leading-5 tracking-[0.16em] uppercase">
      <p className="text-graphite">{level}</p>
      <p className="flex items-center gap-1.5">
        <svg
          aria-hidden="true"
          width="10"
          height="9"
          viewBox="0 0 10 9"
          fill="none"
        >
          <path
            d="M1 1H9L5 8Z"
            stroke={colors.graphite}
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </p>
      {start && (
        <p className="mt-2 normal-case">
          {start}
          <br />
          to {end}
        </p>
      )}
    </div>
  );
}

function Floor({ role, level }: { role: Role; level: number }) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const seed = seedFrom(role.company);
  return (
    <li className="grid md:grid-cols-[8.5rem_1fr]">
      <div className="hidden pt-8 pr-4 md:block">
        <LevelTag
          level={`Level ${String(level).padStart(2, "0")}`}
          label={elevation(level)}
          start={role.start}
          end={role.end}
        />
      </div>
      <SectionFrame kind="floor" seed={seed}>
        <div
          ref={ref}
          data-play={inView || undefined}
          className="relative px-7 pt-8 pb-12 sm:px-10"
          style={{ paddingLeft: T + 22, paddingRight: T + 22 }}
        >
          <p className="text-graphite-2 mb-2 font-mono text-[10px] tracking-[0.16em] uppercase md:hidden">
            Level {String(level).padStart(2, "0")} · {role.start} to {role.end}
          </p>
          <h3 className="ink-in">
            <a
              href={role.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-hand text-graphite decoration-graphite-2 text-4xl leading-none font-bold decoration-1 underline-offset-4 hover:underline"
            >
              {role.company}
              <span aria-hidden="true" className="ml-1 text-2xl">
                ↗
              </span>
            </a>
          </h3>
          <p
            className="ink-in font-arch text-graphite mt-2 text-lg"
            style={{ "--ink-delay": "0.1s" } as CSSProperties}
          >
            {role.role}
          </p>
          <p
            className="ink-in text-graphite-2 mt-0.5 font-mono text-[11px]"
            style={{ "--ink-delay": "0.15s" } as CSSProperties}
          >
            {role.location}
          </p>
          <ul className="mt-5 space-y-2.5">
            {role.bullets.map((b, i) => (
              <li
                key={i}
                className="ink-in text-graphite flex gap-3 text-[14.5px] leading-relaxed"
                style={{ "--ink-delay": `${0.2 + i * 0.07}s` } as CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="bg-graphite-2 mt-[0.7em] h-px w-3 shrink-0"
                />
                <span>
                  {b}
                  {role.note?.bullet === i && (
                    <Annotation
                      text={role.note.text}
                      direction="left"
                      color="red"
                      delay={0.9}
                      className="mt-1 ml-1 flex align-middle sm:ml-2 sm:inline-flex"
                      arrowScale={0.8}
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <TechStickers items={role.tech} />
          </div>
        </div>
      </SectionFrame>
    </li>
  );
}

export function Experience() {
  const top = experience.length + 1;
  return (
    <section aria-labelledby="experience-title" className="py-20">
      <SectionHeader
        id="experience-title"
        sheet="Sheet 02 · Section A-A"
        title="Experience"
      >
        Drawn as a building section: every role is a floor, the newest on top.
        Scroll and it gets traced floor by floor.
      </SectionHeader>

      <div className="relative">
        <div className="grid md:grid-cols-[8.5rem_1fr]">
          <div className="hidden items-end pb-1 md:flex">
            <LevelTag level="Roof" label={elevation(top)} />
          </div>
          <SectionFrame kind="roof" seed={501} className="relative h-16" />
        </div>

        <ol>
          {experience.map((role, i) => (
            <Floor
              key={role.company}
              role={role}
              level={experience.length - i}
            />
          ))}
        </ol>

        <div className="grid md:grid-cols-[8.5rem_1fr]">
          <div className="hidden pt-1 md:block">
            <p className="text-graphite-2 font-mono text-[10px] tracking-[0.16em] uppercase">
              Ground
            </p>
          </div>
          <SectionFrame kind="ground" seed={777} className="relative h-12">
            <Annotation
              text="where it started"
              direction="up"
              color="blue"
              delay={0.3}
              className="absolute top-8 left-6"
            />
          </SectionFrame>
        </div>
      </div>
    </section>
  );
}
