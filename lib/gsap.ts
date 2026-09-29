"use client";

/**
 * Single place where GSAP plugins are registered. Import `gsap` and
 * `ScrollTrigger` from here, never from "gsap" directly, so registration
 * always happens before use.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
