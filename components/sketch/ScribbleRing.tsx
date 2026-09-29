"use client";

import {
  type CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { colors } from "@/lib/design-tokens";
import { scribbleLoop } from "@/lib/sketch";

export type ScribbleRingHandle = {
  show: (el: Element) => void;
  hide: () => void;
};

const PAD_X = 10;
const PAD_Y = 8;

/**
 * A pencil loop scribbled around whatever element it's shown on. Shared by
 * <PencilCursor> (hover) and <FocusScribble> (keyboard focus).
 *
 * The SVG is fixed-position and follows its target every animation frame
 * while visible (so it tracks smooth scrolling), and stops its loop when
 * hidden. Each show() gets a fresh seed so the loop is never the same twice.
 */
export const ScribbleRing = forwardRef<
  ScribbleRingHandle,
  { color?: string; animate?: boolean; zIndex?: number }
>(function ScribbleRing(
  { color = colors.accentBlue, animate = true, zIndex = 70 },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const targetRef = useRef<Element | null>(null);
  const [state, setState] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    seed: number;
  } | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      show(el) {
        const r = el.getBoundingClientRect();
        targetRef.current = el;
        setState({
          x: r.left - PAD_X,
          y: r.top - PAD_Y,
          w: Math.round(r.width + PAD_X * 2),
          h: Math.round(r.height + PAD_Y * 2),
          seed: Math.floor(Math.random() * 9999) + 1,
        });
      },
      hide() {
        targetRef.current = null;
        setState(null);
      },
    }),
    [],
  );

  // While visible, keep the loop glued to its target (smooth scroll moves it).
  useEffect(() => {
    if (!state) return;
    let raf = 0;
    const follow = () => {
      const el = targetRef.current;
      const svg = svgRef.current;
      if (el && svg) {
        const r = el.getBoundingClientRect();
        svg.style.transform = `translate3d(${r.left - PAD_X}px, ${r.top - PAD_Y}px, 0)`;
      }
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const d = useMemo(
    () =>
      state
        ? scribbleLoop(
            state.w / 2,
            state.h / 2,
            state.w / 2 - 2,
            state.h / 2 - 2,
            state.seed,
          )
        : "",
    [state],
  );

  if (!state) return null;
  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-play=""
      className="pointer-events-none fixed top-0 left-0 overflow-visible"
      style={{
        zIndex,
        transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
      }}
      width={state.w}
      height={state.h}
      fill="none"
    >
      <path
        key={state.seed}
        d={d}
        pathLength={1}
        className={animate ? "draw-path" : undefined}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        filter="url(#pencil-grain)"
        style={{ "--draw-dur": "0.42s" } as CSSProperties}
      />
    </svg>
  );
});
