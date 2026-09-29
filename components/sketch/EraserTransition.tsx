"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type ComponentProps,
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { colors, motion } from "@/lib/design-tokens";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/hooks";
import { smoothPath } from "@/lib/sketch";

type Ctx = { navigate: (href: string) => void };
const EraserContext = createContext<Ctx>({ navigate: () => {} });

type Phase = "idle" | "erasing" | "covered";

/**
 * Route transitions that look like the page is rubbed out, then re-sketched.
 *
 * 1. <TransitionLink> intercepts the click and calls navigate().
 * 2. A full-screen SVG draws one very thick zig-zag stroke across the
 *    viewport (stroke-dashoffset, like every other drawing here). The
 *    stroke is painted with the same paper + grid as the page, so it reads
 *    as clean paper appearing under an eraser; the eraser glyph rides the
 *    stroke tip via getPointAtLength.
 * 3. Once the page is covered we router.push(); the new route mounts under
 *    the overlay and its drawings start sketching themselves in.
 * 4. When the pathname changes, the overlay fades away.
 *
 * Reduced motion, modifier-clicks and external links skip all of this.
 * Timings: lib/design-tokens.ts → motion.eraseDuration / revealDuration.
 */
export function EraserTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [viewport, setViewport] = useState({ w: 1280, h: 800 });
  const overlayRef = useRef<SVGSVGElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const eraserRef = useRef<SVGGElement>(null);
  const target = useRef<string | null>(null);
  const [fromPath, setFromPath] = useState(pathname);
  const [timedOut, setTimedOut] = useState(false);
  const failSafe = useRef<number | undefined>(undefined);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== "idle") return;
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }
      target.current = href;
      setFromPath(pathname);
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      setPhase("erasing");
      router.prefetch(href);
    },
    [phase, pathname, router],
  );

  // Phase 2: erase.
  useEffect(() => {
    if (phase !== "erasing") return;
    const path = strokeRef.current;
    const eraser = eraserRef.current;
    if (!path || !eraser) return;
    const len = path.getTotalLength();
    const proxy = { p: 0 };
    gsap.set(overlayRef.current, { opacity: 1 });
    const tween = gsap.to(proxy, {
      p: 1,
      duration: motion.eraseDuration,
      ease: "power1.inOut",
      onUpdate: () => {
        path.style.strokeDashoffset = String(1.01 * (1 - proxy.p));
        const pt = path.getPointAtLength(len * proxy.p);
        eraser.setAttribute(
          "transform",
          `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${-24 + Math.sin(proxy.p * 40) * 6})`,
        );
      },
      onComplete: () => {
        setPhase("covered");
        if (target.current) router.push(target.current, { scroll: true });
        // If navigation never lands (error, same page), reveal anyway.
        failSafe.current = window.setTimeout(() => setTimedOut(true), 2500);
      },
    });
    return () => {
      tween.kill();
    };
  }, [phase, router]);

  // Phase 4: the new page is mounted underneath, lift the overlay.
  const landed = phase === "covered" && (pathname !== fromPath || timedOut);
  useEffect(() => {
    if (!landed) return;
    window.clearTimeout(failSafe.current);
    const tween = gsap.to(overlayRef.current, {
      opacity: 0,
      duration: motion.revealDuration,
      ease: "power1.out",
      onComplete: () => {
        setTimedOut(false);
        setPhase("idle");
      },
    });
    return () => {
      tween.kill();
    };
  }, [landed]);

  const { w, h } = viewport;
  const rows = 4;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= rows; i++) {
    const y = (i / rows) * h;
    pts.push([i % 2 === 0 ? -w * 0.1 : w * 1.1, y]);
  }
  const d = smoothPath(pts);

  return (
    <EraserContext.Provider value={{ navigate }}>
      {children}
      {phase !== "idle" && (
        <svg
          ref={overlayRef}
          aria-hidden="true"
          className="pointer-events-auto fixed inset-0 z-[80]"
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          fill="none"
        >
          <defs>
            {/* Same grid as body::before (tiles centred horizontally) so the
                erased area lines up with the page's own graph paper. */}
            <pattern
              id="eraser-paper"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
              x={((w - 120) / 2) % 120}
            >
              <rect width="120" height="120" fill={colors.paper} />
              <path d="M0 0.5H120M0.5 0V120" stroke="rgb(43 43 43 / 0.05)" />
              <path
                d="M24.5 0V120M48.5 0V120M72.5 0V120M96.5 0V120M0 24.5H120M0 48.5H120M0 72.5H120M0 96.5H120"
                stroke="rgb(43 43 43 / 0.025)"
              />
            </pattern>
          </defs>
          <path
            ref={strokeRef}
            d={d}
            pathLength={1}
            stroke="url(#eraser-paper)"
            strokeWidth={h / rows + 90}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: "1 2", strokeDashoffset: 1.01 }}
          />
          <g ref={eraserRef} transform="translate(-200 -200)">
            <EraserGlyph />
          </g>
        </svg>
      )}
    </EraserContext.Provider>
  );
}

/** A block eraser with a paper sleeve, pencil-drawn. Origin = rubbing edge. */
function EraserGlyph() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round" filter="url(#pencil-grain)">
      <path
        d="M-34 -8 L34 -8 L34 52 L-34 52 Z"
        fill={colors.paperShade}
        stroke={colors.graphite}
        strokeWidth="1.6"
      />
      <path
        d="M-34 14 L34 14 L34 52 L-34 52 Z"
        fill={colors.paper}
        stroke={colors.graphite}
        strokeWidth="1.4"
      />
      <path
        d="M-28 20 L-12 46 M-18 20 L-2 46 M-8 20 L8 46 M2 20 L18 46 M12 20 L28 46"
        stroke={colors.construction}
        strokeWidth="1"
      />
      <path d="M-30 -4 L30 -4" stroke={colors.graphite2} strokeWidth="0.8" />
      <path d="M-34 -8 Q0 -14 34 -8" stroke={colors.graphite} strokeWidth="1" />
    </g>
  );
}

export function useEraser() {
  return useContext(EraserContext);
}

/**
 * Drop-in replacement for next/link that plays the eraser transition for
 * internal navigations. Modifier-clicks, new tabs and hash links behave
 * exactly like a normal link.
 */
export function TransitionLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = useEraser();
  const pathname = usePathname();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    if (
      props.target === "_blank" ||
      href.startsWith("#") ||
      /^https?:/.test(href)
    )
      return;
    if (href === pathname) return;
    e.preventDefault();
    navigate(href);
  };

  return <Link href={href} onClick={handle} {...props} />;
}
