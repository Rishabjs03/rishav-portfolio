import Image from "next/image";
import { colors } from "@/lib/design-tokens";
import { site } from "@/lib/content/site";
import { circle, hatchRect } from "@/lib/sketch";
import { TransitionLink } from "@/components/sketch/EraserTransition";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";
import { SketchLine } from "@/components/sketch/SketchLine";

const ring = circle(22, 22, 42, { seed: 12, roughness: 0.9 }).stroke;
const ring2 = circle(22, 22, 45, {
  seed: 19,
  roughness: 1.1,
  disableMultiStroke: true,
}).stroke;
const shade = hatchRect(30, 4, 16, 36, { gap: 3, seed: 21, angle: -30 });

/**
 * The avatar as a pencil portrait: desaturated, contrast pushed so it reads
 * like graphite, inside a doubled freehand circle with hatching on the
 * shadow side.
 */
function SketchAvatar() {
  return (
    <span className="relative block h-11 w-11">
      <Image
        src={site.avatar}
        alt="Rishav Agarwal"
        width={80}
        height={80}
        priority
        className="absolute inset-[4px] h-9 w-9 rounded-full object-cover contrast-[1.25] grayscale"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="absolute inset-0 overflow-visible"
        fill="none"
      >
        <defs>
          <clipPath id="avatar-clip">
            <circle cx="22" cy="22" r="18" />
          </clipPath>
        </defs>
        <path
          d={shade}
          stroke={colors.graphite2}
          strokeWidth="0.6"
          opacity="0.55"
          clipPath="url(#avatar-clip)"
        />
        <g filter="url(#pencil-grain)" strokeLinecap="round">
          <path d={ring} stroke={colors.graphite} strokeWidth="1.3" />
          <path d={ring2} stroke={colors.graphite2} strokeWidth="0.8" />
        </g>
      </svg>
    </span>
  );
}

export function Navbar() {
  return (
    // Overlays the top of the page and scrolls away with it (not sticky).
    // The small top padding leaves room for the mobile progress ruler.
    <header className="absolute inset-x-0 top-0 z-50 pt-2 xl:pt-0">
      <nav
        aria-label="Main"
        className="max-w-page mx-auto flex h-[60px] items-center justify-between px-5 sm:px-8"
      >
        <TransitionLink
          href="/"
          aria-label="Rishav Agarwal, home"
          className="group flex items-center gap-3 rounded-full"
        >
          <SketchAvatar />
          <span className="font-hand text-graphite text-2xl leading-none font-bold transition-transform duration-300 group-hover:-rotate-2">
            Rishav
          </span>
        </TransitionLink>
        <ul className="flex items-center gap-5 sm:gap-7">
          <li>
            <ScribbleButton href="/projects" variant="link" size="md">
              Projects
            </ScribbleButton>
          </li>
          <li>
            <ScribbleButton
              href={site.bookCall}
              variant="link"
              size="md"
              external
            >
              Contact
            </ScribbleButton>
          </li>
        </ul>
      </nav>
      <div className="max-w-page mx-auto px-3">
        <SketchLine
          seed={77}
          stroke={colors.graphite2}
          immediate
          duration={1.2}
        />
      </div>
    </header>
  );
}
