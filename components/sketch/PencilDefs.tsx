/**
 * Shared SVG <defs>: rendered once in the root layout and referenced by id
 * from every sketch on the page (url(#pencil), url(#hatch) …).
 *
 * Filters
 *   #pencil-grain   Graphite grain only. High-frequency noise becomes an
 *                   alpha mask, so strokes look speckled like soft lead on
 *                   paper. Doesn't move pixels, so it's safe on thin lines.
 *   #pencil         Grain + a gentle displacement (low-frequency noise pushes
 *                   pixels ±1px) so even Rough.js lines lose their vector
 *                   perfection. Used on illustrations.
 *   #pencil-boil-N  Same as #pencil with a different noise seed per frame.
 *                   <Boil> cycles through them at ~8fps: the "line boil" of
 *                   hand-drawn animation. Add frames or change `scale` to
 *                   make the boil stronger.
 *
 * Patterns: hatching for fills. `*-icon` variants are scaled for 24-unit icon
 * viewBoxes (react-icons), the others for pixel-sized drawings.
 */
const BOIL_SEEDS = [2, 7, 13];

function PencilFilter({
  id,
  seed,
  scale = 1.6,
}: {
  id: string;
  seed: number;
  scale?: number;
}) {
  return (
    <filter
      id={id}
      x="-6%"
      y="-6%"
      width="112%"
      height="112%"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.035"
        numOctaves="2"
        seed={seed}
        result="wobble"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="wobble"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
        result="shifted"
      />
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.95"
        numOctaves="1"
        seed={seed + 40}
        result="grain"
      />
      <feColorMatrix
        in="grain"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.62"
        result="grainMask"
      />
      <feComposite in="shifted" in2="grainMask" operator="in" />
    </filter>
  );
}

export function PencilDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter
          id="pencil-grain"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.95"
            numOctaves="1"
            seed="4"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.55"
            result="grainMask"
          />
          <feComposite in="SourceGraphic" in2="grainMask" operator="in" />
        </filter>
        <PencilFilter id="pencil" seed={2} />
        {BOIL_SEEDS.map((seed, i) => (
          <PencilFilter
            key={seed}
            id={`pencil-boil-${i}`}
            seed={seed}
            scale={2.1}
          />
        ))}

        <pattern
          id="hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-40)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="#6B6B6B"
            strokeWidth="0.8"
          />
        </pattern>
        <pattern
          id="crosshatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-40)"
        >
          <path d="M0 0V6M0 0H6" stroke="#6B6B6B" strokeWidth="0.7" />
        </pattern>
        <pattern
          id="hatch-icon"
          width="1.6"
          height="1.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-40)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="1.6"
            stroke="#2B2B2B"
            strokeWidth="0.35"
          />
        </pattern>
        <pattern
          id="crosshatch-icon"
          width="1.7"
          height="1.7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-40)"
        >
          <path d="M0 0V1.7M0 0H1.7" stroke="#2B2B2B" strokeWidth="0.32" />
        </pattern>
      </defs>
    </svg>
  );
}

export const BOIL_FRAMES = BOIL_SEEDS.length;
