import type { Metadata } from "next";
import { projects } from "@/lib/content/projects";
import { ProjectSheet } from "@/components/sections/ProjectSheet";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";

export const metadata: Metadata = {
  title: "Projects | Rishav Agarwal",
  description:
    "Every project from the sketchbook: AI tools, developer extensions and full-stack apps.",
};

export default function ProjectsPage() {
  return (
    <div className="pt-28 pb-10 md:pt-36">
      <ScribbleButton href="/" variant="link" size="sm" className="mb-8">
        ← back to the sketchbook
      </ScribbleButton>
      <SectionHeader
        id="all-projects"
        sheet={`Drawing set · ${projects.length} sheets`}
        title="All Projects"
      >
        Hi there! I&apos;m passionate about creating intelligent digital
        experiences, blending AI, React, and automation to craft clean,
        efficient, and scalable web systems.
      </SectionHeader>
      <div className="space-y-16">
        {projects.map((p, i) => (
          <ProjectSheet
            key={p.title}
            project={p}
            index={i}
            total={projects.length}
          />
        ))}
      </div>
    </div>
  );
}
