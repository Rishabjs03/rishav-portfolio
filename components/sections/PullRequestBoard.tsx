"use client";

import { m } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { colors } from "@/lib/design-tokens";
import type { PRState, PullRequest, PullRequestBuckets } from "@/lib/github";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { circle, hatchRect, polyline, prng, seedFrom } from "@/lib/sketch";
import { site } from "@/lib/content/site";
import { Annotation } from "@/components/sketch/Annotation";
import { MeasuredScribble } from "@/components/sketch/MeasuredScribble";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";
import { SketchBorder } from "@/components/sketch/SketchBorder";

const TABS: Array<{ id: PRState; label: string }> = [
  { id: "merged", label: "Merged" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
];

const STAMP: Record<PRState, string> = {
  merged: colors.accentBlue,
  open: colors.graphite,
  closed: colors.accentRed,
};

const INITIAL = 4;
const TAB_W = 138;
const TAB_H = 42;
const SWAP_AT_MS = 240;

const tabShape = (seed: number) =>
  polyline(
    [
      [2, TAB_H + 2],
      [13, 4],
      [TAB_W - 13, 3],
      [TAB_W - 2, TAB_H + 2],
    ],
    { seed, roughness: 0.8 },
  );
const tabHatch = (seed: number) =>
  hatchRect(12, 7, TAB_W - 24, TAB_H - 8, { gap: 5, seed, angle: -50 });

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Hand-drawn folder tab. Inactive tabs are hatched, as if they sit behind. */
function FolderTab({
  tab,
  active,
  count,
  onSelect,
  onKeyDown,
  index,
  buttonRef,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  count: number;
  onSelect: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  index: number;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const seed = 900 + index * 17;
  const shape = useMemo(() => tabShape(seed), [seed]);
  const hatch = useMemo(() => tabHatch(seed + 3), [seed]);
  return (
    <button
      ref={buttonRef}
      id={`tab-${tab.id}`}
      role="tab"
      type="button"
      aria-selected={active}
      aria-controls="pr-panel"
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      data-scribble="none"
      className={`group font-arch relative -mr-3 flex shrink-0 items-center justify-center text-[15px] transition-transform duration-200 ${active ? "text-graphite z-20" : "text-graphite-2 hover:text-graphite z-10 translate-y-1 hover:translate-y-0"}`}
      style={{ width: TAB_W, height: TAB_H }}
    >
      <svg
        aria-hidden="true"
        width={TAB_W}
        height={TAB_H + 4}
        viewBox={`0 0 ${TAB_W} ${TAB_H + 4}`}
        className="absolute top-0 left-0 overflow-visible"
        fill="none"
      >
        {/* Paper fill hides the folder's top line under the active tab. */}
        <path
          d={`M3 ${TAB_H + 4}L13 4H${TAB_W - 13}L${TAB_W - 3} ${TAB_H + 4}Z`}
          fill={colors.paper}
        />
        {!active && (
          <path d={hatch} stroke={colors.construction} strokeWidth={0.8} />
        )}
        <path
          d={shape}
          stroke={colors.graphite}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pencil-grain)"
        />
      </svg>
      <span className="relative">
        {tab.label}{" "}
        <span className="text-graphite-2 font-mono text-[11px]">({count})</span>
      </span>
    </button>
  );
}

/** A thumbtack, pencil-shaded. */
function Pin({ seed }: { seed: number }) {
  const head = useMemo(
    () => circle(10, 9, 13, { seed, roughness: 0.6 }).stroke,
    [seed],
  );
  const shade = useMemo(
    () => hatchRect(4, 3, 12, 12, { gap: 2.2, seed: seed + 1, angle: -35 }),
    [seed],
  );
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="24"
      viewBox="0 0 20 24"
      className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 overflow-visible"
      fill="none"
    >
      <path
        d="M12 16L16 23"
        stroke={colors.graphite2}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="9" r="6.5" fill={colors.paper} />
      <clipPath id={`pin-${seed}`}>
        <circle cx="10" cy="9" r="6.2" />
      </clipPath>
      <path
        d={shade}
        stroke={colors.graphite}
        strokeWidth="0.6"
        clipPath={`url(#pin-${seed})`}
      />
      <path
        d={head}
        stroke={colors.graphite}
        strokeWidth="1.2"
        filter="url(#pencil-grain)"
      />
    </svg>
  );
}

/** A pull request on a ruled index card, pinned to the page. */
function IndexCard({ pr, index }: { pr: PullRequest; index: number }) {
  const seed = seedFrom(pr.url);
  const rotate = (prng(seed)() - 0.5) * 3;
  const date = pr.mergedAt ?? pr.closedAt ?? pr.createdAt;
  const verb =
    pr.state === "merged"
      ? "merged"
      : pr.state === "closed"
        ? "closed"
        : "opened";
  return (
    <m.li
      initial={{ opacity: 0, y: 10, rotate: rotate - 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.3, 1.2, 0.5, 1],
      }}
      className="list-none"
    >
      <a
        href={pr.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block h-full transition-transform duration-300 ease-out hover:-translate-y-1 hover:rotate-0"
      >
        <Pin seed={seed} />
        <SketchBorder
          seed={seed}
          redrawOnHover
          roughness={0.7}
          strokeWidth={1}
          className="h-full bg-white px-4 pt-7 pb-4"
          style={{
            backgroundImage: `linear-gradient(transparent 29px, rgb(192 57 43 / 0.35) 29px, rgb(192 57 43 / 0.35) 30px, transparent 30px), repeating-linear-gradient(transparent 0 23px, rgb(58 91 160 / 0.13) 23px 24px)`,
            backgroundPosition: "0 0, 0 30px",
          }}
        >
          <p className="text-graphite-2 truncate font-mono text-[11px]">
            {pr.repo}
          </p>
          <h3 className="text-graphite group-hover:decoration-graphite-2 mt-2 line-clamp-2 text-[14.5px] leading-6 font-medium group-hover:underline group-hover:underline-offset-4">
            {pr.title}
          </h3>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-arch text-graphite-2 text-xs">
              #{pr.number} · {verb}{" "}
              <time dateTime={date}>{fmt.format(new Date(date))}</time>
            </p>
            <span
              className="-rotate-6 border-[1.5px] px-1.5 py-px font-mono text-[9.5px] tracking-[0.18em] uppercase"
              style={{
                color: STAMP[pr.state],
                borderColor: STAMP[pr.state],
                borderRadius: "3px 6px 2px 5px",
              }}
            >
              {pr.draft ? "draft" : pr.state}
            </span>
          </div>
        </SketchBorder>
      </a>
    </m.li>
  );
}

/**
 * Proof of work: PRs grouped in a hand-drawn folder with three tabs.
 *
 * Switching tabs plays a quick scribble transition: a zig-zag is scrawled
 * over the current cards (~0.25s), the cards are swapped underneath at
 * SWAP_AT_MS, then the scribble fades as the new index cards are pinned in
 * one after another. Arrow keys move between tabs (WAI-ARIA tabs pattern).
 */
export function PullRequestBoard({ data }: { data: PullRequestBuckets }) {
  const [active, setActive] = useState<PRState>("merged");
  const [shown, setShown] = useState<PRState>("merged");
  const [expanded, setExpanded] = useState(false);
  const [scribble, setScribble] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduced = usePrefersReducedMotion();

  const select = (id: PRState) => {
    if (id === active) return;
    setActive(id);
    window.clearTimeout(timer.current);
    if (reduced) {
      setShown(id);
      setExpanded(false);
      return;
    }
    setScribble((n) => n + 1);
    timer.current = window.setTimeout(() => {
      setShown(id);
      setExpanded(false);
    }, SWAP_AT_MS);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    select(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const prs = data[shown];
  const visible = expanded ? prs : prs.slice(0, INITIAL);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div
          role="tablist"
          aria-label="Pull requests by status"
          className="relative z-10 -mb-[3px] flex pl-3"
        >
          {TABS.map((t, i) => (
            <FolderTab
              key={t.id}
              tab={t}
              index={i}
              active={active === t.id}
              count={data.totals[t.id]}
              onSelect={() => select(t.id)}
              onKeyDown={onKeyDown}
              buttonRef={(el) => {
                tabRefs.current[i] = el;
              }}
            />
          ))}
        </div>
        <Annotation
          text="live from GitHub"
          direction="down-left"
          color="blue"
          delay={0.4}
          className="mb-6 hidden md:inline-flex"
        />
      </div>

      <SketchBorder
        seed={4242}
        strokeWidth={1.3}
        className="px-4 pt-9 pb-8 sm:px-7"
      >
        <div
          id="pr-panel"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          aria-live="polite"
          className="relative"
        >
          {data.error && prs.length === 0 ? (
            <p className="font-arch text-graphite-2 py-8 text-center">
              GitHub didn&apos;t pick up the phone just now.{" "}
              <a
                className="text-accent-blue underline underline-offset-4"
                href={`https://github.com/search?q=author%3A${site.githubUser}+type%3Apr&type=pullrequests`}
                target="_blank"
                rel="noopener noreferrer"
              >
                See them on GitHub ↗
              </a>
            </p>
          ) : prs.length === 0 ? (
            <p className="font-arch text-graphite-2 py-8 text-center">
              Nothing here right now. The drawing board is clean.
            </p>
          ) : (
            <ul key={shown} className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
              {visible.map((pr, i) => (
                <IndexCard key={pr.id} pr={pr} index={i} />
              ))}
            </ul>
          )}

          {scribble > 0 && !reduced && (
            <MeasuredScribble
              key={scribble}
              kind="zigzag"
              seed={scribble + 3}
              className="inset-0"
              stroke={colors.graphite}
              strokeWidth={2.2}
              style={
                {
                  strokeDasharray: "1 2",
                  strokeDashoffset: 1.01,
                  animation: "scribble-cross .6s ease-in-out forwards",
                } as CSSProperties
              }
            />
          )}
        </div>

        {prs.length > INITIAL && (
          <div className="mt-8 flex justify-center">
            <ScribbleButton
              onClick={() => setExpanded((v) => !v)}
              ariaExpanded={expanded}
              size="sm"
            >
              {expanded ? "fold them back up" : `show all ${prs.length}`}
            </ScribbleButton>
          </div>
        )}
      </SketchBorder>
    </div>
  );
}
