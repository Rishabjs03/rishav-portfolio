import { HandwrittenHeading } from "@/components/sketch/HandwrittenHeading";
import { ScribbleButton } from "@/components/sketch/ScribbleButton";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-start justify-center gap-6 pt-28">
      <p className="text-graphite-2 font-mono text-[11px] tracking-[0.2em] uppercase">
        Sheet 404 · missing
      </p>
      <HandwrittenHeading
        as="h1"
        text="This page was erased"
        immediate
        className="text-5xl sm:text-6xl"
      />
      <p className="text-graphite-2 max-w-md">
        Whatever was drawn here has been rubbed out. The rest of the sketchbook
        is still intact.
      </p>
      <ScribbleButton href="/">Back to the first page</ScribbleButton>
    </div>
  );
}
