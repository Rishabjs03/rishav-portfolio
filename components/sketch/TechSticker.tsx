import { prng, seedFrom } from "@/lib/sketch";
import { colors } from "@/lib/design-tokens";
import { SketchBorder } from "./SketchBorder";

/**
 * A tech-stack sticker: a hand-lettered label in a wobbly box, stuck on at
 * a slight angle, with a hatched "lift" behind it instead of a drop shadow.
 */
export function TechSticker({
  label,
  index = 0,
}: {
  label: string;
  index?: number;
}) {
  const seed = seedFrom(label) + index * 31;
  const r = prng(seed);
  const rotate = (r() - 0.5) * 5;
  return (
    <li
      className="relative list-none"
      style={{ rotate: `${rotate.toFixed(2)}deg` }}
    >
      <SketchBorder
        aria-hidden="true"
        seed={seed + 3}
        roughness={1.2}
        stroke={colors.construction}
        strokeWidth={0.9}
        overshoot={2}
        hatch={{ gap: 4, color: colors.construction, opacity: 0.7 }}
        className="absolute inset-0 translate-x-[3px] translate-y-[3px]"
        drawDelay={0.25 + index * 0.08}
      />
      <SketchBorder
        seed={seed}
        roughness={1.1}
        strokeWidth={1.1}
        overshoot={3}
        className="bg-paper font-arch text-graphite px-2.5 py-0.5 text-[13px]"
        drawDelay={index * 0.08}
        drawDuration={0.55}
      >
        {label}
      </SketchBorder>
    </li>
  );
}

export function TechStickers({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul
      className={className ?? "flex flex-wrap gap-x-3 gap-y-2.5"}
      aria-label="Tech stack"
    >
      {items.map((t, i) => (
        <TechSticker key={t} label={t} index={i} />
      ))}
    </ul>
  );
}
