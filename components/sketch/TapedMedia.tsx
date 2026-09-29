import Image from "next/image";
import { colors } from "@/lib/design-tokens";
import type { Media } from "@/lib/content/projects";
import { hatchRect, polygon, prng, seedFrom } from "@/lib/sketch";
import { cn } from "@/lib/utils";
import { LazyVideo } from "./LazyVideo";
import { SketchBorder } from "./SketchBorder";

/** A strip of masking tape: torn ends, translucent, lightly hatched. */
function Tape({ seed, className }: { seed: number; className?: string }) {
  const r = prng(seed);
  const tear = () => 1 + r() * 3;
  const pts: Array<[number, number]> = [
    [tear(), 1],
    [70 - tear(), 0],
    [72 - tear(), 6],
    [69 - tear(), 12],
    [71 - tear(), 19],
    [2 + tear(), 20],
    [tear() - 1, 13],
    [tear(), 7],
  ];
  const outline = polygon(pts, {
    seed,
    roughness: 0.6,
    strokeWidth: 0.8,
  }).stroke;
  const hatch = hatchRect(4, 3, 62, 15, { gap: 5, seed: seed + 2, angle: -60 });
  return (
    <svg
      aria-hidden="true"
      width="72"
      height="22"
      viewBox="0 0 72 22"
      className={cn(
        "pointer-events-none absolute z-10 overflow-visible",
        className,
      )}
      fill="none"
    >
      <path
        d={
          pts
            .map(
              (p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`,
            )
            .join("") + "Z"
        }
        fill="rgb(236 234 224 / 0.72)"
      />
      <path
        d={hatch}
        stroke={colors.construction}
        strokeWidth="0.7"
        opacity="0.7"
      />
      <path
        d={outline}
        stroke={colors.graphite2}
        strokeWidth="0.9"
        filter="url(#pencil-grain)"
      />
    </svg>
  );
}

/**
 * Project media as a photo taped into the sketchbook: white print border,
 * slight rotation, two pieces of tape at the top corners and a hatched
 * "shadow" offset behind. Images are lazy-loaded by next/image; videos by
 * <LazyVideo>.
 */
export function TapedMedia({
  media,
  alt,
  caption,
  className,
  priority = false,
}: {
  media: Media;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  const seed = seedFrom(alt);
  const r = prng(seed);
  const rotate = (r() > 0.5 ? 1 : -1) * (0.8 + r() * 1.2);

  return (
    <figure
      className={cn(
        "group/media relative",
        media.portrait && "mx-auto w-full max-w-[15.5rem]",
        className,
      )}
      style={{ rotate: `${rotate.toFixed(2)}deg` }}
    >
      <SketchBorder
        aria-hidden="true"
        seed={seed + 5}
        stroke={colors.construction}
        hatch={{ gap: 6, color: colors.construction, opacity: 0.55 }}
        className="absolute inset-0 translate-x-2 translate-y-2"
        drawDelay={0.5}
      />
      <SketchBorder
        seed={seed}
        redrawOnHover
        className="bg-white p-2 pb-2.5 sm:p-2.5"
      >
        <div
          className={cn(
            "bg-paper-shade relative isolate overflow-hidden",
            media.portrait ? "aspect-[9/16]" : "aspect-[16/10]",
          )}
        >
          {media.type === "image" ? (
            <Image
              src={media.src}
              alt={alt}
              fill
              priority={priority}
              sizes="(min-width: 768px) 420px, 92vw"
              className="object-cover saturate-[.8] transition-[filter] duration-500 group-hover/media:saturate-100"
            />
          ) : (
            <LazyVideo
              src={media.src}
              poster={media.poster}
              label={alt}
              className="saturate-[.8] group-hover/media:saturate-100"
            />
          )}
        </div>
        {caption && (
          <figcaption className="font-arch text-graphite-2 mt-2 text-xs">
            {caption}
          </figcaption>
        )}
      </SketchBorder>
      <Tape seed={seed + 11} className="-top-3 -left-5 -rotate-[28deg]" />
      <Tape seed={seed + 23} className="-top-3 -right-5 rotate-[24deg]" />
    </figure>
  );
}
