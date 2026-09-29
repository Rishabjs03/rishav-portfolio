import { colors } from "@/lib/design-tokens";
import { spiral } from "@/lib/sketch";
import { PencilIcon, pencilTip } from "./Pencil";

const SIZE = 120;
const d = spiral(SIZE / 2, SIZE / 2, 3.4, 7.5, 5);
const PENCIL = 46;

/**
 * Loading state: a pencil sketching a spiral, forever. Pure CSS, so it
 * works as a server-rendered Suspense fallback before any JS arrives.
 * The stroke draws with stroke-dashoffset while the pencil rides the same
 * path with CSS `offset-path`, both on the same 2.6s linear loop.
 */
export function SpiralLoader({
  label = "sharpening pencils…",
}: {
  label?: string;
}) {
  const { tipX, tipY } = pencilTip(PENCIL);
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-10">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          aria-hidden="true"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          fill="none"
          className="overflow-visible"
        >
          <path
            d={d}
            pathLength={1}
            className="spiral-path"
            stroke={colors.graphite}
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#pencil-grain)"
          />
        </svg>
        <div
          aria-hidden="true"
          className="spiral-pencil absolute top-0 left-0"
          style={{
            offsetPath: `path("${d}")`,
            offsetAnchor: `${tipX}px ${tipY}px`,
          }}
        >
          <PencilIcon size={PENCIL} />
        </div>
      </div>
      <p className="font-arch text-graphite-2 text-sm">{label}</p>
    </div>
  );
}
