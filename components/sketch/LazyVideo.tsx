"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Autoplaying, muted demo footage that costs nothing until it's needed:
 * the `src` is only attached when the video nears the viewport, and it
 * pauses whenever it scrolls away. Reduced-motion visitors get a paused
 * first frame plus native controls instead of autoplay.
 */
export function LazyVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          if (!reduced) v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, near]);

  return (
    <>
      <video
        ref={ref}
        src={near ? src : undefined}
        muted
        loop
        playsInline
        preload="none"
        controls={reduced}
        aria-label={label}
        onLoadedData={() => setReady(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          ready ? "opacity-100" : "opacity-0",
          className,
        )}
      />
      {/* Until the first frame arrives: the poster (lazy, optimised by
          next/image) or a pencilled placeholder. */}
      {!ready &&
        (poster ? (
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 768px) 256px, 60vw"
            className={cn("-z-10 object-cover", className)}
          />
        ) : (
          <span
            className="font-arch text-graphite-2 absolute inset-0 flex items-center justify-center text-sm"
            aria-hidden="true"
          >
            ▷ rolling the footage…
          </span>
        ))}
    </>
  );
}
