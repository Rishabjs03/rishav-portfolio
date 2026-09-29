"use client";

import type { IconType } from "react-icons";
import { SiGithub, SiX } from "react-icons/si";
import { colors } from "@/lib/design-tokens";
import { site } from "@/lib/content/site";
import { circle, hatchRect, line, polygon, rect } from "@/lib/sketch";
import { DrawOnSVG } from "@/components/sketch/DrawOnSVG";
import { SketchLine } from "@/components/sketch/SketchLine";
import { TracedIcon } from "@/components/sketch/TracedIcon";

const iconRing = circle(20, 20, 38, { seed: 61, roughness: 1 }).stroke;

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: IconType;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex h-10 w-10 items-center justify-center"
      data-scribble="none"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="absolute inset-0 overflow-visible transition-transform duration-300 group-hover:rotate-12"
        fill="none"
      >
        <path
          d={iconRing}
          stroke={colors.graphite}
          strokeWidth={1.1}
          filter="url(#pencil-grain)"
        />
      </svg>
      <TracedIcon
        icon={icon}
        size={19}
        className="text-graphite relative transition-transform duration-300 group-hover:scale-110"
      />
    </a>
  );
}

/*
 * The finished building for small screens (on desktop the margin building
 * completes itself as you reach this footer).
 */
const done = {
  ground: line(0, 70, 90, 70, { seed: 71 }),
  body:
    rect(20, 30, 50, 40, { seed: 72, roughness: 0.8 }).stroke +
    rect(28, 40, 10, 10, { seed: 73, disableMultiStroke: true }).stroke +
    rect(52, 40, 10, 10, { seed: 74, disableMultiStroke: true }).stroke +
    rect(40, 52, 10, 18, { seed: 75, disableMultiStroke: true }).stroke,
  roof: polygon(
    [
      [16, 30],
      [45, 10],
      [74, 30],
    ],
    { seed: 76 },
  ).stroke,
  flagPole: line(45, 10, 45, -8, { seed: 77, disableMultiStroke: true }),
  flag: "M45 -8L58 -4.5L45 -1",
  earth: hatchRect(2, 72, 86, 8, { gap: 4, seed: 78, angle: -50 }),
};

export function Footer() {
  return (
    <footer className="max-w-page mx-auto px-5 pt-6 pb-10 sm:px-8">
      <SketchLine seed={808} stroke={colors.graphite} />
      <div className="mt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-graphite-2 text-sm">
          Built with love by{" "}
          <a
            href={site.links.x}
            target="_blank"
            rel="noopener noreferrer"
            className="font-hand text-graphite decoration-graphite-2 hover:decoration-graphite text-xl underline decoration-1 underline-offset-4"
          >
            Rishav Agarwal
          </a>
        </p>
        <div className="flex items-center gap-3">
          <SocialIcon href={site.links.github} label="GitHub" icon={SiGithub} />
          <SocialIcon href={site.links.twitter} label="Twitter" icon={SiX} />
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center gap-1 xl:hidden">
        <DrawOnSVG
          viewBox="-2 -12 94 94"
          width={94}
          height={94}
          aria-hidden="true"
        >
          <g strokeLinecap="round" strokeLinejoin="round" filter="url(#pencil)">
            <path
              data-draw="outline"
              pathLength={1}
              d={done.ground}
              stroke={colors.graphite}
              strokeWidth={1.4}
            />
            <path
              data-draw="outline"
              pathLength={1}
              d={done.body}
              stroke={colors.graphite}
              strokeWidth={1.1}
            />
            <path
              data-draw="outline"
              pathLength={1}
              d={done.roof}
              stroke={colors.graphite}
              strokeWidth={1.2}
            />
            <path
              data-draw="hatch"
              pathLength={1}
              d={done.earth}
              stroke={colors.graphite2}
              strokeWidth={0.6}
            />
            <path
              data-draw="annotation"
              pathLength={1}
              d={done.flagPole}
              stroke={colors.graphite}
              strokeWidth={1.1}
            />
            <path
              data-draw="annotation"
              pathLength={1}
              d={done.flag}
              stroke={colors.accentRed}
              strokeWidth={1.3}
            />
          </g>
        </DrawOnSVG>
        <p className="text-graphite-2 font-mono text-[9px] tracking-[0.15em] uppercase">
          topped out ✓
        </p>
      </div>
    </footer>
  );
}
