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
 *
 * With `sound`, a small pencilled toggle lets visitors unmute it (browsers
 * only allow audio after a click, so it always starts muted).
 */
export function LazyVideo({
  src,
  poster,
  label,
  className,
  sound = false,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
  sound?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const reduced = usePrefersReducedMotion();

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    // Set the DOM property directly: React doesn't reliably update `muted`.
    v.muted = !muted;
    setMuted(!muted);
    if (v.muted === false) v.play().catch(() => {});
  };

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
      {sound && !reduced && (
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={`Sound for ${label}`}
          className="font-arch text-graphite bg-paper/90 absolute right-2 bottom-2 z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs"
          style={{
            border: "1.3px solid #2B2B2B",
            borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
          }}
        >
          <svg
            aria-hidden="true"
            width="14"
            height="12"
            viewBox="0 0 14 12"
            fill="none"
          >
            <path
              d="M1 4H4L7.5 1V11L4 8H1Z"
              stroke="#2B2B2B"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {muted ? (
              <path
                d="M10 4L13 8M13 4L10 8"
                stroke="#2B2B2B"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M10 3.5Q12 6 10 8.5M11.5 2Q14.5 6 11.5 10"
                stroke="#2B2B2B"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            )}
          </svg>
          {muted ? "sound on" : "mute"}
        </button>
      )}
    </>
  );
}
