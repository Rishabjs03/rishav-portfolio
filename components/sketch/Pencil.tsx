/**
 * The pencil itself, drawn in pencil. Local origin (0,0) is the graphite tip;
 * the body leans up and to the right, the way a right-handed pencil sits.
 * Use <PencilGlyph> inside an <svg> (the hero moves it along strokes), or
 * <PencilIcon> as a standalone element (cursor, loader).
 */
export function PencilGlyph({
  scale = 1,
  className,
}: {
  scale?: number;
  className?: string;
}) {
  return (
    <g className={className} transform={`scale(${scale}) rotate(32)`}>
      {/* soft shadow line the pencil casts on the paper */}
      <path
        d="M4 -2 L10 -118"
        stroke="#B5B5B5"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.28"
      />
      {/* hexagonal body */}
      <path
        d="M-6 -24 L-6 -104 L6 -104 L6 -24 Z"
        fill="#FDFDFB"
        stroke="#2B2B2B"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M1.5 -26 L1.5 -102" stroke="#6B6B6B" strokeWidth="0.8" />
      <path
        d="M3 -30 L5.5 -34 M3 -40 L5.5 -44 M3 -50 L5.5 -54 M3 -60 L5.5 -64 M3 -70 L5.5 -74 M3 -80 L5.5 -84 M3 -90 L5.5 -94"
        stroke="#6B6B6B"
        strokeWidth="0.7"
      />
      {/* sharpened wood cone and graphite point */}
      <path
        d="M-6 -24 L0 0 L6 -24"
        fill="#F4F3EE"
        stroke="#2B2B2B"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M-4 -24 Q-2 -21 0 -24 Q2 -21 4 -24"
        fill="none"
        stroke="#6B6B6B"
        strokeWidth="0.8"
      />
      <path d="M-1.9 -7.5 L0 0 L1.9 -7.5 Z" fill="#2B2B2B" />
      {/* ferrule + eraser */}
      <path
        d="M-6.5 -104 L-6.5 -115 L6.5 -115 L6.5 -104 Z"
        fill="#FDFDFB"
        stroke="#2B2B2B"
        strokeWidth="1.2"
      />
      <path
        d="M-6.5 -108 L6.5 -108 M-6.5 -111.5 L6.5 -111.5"
        stroke="#6B6B6B"
        strokeWidth="0.7"
      />
      <path
        d="M-6 -115 L-6 -122 Q0 -127 6 -122 L6 -115"
        fill="#F4F3EE"
        stroke="#2B2B2B"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Bounds of the rotated glyph at scale 1; the tip is at (0,0). */
export const PENCIL_BOX = { x: -8, y: -110, w: 82, h: 113 };

/**
 * Standalone pencil, `size` px tall. The tip sits near the bottom-left
 * corner, at (tipX, tipY) px from the top-left of the element.
 */
export function pencilTip(size: number) {
  const k = size / PENCIL_BOX.h;
  return {
    width: PENCIL_BOX.w * k,
    tipX: -PENCIL_BOX.x * k,
    tipY: -PENCIL_BOX.y * k,
  };
}

export function PencilIcon({
  size = 44,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const { width } = pencilTip(size);
  return (
    <svg
      aria-hidden="true"
      width={width}
      height={size}
      viewBox={`${PENCIL_BOX.x} ${PENCIL_BOX.y} ${PENCIL_BOX.w} ${PENCIL_BOX.h}`}
      className={className}
      style={{ overflow: "visible" }}
    >
      <PencilGlyph />
    </svg>
  );
}
