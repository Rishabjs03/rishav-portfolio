import type { Project } from "@/lib/content/projects";
import { BlueprintCard } from "@/components/sketch/BlueprintCard";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";
import { TapedMedia } from "@/components/sketch/TapedMedia";
import { TechStickers } from "@/components/sketch/TechSticker";

/** One project, laid out as an architectural drawing sheet. */
export function ProjectSheet({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const sheet = `A-${String(index + 1).padStart(2, "0")}`;
  const headingId = `project-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const flip = index % 2 === 1;

  return (
    <BlueprintCard
      title={project.title}
      sheet={`${sheet} / ${String(total).padStart(2, "0")}`}
      date={project.date}
      headingId={headingId}
    >
      <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10">
        <TapedMedia
          media={project.media}
          alt={`${project.title} ${project.media.type === "video" ? "demo video" : "screenshot"}`}
          caption={`fig. ${index + 1}: ${project.title}`}
          className={flip ? "md:order-2" : undefined}
        />
        <div>
          <h3
            id={headingId}
            className="font-hand text-graphite text-4xl leading-none font-bold"
          >
            {project.title}
          </h3>
          <p className="text-graphite mt-4 text-[15px] leading-relaxed">
            {project.description}
          </p>
          <p className="text-graphite-2 mt-6 mb-2.5 font-mono text-[10px] tracking-[0.2em] uppercase">
            Materials
          </p>
          <TechStickers items={project.tech} />
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
            <ScribbleButton
              href={project.github}
              variant="link"
              external
              ariaLabel={`source: ${project.title} on GitHub`}
            >
              source ↗
            </ScribbleButton>
            {project.live && (
              <ScribbleButton
                href={project.live}
                variant="link"
                external
                ariaLabel={`live site: ${project.title}`}
              >
                live site ↗
              </ScribbleButton>
            )}
            {project.demo && (
              <ScribbleButton
                href={project.demo.href}
                variant="link"
                external
                ariaLabel={`${project.demo.label.replace(/\s*↗$/, "")}: ${project.title} video`}
              >
                {project.demo.label}
              </ScribbleButton>
            )}
          </div>
        </div>
      </div>
    </BlueprintCard>
  );
}
