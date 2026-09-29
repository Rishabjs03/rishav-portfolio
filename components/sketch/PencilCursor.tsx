"use client";

import { useEffect, useRef, useState } from "react";
import { colors, motion } from "@/lib/design-tokens";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { PencilIcon, pencilTip } from "./Pencil";
import { ScribbleRing, type ScribbleRingHandle } from "./ScribbleRing";

const SIZE = 40;
const INTERACTIVE =
  'a, button, [role="button"], [role="tab"], summary, label, [data-cursor]';

/**
 * The cursor is a pencil; its graphite tip is the hotspot.
 *
 * Position is eased toward the pointer every frame (lerp: motion.cursorLerp)
 * and applied as a transform only. Over a link or button the pencil tilts,
 * and small targets get a loop scribbled round them (<ScribbleRing>).
 * Elements with their own hover scribble (`data-scribble`) and big targets
 * like cards only get the tilt.
 *
 * Only on devices with a real mouse, and never with reduced motion: touch
 * users and reduced-motion users keep the system cursor.
 */
export function PencilCursor() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reduced = usePrefersReducedMotion();
  const enabled = finePointer && !reduced;

  const el = useRef<HTMLDivElement>(null);
  const ring = useRef<ScribbleRingHandle>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("pencil-cursor");

    const { tipX, tipY } = pencilTip(SIZE);
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let current: Element | null = null;
    let seen = false;

    const render = () => {
      pos.x += (target.x - pos.x) * motion.cursorLerp;
      pos.y += (target.y - pos.y) * motion.cursorLerp;
      if (el.current)
        el.current.style.transform = `translate3d(${pos.x - tipX}px, ${pos.y - tipY}px, 0)`;
      raf =
        Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.1
          ? requestAnimationFrame(render)
          : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        seen = true;
        pos.x = target.x;
        pos.y = target.y;
        setVisible(true);
      }
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onOver = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (hit === current) return;
      current = hit;
      setHovering(!!hit);
      if (!hit) return ring.current?.hide();
      const r = hit.getBoundingClientRect();
      const small = r.width <= 200 && r.height <= 90;
      if (small && !hit.hasAttribute("data-scribble")) ring.current?.show(hit);
      else ring.current?.hide();
    };

    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        setVisible(false);
        seen = false;
        ring.current?.hide();
        current = null;
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("pencil-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  const { tipX, tipY } = pencilTip(SIZE);
  return (
    <>
      <ScribbleRing ref={ring} color={colors.graphite} zIndex={95} />
      <div
        ref={el}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[100]"
        style={{ opacity: visible ? 1 : 0, transition: "opacity .2s" }}
      >
        <div
          style={{
            transformOrigin: `${tipX}px ${tipY}px`,
            transform: `rotate(${hovering ? -14 : 0}deg) scale(${pressed ? 0.92 : 1})`,
            transition: "transform .25s cubic-bezier(.3,1.4,.5,1)",
          }}
        >
          <PencilIcon size={SIZE} />
        </div>
      </div>
    </>
  );
}
