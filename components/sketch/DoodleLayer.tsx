"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/design-tokens";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { prng, smoothPath } from "@/lib/sketch";

type Pt = [number, number];

/** Pointer-down on these never starts a doodle: they keep their own behaviour. */
const INTERACTIVE =
  'a, button, input, textarea, select, label, summary, video, [role="button"], [role="tab"], [contenteditable], [data-no-doodle]';
/** Text: dragging here should still select text, not draw. */
const TEXT =
  "p, h1, h2, h3, h4, h5, h6, li, dt, dd, span, time, figcaption, blockquote, code, pre, strong, em";

const MIN_STEP = 1.6; // px between recorded points
const MAX_STROKES = 80;

/**
 * Two paths per stroke, so the line reads as graphite rather than ink: a
 * firm core and a fainter, slightly wandering second pass beside it.
 */
function strokePaths(pts: Pt[], seed: number) {
  const r = prng(seed);
  let dx = 0;
  let dy = 0;
  const shadow = pts.map(([x, y]): Pt => {
    dx = Math.max(-0.9, Math.min(0.9, dx + (r() - 0.5) * 0.5));
    dy = Math.max(-0.9, Math.min(0.9, dy + (r() - 0.5) * 0.5));
    return [x + dx, y + dy];
  });
  // A single click still leaves a dot.
  const core =
    pts.length > 1 ? smoothPath(pts) : `M${pts[0][0]} ${pts[0][1]}l0.1 0.1`;
  return { core, shadow: pts.length > 1 ? smoothPath(shadow) : "" };
}

const polyline = (pts: Pt[]) =>
  pts
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("");

/**
 * Lets the pencil cursor actually draw.
 *
 * Press and drag on empty paper (not on text, links or buttons, which keep
 * working as usual) to sketch a graphite line. Points are stored in page
 * coordinates, so doodles scroll with the sheet like real pencil marks. A
 * stylus draws thicker the harder you press.
 *
 * While drawing, the live stroke is a cheap polyline updated once per
 * frame by direct DOM writes; on release it's replaced by a smoothed
 * Catmull-Rom curve with its doubled graphite pass. Ctrl/⌘+Z undoes the
 * last stroke, the "erase doodles" chip rubs them all out, and navigating
 * to another page clears them (the eraser transition wipes the sheet).
 *
 * Mouse and pen only: on touch screens a drag is a scroll, so it's off.
 */
export function DoodleLayer() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();
  const layerRef = useRef<SVGGElement>(null);
  // The count is tagged with the page it belongs to, so it reads as 0 as
  // soon as the route changes (the strokes themselves are cleared below).
  const [doodles, setDoodles] = useState({ page: pathname, count: 0 });
  const count = doodles.page === pathname ? doodles.count : 0;
  const pageRef = useRef(pathname);
  const setCount = (n: number) =>
    setDoodles({ page: pageRef.current, count: n });
  const [erasing, setErasing] = useState(false);

  // New page, clean sheet.
  useEffect(() => {
    pageRef.current = pathname;
    layerRef.current?.replaceChildren();
  }, [pathname]);

  useEffect(() => {
    if (!finePointer) return;
    const layer = layerRef.current;
    if (!layer) return;
    const NS = "http://www.w3.org/2000/svg";

    let drawing: {
      pts: Pt[];
      path: SVGPathElement;
      width: number;
      raf: number;
      seed: number;
    } | null = null;

    const pagePoint = (e: PointerEvent): Pt => [
      e.clientX + window.scrollX,
      e.clientY + window.scrollY,
    ];

    const onDown = (e: PointerEvent) => {
      if (
        e.button !== 0 ||
        (e.pointerType !== "mouse" && e.pointerType !== "pen")
      )
        return;
      const target = e.target as Element | null;
      if (!target || target.closest(INTERACTIVE) || target.closest(TEXT))
        return;
      if (window.getSelection()?.toString())
        window.getSelection()?.removeAllRanges();

      // Stop text selection and native image dragging from starting.
      e.preventDefault();
      document.documentElement.style.userSelect = "none";

      const width =
        e.pointerType === "pen" ? 0.7 + (e.pressure || 0.5) * 2 : 1.5;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("stroke", colors.graphite);
      path.setAttribute("stroke-width", String(width));
      path.setAttribute("opacity", "0.9");
      layer.appendChild(path);
      drawing = {
        pts: [pagePoint(e)],
        path,
        width,
        raf: 0,
        seed: Math.floor(Math.random() * 9999) + 1,
      };
      path.setAttribute("d", polyline(drawing.pts));

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    const onMove = (e: PointerEvent) => {
      if (!drawing) return;
      const events =
        typeof e.getCoalescedEvents === "function"
          ? e.getCoalescedEvents()
          : [e];
      for (const ev of events.length ? events : [e]) {
        const p = pagePoint(ev);
        const last = drawing.pts[drawing.pts.length - 1];
        if (Math.hypot(p[0] - last[0], p[1] - last[1]) >= MIN_STEP)
          drawing.pts.push(p);
      }
      if (!drawing.raf) {
        drawing.raf = requestAnimationFrame(() => {
          if (!drawing) return;
          drawing.raf = 0;
          drawing.path.setAttribute("d", polyline(drawing.pts));
        });
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.style.userSelect = "";
      if (!drawing) return;
      cancelAnimationFrame(drawing.raf);
      const { pts, path, width, seed } = drawing;
      drawing = null;

      // Settle the stroke: smooth curve + fainter second graphite pass.
      const { core, shadow } = strokePaths(pts, seed);
      const g = document.createElementNS(NS, "g");
      g.setAttribute("filter", "url(#pencil-grain)");
      path.setAttribute("d", core);
      path.setAttribute("pathLength", "1");
      g.appendChild(path);
      if (shadow) {
        const s = document.createElementNS(NS, "path");
        s.setAttribute("d", shadow);
        s.setAttribute("pathLength", "1");
        s.setAttribute("stroke", colors.graphite2);
        s.setAttribute("stroke-width", String(Math.max(0.6, width * 0.45)));
        s.setAttribute("opacity", "0.5");
        g.appendChild(s);
      }
      layer.appendChild(g);
      while (layer.childElementCount > MAX_STROKES)
        layer.firstElementChild?.remove();
      setCount(layer.childElementCount);
    };

    const onKey = (e: KeyboardEvent) => {
      if (
        !(e.metaKey || e.ctrlKey) ||
        e.key.toLowerCase() !== "z" ||
        e.shiftKey
      )
        return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, [contenteditable="true"]')) return;
      if (!layer.lastElementChild) return;
      e.preventDefault();
      layer.lastElementChild.remove();
      setCount(layer.childElementCount);
    };

    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      onUp();
    };
  }, [finePointer]);

  /** Rub everything out: each stroke un-draws from its end, then it's gone. */
  const eraseAll = () => {
    const layer = layerRef.current;
    if (!layer) return;
    if (reduced) {
      layer.replaceChildren();
      setCount(0);
      return;
    }
    setErasing(true);
    layer.querySelectorAll("path").forEach((p) => {
      p.style.strokeDasharray = "1 2";
      p.style.strokeDashoffset = "0";
      p.style.transition = "stroke-dashoffset .45s cubic-bezier(.6,.05,.3,1)";
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        layer
          .querySelectorAll("path")
          .forEach((p) => (p.style.strokeDashoffset = "-1.01"));
      }),
    );
    window.setTimeout(() => {
      layer.replaceChildren();
      setCount(0);
      setErasing(false);
    }, 500);
  };

  if (!finePointer) return null;

  return (
    <>
      {/*
        A 1px-tall SVG at the document origin with overflow visible: paths
        can sit anywhere on the page without the layer affecting layout or
        scroll height.
      */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-30 h-px w-px overflow-visible"
        fill="none"
      >
        <g ref={layerRef} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <button
          type="button"
          onClick={eraseAll}
          disabled={erasing}
          data-scribble="none"
          className="group bg-paper font-arch text-graphite fixed bottom-5 left-5 z-[60] flex items-center gap-2 px-3 py-1.5 text-sm"
          style={{
            border: `1.5px solid ${colors.graphite}`,
            borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
          }}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="16"
            viewBox="-2 -2 26 20"
            fill="none"
            className="transition-transform duration-300 group-hover:-rotate-12"
          >
            <path
              d="M2 10L10 2H22V10L14 14H2Z"
              fill={colors.paperShade}
              stroke={colors.graphite}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M10 2V10M2 10H14V14M14 10L22 2"
              stroke={colors.graphite}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
          erase doodles
          <span className="text-graphite-2 font-mono text-[10px]">
            ({count})
          </span>
        </button>
      )}
    </>
  );
}
