import type { CSSProperties } from "react";
import { colors } from "@/lib/design-tokens";
import { site } from "@/lib/content/site";
import { circle, rect } from "@/lib/sketch";
import { Annotation } from "@/components/sketch/Annotation";
import { HandwrittenHeading } from "@/components/sketch/HandwrittenHeading";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";
import { HeroElevation } from "./HeroElevation";

/** Pip layouts for dice faces ⚀ ⚁ ⚂ in a 24-unit box. */
const PIPS: Array<Array<[number, number]>> = [
  [[12, 12]],
  [
    [7.5, 7.5],
    [16.5, 16.5],
  ],
  [
    [7, 7],
    [12, 12],
    [17, 17],
  ],
];

/** A hand-drawn die face, drawn in with the line it introduces. */
function Die({ face, delay }: { face: number; delay: number }) {
  const box = rect(2, 2, 20, 20, { seed: 70 + face, roughness: 1 }).stroke;
  const pips = PIPS[face]
    .map(
      ([x, y], i) =>
        circle(x, y, 3.2, {
          seed: 80 + face * 5 + i,
          roughness: 0.4,
          disableMultiStroke: true,
        }).stroke,
    )
    .join("");
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mt-0.5 h-6 w-6 shrink-0 overflow-visible"
      fill="none"
    >
      <g
        stroke={colors.graphite}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pencil-grain)"
      >
        <path
          d={box}
          pathLength={1}
          className="draw-path"
          strokeWidth={1.3}
          style={
            {
              "--draw-dur": "0.5s",
              "--draw-delay": `${delay}s`,
            } as CSSProperties
          }
        />
        <path
          d={pips}
          pathLength={1}
          className="draw-path"
          strokeWidth={2.2}
          style={
            {
              "--draw-dur": "0.3s",
              "--draw-delay": `${delay + 0.4}s`,
            } as CSSProperties
          }
        />
      </g>
    </svg>
  );
}

export function Hero() {
  const dice = ["⚀", "⚁", "⚂"];
  return (
    <section
      aria-labelledby="hero-title"
      className="relative grid items-center gap-10 pt-28 pb-16 md:grid-cols-[1.05fr_1fr] md:gap-6 md:pt-36"
    >
      <div>
        <p className="text-graphite-2 mb-3 font-mono text-[11px] tracking-[0.2em] uppercase">
          Sheet 00 · About the architect
        </p>
        <HandwrittenHeading
          as="h1"
          id="hero-title"
          text={site.name}
          immediate
          delay={0.1}
          className="text-[clamp(2.5rem,12.5vw,3.4rem)] whitespace-nowrap sm:text-7xl"
        />

        {/* data-play is set server-side: the dice start drawing on first paint.
            The text itself is visible immediately. It's the page's LCP
            element, so it must not wait for an animation. */}
        <ul data-play="" className="mt-8 space-y-3.5">
          {site.intro.map((line, i) => (
            <li key={line} className="flex gap-3">
              <Die face={i} delay={0.9 + i * 0.35} />
              <span className="sr-only">{dice[i]}</span>
              <p className="text-graphite text-[15px] leading-relaxed sm:text-base">
                {line}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
          <ScribbleButton href={site.bookCall} external size="md">
            Book a call
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="overflow-visible"
            >
              <path
                d="M3 5.5Q3 3 5 3L7 3.5 8 7 6.2 8.2Q7.4 10.8 9.8 11.8L11 10 14.5 11 15 13Q15 15 12.5 15 3.5 13.5 3 5.5Z"
                stroke={colors.graphite}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </ScribbleButton>
          <Annotation
            text="30 min, no slides, let's build something"
            direction="left"
            color="blue"
            delay={2.2}
            immediate
            textClassName="text-[13px] sm:text-sm whitespace-normal sm:whitespace-nowrap max-w-[11rem] sm:max-w-none"
          />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[26rem] md:max-w-none">
        <HeroElevation />
      </div>

      <Annotation
        text="scroll"
        direction="down"
        color="graphite"
        delay={3.2}
        immediate
        className="absolute -bottom-2 left-0 hidden md:inline-flex"
      />
    </section>
  );
}
