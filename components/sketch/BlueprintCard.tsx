import type { ReactNode } from "react";
import { colors } from "@/lib/design-tokens";
import { seedFrom } from "@/lib/sketch";
import { cn } from "@/lib/utils";
import { SketchBorder } from "./SketchBorder";
import { SketchLine } from "./SketchLine";

type TitleBlockField = { label: string; value: string };

/**
 * The title block in the corner of every architectural drawing sheet:
 * project name, sheet number, date, scale, draughtsman. Cell dividers are
 * stretched <SketchLine>s, so the grid is hand-ruled too.
 */
export function TitleBlock({
  project,
  fields,
  seed,
}: {
  project: string;
  fields: TitleBlockField[];
  seed: number;
}) {
  return (
    <SketchBorder
      seed={seed + 40}
      strokeWidth={1.2}
      overshoot={3}
      className="bg-paper/80 w-full sm:w-auto sm:min-w-80"
      drawDelay={0.4}
    >
      <div className="px-3 pt-2 pb-1.5">
        <p className="text-graphite-2 font-mono text-[9px] tracking-[0.18em]">
          PROJECT
        </p>
        <p className="font-arch text-graphite text-base leading-tight">
          {project}
        </p>
      </div>
      <SketchLine seed={seed + 41} stroke={colors.graphite} delay={0.9} />
      <dl className="grid grid-cols-2 sm:grid-flow-col sm:grid-cols-none">
        {fields.map((f, i) => (
          <div key={f.label} className="relative px-3 py-1.5">
            <dt className="text-graphite-2 font-mono text-[9px] tracking-[0.18em]">
              {/* The cell divider lives in <dt> so the <dl> stays valid. */}
              {i > 0 && (
                <span className="absolute inset-y-0 left-0">
                  <SketchLine
                    vertical
                    seed={seed + 50 + i}
                    stroke={colors.graphite}
                    delay={1 + i * 0.1}
                    duration={0.4}
                  />
                </span>
              )}
              {f.label}
            </dt>
            <dd
              className={cn(
                "font-arch text-[13px] sm:whitespace-nowrap",
                f.label === "SHEET" ? "text-accent-blue" : "text-graphite",
              )}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    </SketchBorder>
  );
}

/** Registration/crop mark at a sheet corner. */
function CornerMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={cn("pointer-events-none absolute", className)}
      fill="none"
    >
      <path d="M7 0V14M0 7H14" stroke={colors.construction} strokeWidth="0.8" />
      <circle
        cx="7"
        cy="7"
        r="3"
        stroke={colors.construction}
        strokeWidth="0.8"
      />
    </svg>
  );
}

/**
 * A drawing sheet: sketched outer trim line, a lighter inner frame, crop
 * marks at the corners and a title block bottom-right. The outer border
 * redraws with a new seed (and the sheet wobbles) on hover.
 */
export function BlueprintCard({
  title,
  sheet,
  date,
  scale = "1 : 1",
  drawnBy = "R. AGARWAL",
  children,
  className,
  headingId,
}: {
  title: string;
  sheet: string;
  date: string;
  scale?: string;
  drawnBy?: string;
  children: ReactNode;
  className?: string;
  headingId?: string;
}) {
  const seed = seedFrom(title);
  return (
    <article aria-labelledby={headingId} className={cn("relative", className)}>
      <CornerMark className="-top-2 -left-2" />
      <CornerMark className="-top-2 -right-2" />
      <CornerMark className="-bottom-2 -left-2" />
      <CornerMark className="-right-2 -bottom-2" />
      <SketchBorder
        seed={seed}
        redrawOnHover
        strokeWidth={1.4}
        className="p-2 sm:p-3"
      >
        <SketchBorder
          seed={seed + 7}
          stroke={colors.graphite2}
          strokeWidth={0.9}
          overshoot={3}
          roughness={0.6}
          drawDelay={0.25}
          className="p-4 sm:p-7"
        >
          <p className="text-graphite-2 mb-8 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
            <span>Sheet {sheet}</span>
            <span className="hidden sm:inline">
              Status: built &amp; shipped
            </span>
          </p>
          {children}
          <div className="mt-6 flex justify-end">
            <TitleBlock
              project={title}
              seed={seed}
              fields={[
                { label: "SHEET", value: sheet },
                { label: "DATE", value: date },
                { label: "SCALE", value: scale },
                { label: "DRAWN", value: drawnBy },
              ]}
            />
          </div>
        </SketchBorder>
      </SketchBorder>
    </article>
  );
}
