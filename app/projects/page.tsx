"use client";

import Container from "@/components/containers";
import Projects from "@/components/projects";

export default function Home() {
  return (
    <Container className="mx-auto min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10">
      {/* RIGHT BORDER */}
      <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

      {/* LEFT BORDER */}
      <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

      <h1 className="font-custom text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        <span className="link--elara">Projects</span>
      </h1>

      <p className="font-custom2 mt-4 max-w-lg text-sm tracking-tight text-neutral-600 md:text-base dark:text-neutral-400">
        Hi there! I’m passionate about creating intelligent digital experiences
        - blending AI, React, and automation to craft clean, efficient, and
        scalable web systems.
      </p>

      <div className="absolute right-6 my-3 hidden h-px w-212 bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

      <Projects showAll={true}></Projects>
    </Container>
  );
}
