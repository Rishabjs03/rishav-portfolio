import { site } from "@/lib/content/site";
import { Annotation } from "@/components/sketch/Annotation";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";
import { SectionHeader } from "./SectionHeader";

export function Contact() {
  return (
    <section aria-labelledby="contact-title" className="py-20">
      <SectionHeader
        id="contact-title"
        sheet="Sheet 05 · Commission"
        title="Get in touch"
      >
        Hi there! I&apos;m currently open to contribute to develop your dream to
        real world existence!
      </SectionHeader>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
        <ScribbleButton href={site.bookCall} external size="lg">
          Book a call
        </ScribbleButton>
        <Annotation
          text="free · 30 minutes · bring the idea"
          direction="left"
          color="red"
          delay={0.5}
        />
      </div>
    </section>
  );
}
