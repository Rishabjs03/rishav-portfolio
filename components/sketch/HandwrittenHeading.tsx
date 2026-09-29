"use client";

import type { CSSProperties, ElementType } from "react";
import { colors, motion } from "@/lib/design-tokens";
import { useInViewOnce } from "@/lib/hooks";
import { seedFrom } from "@/lib/sketch";
import { cn } from "@/lib/utils";
import { MeasuredScribble } from "./MeasuredScribble";

type Props = {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
  /** Small technical label above the heading, e.g. "Sheet 02 · Projects". */
  kicker?: string;
  underline?: boolean;
  underlineColor?: string;
  /** Play on mount (above the fold) instead of on scroll into view. */
  immediate?: boolean;
  delay?: number;
};

/**
 * A heading that writes itself.
 *
 * Letters are revealed one by one with a left-to-right clip-path wipe (the
 * `.hw-letter` keyframes in globals.css), so each glyph appears the way a
 * pen would put it down. When the last letter lands, a scribbled underline
 * is drawn beneath. It's all CSS: no JS runs per frame, and the heading
 * text is real, selectable text with a screen-reader copy.
 *
 * Tweak the pace in lib/design-tokens.ts → motion.letterStagger / letterDuration.
 */
export function HandwrittenHeading({
  text,
  as: Tag = "h2",
  id,
  className,
  kicker,
  underline = true,
  underlineColor = colors.graphite,
  immediate = false,
  delay = 0,
}: Props) {
  const [ref, inView] = useInViewOnce<HTMLElement>({ immediate });
  const words = text.split(" ");
  const letterCount = text.replace(/ /g, "").length;
  const underlineDelay =
    delay + letterCount * motion.letterStagger + motion.letterDuration * 0.6;
  const seed = seedFrom(text);

  let i = 0;
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      data-play={inView || undefined}
      className={cn("relative", className)}
      style={
        {
          "--hw-delay": `${delay}s`,
          "--hw-stagger": `${motion.letterStagger}s`,
          "--hw-dur": `${motion.letterDuration}s`,
        } as CSSProperties
      }
    >
      {kicker && (
        <p
          className="ink-in text-graphite-2 mb-1 font-mono text-[11px] tracking-[0.2em] uppercase"
          style={{ "--ink-delay": `${delay}s` } as CSSProperties}
        >
          {kicker}
        </p>
      )}
      <Tag
        id={id}
        className="font-hand text-graphite relative inline-block leading-[0.95] font-bold"
      >
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {words.map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {Array.from(word).map((ch) => (
                <span
                  key={i}
                  className="hw-letter inline-block"
                  style={{ "--i": i++ } as CSSProperties}
                >
                  {ch}
                </span>
              ))}
              {wi < words.length - 1 && (
                <span className="inline-block w-[0.28em]" />
              )}
            </span>
          ))}
        </span>
        {underline && (
          <MeasuredScribble
            kind="underline"
            seed={seed}
            className="inset-x-0 -bottom-2.5 h-4"
            stroke={underlineColor}
            strokeWidth={1.6}
            amplitude={2.2}
            pathClassName="draw-path"
            style={
              {
                "--draw-dur": "0.55s",
                "--draw-delay": `${underlineDelay}s`,
              } as CSSProperties
            }
          />
        )}
      </Tag>
    </div>
  );
}
