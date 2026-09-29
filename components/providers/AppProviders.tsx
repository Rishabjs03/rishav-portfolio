"use client";

import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { EraserTransitionProvider } from "@/components/sketch/EraserTransition";
import { SmoothScroll } from "./SmoothScroll";

/**
 * Framer Motion is loaded lazily (LazyMotion + `m.*` components keep the
 * initial bundle small) and honours the OS reduced-motion setting.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <EraserTransitionProvider>{children}</EraserTransitionProvider>
        </SmoothScroll>
      </MotionConfig>
    </LazyMotion>
  );
}
