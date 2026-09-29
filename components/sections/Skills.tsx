"use client";

import { colors } from "@/lib/design-tokens";
import { skills } from "@/lib/content/skills";
import { scribbleLoop, seedFrom } from "@/lib/sketch";
import { DrawOnSVG } from "@/components/sketch/DrawOnSVG";
import { TracedIcon } from "@/components/sketch/TracedIcon";
import { SectionHeader } from "./SectionHeader";

const loops = skills.map((s) =>
  scribbleLoop(32, 32, 27, 26, seedFrom(s.name), 1.12),
);

/**
 * Every logo is traced in pencil (fill off, stroke on its contours) inside a
 * freehand circle. The whole grid is one <DrawOnSVG as="div" drawAll>, so
 * circles and icon contours draw in document order: a wave running across
 * the grid. Hovering a skill shades it with cross-hatching (see
 * `.skill-tile` in globals.css).
 */
export function Skills() {
  return (
    <section aria-labelledby="skills-title" className="py-20">
      <SectionHeader
        id="skills-title"
        sheet="Sheet 04 · Materials & tools"
        title="Skills"
      >
        I love working with these technologies to build functional applications.
      </SectionHeader>
      <DrawOnSVG
        as="div"
        drawAll
        order="dom"
        timing={{ outline: { duration: 0.45, stagger: 0.035 } }}
      >
        <ul className="grid grid-cols-3 gap-x-4 gap-y-9 sm:grid-cols-5">
          {skills.map((s, i) => (
            <li
              key={s.name}
              className="skill-tile group flex flex-col items-center gap-2.5"
            >
              <span className="relative flex h-[68px] w-[68px] items-center justify-center transition-transform duration-300 group-hover:-rotate-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 64 64"
                  className="absolute inset-0 h-full w-full overflow-visible"
                  fill="none"
                >
                  <path
                    d={loops[i]}
                    stroke={colors.graphite2}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    filter="url(#pencil-grain)"
                  />
                </svg>
                <TracedIcon
                  icon={s.icon}
                  size={30}
                  className="text-graphite relative"
                />
              </span>
              <span className="font-arch text-graphite text-sm">{s.name}</span>
            </li>
          ))}
        </ul>
      </DrawOnSVG>
    </section>
  );
}
