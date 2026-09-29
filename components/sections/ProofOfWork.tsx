import { Suspense } from "react";
import { getContributions, getPullRequests } from "@/lib/github";
import { site } from "@/lib/content/site";
import { SpiralLoader } from "@/components/sketch/SpiralLoader";
import { ContributionGraph } from "./ContributionGraph";
import { PullRequestBoard } from "./PullRequestBoard";
import { SectionHeader } from "./SectionHeader";

/** Server component: fetches (cached) PRs, then hands them to the board. */
async function PullRequests() {
  const data = await getPullRequests();
  return <PullRequestBoard data={data} />;
}

/**
 * Server component: fetches the (cached) contribution calendar and sends the
 * client only the numbers it needs (a start date plus daily counts/levels),
 * so the flight payload stays ~2 KB for a whole year.
 */
async function Contributions() {
  const cal = await getContributions();
  if (!cal || cal.days.length === 0) {
    return (
      <p className="font-arch text-graphite-2 text-sm">
        The contribution graph is taking a break.{" "}
        <a
          className="text-accent-blue underline underline-offset-4"
          href={site.links.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          See it on GitHub ↗
        </a>
      </p>
    );
  }
  const days = [...cal.days].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <ContributionGraph
      calendar={{
        total: cal.total,
        start: days[0].date,
        counts: days.map((d) => d.count),
        levels: days.map((d) => d.level),
      }}
    />
  );
}

export function ProofOfWork() {
  return (
    <section aria-labelledby="pow-title" className="py-20">
      <SectionHeader
        id="pow-title"
        sheet="Sheet 03 · Site log"
        title="Proof Of Work"
      >
        I love to create things which solve real world problems
      </SectionHeader>
      <div className="mb-16">
        <Suspense fallback={<div className="h-[150px]" />}>
          <Contributions />
        </Suspense>
      </div>
      <Suspense fallback={<SpiralLoader label="fetching pull requests…" />}>
        <PullRequests />
      </Suspense>
    </section>
  );
}
