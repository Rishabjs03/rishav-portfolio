import type { ReactNode } from "react";
import { HandwrittenHeading } from "@/components/sketch/HandwrittenHeading";
import { cn } from "@/lib/utils";

/** Sheet-number kicker, handwritten title, and an optional subheading. */
export function SectionHeader({
  id,
  sheet,
  title,
  children,
  className,
}: {
  id: string;
  sheet: string;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-12", className)}>
      <HandwrittenHeading
        id={id}
        text={title}
        kicker={sheet}
        className="text-5xl sm:text-6xl"
      />
      {children && (
        <p className="text-graphite-2 mt-5 max-w-xl text-[15px] leading-relaxed">
          {children}
        </p>
      )}
    </header>
  );
}
