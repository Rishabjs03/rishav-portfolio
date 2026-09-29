import { Suspense } from "react";
import { getPullRequests } from "@/lib/github";
import { SpiralLoader } from "@/components/sketch/SpiralLoader";
import { PullRequestBoard } from "./PullRequestBoard";
import { SectionHeader } from "./SectionHeader";

/** Server component: fetches (cached) PRs, then hands them to the board. */
async function PullRequests() {
  const data = await getPullRequests();
  return <PullRequestBoard data={data} />;
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
      <Suspense fallback={<SpiralLoader label="fetching pull requests…" />}>
        <PullRequests />
      </Suspense>
    </section>
  );
}
