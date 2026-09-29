import { featuredProjects, projects } from "@/lib/content/projects";
import { Annotation } from "@/components/sketch/Annotation";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";
import { ProjectSheet } from "./ProjectSheet";
import { SectionHeader } from "./SectionHeader";

export function FeaturedProjects() {
  return (
    <section aria-labelledby="projects-title" className="py-20">
      <SectionHeader
        id="projects-title"
        sheet="Sheet 01 · Featured projects"
        title="Featured Projects"
      >
        Recent drawings from the sketchbook. Every sheet is something I
        designed, built and shipped.
      </SectionHeader>
      <div className="space-y-16">
        {featuredProjects.map((p, i) => (
          <ProjectSheet
            key={p.title}
            project={p}
            index={i}
            total={featuredProjects.length}
          />
        ))}
      </div>
      <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
        <ScribbleButton href="/projects" variant="arrow" size="lg">
          View all projects
        </ScribbleButton>
        <Annotation
          text={`${projects.length - featuredProjects.length} more sheets in here`}
          direction="left"
          color="blue"
          delay={0.5}
          className="hidden sm:inline-flex"
        />
      </div>
    </section>
  );
}
