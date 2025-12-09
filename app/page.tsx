"use client";

import { useState } from "react";

import Container from "@/components/containers";

import Projects from "@/components/projects";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Timeline from "@/components/timeline";
import GithubGraph from "@/components/githubgraph";
import Skills from "@/components/skills";
import GetInTouch from "@/components/get-in-touch";

export default function Home() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const socials = [
    {
      name: "GitHub",
      icon: Github,
      action: () => window.open("https://github.com/Rishabjs03", "_blank"),
    },
    {
      name: "X",
      icon: Twitter,
      action: () => window.open("https://x.com/Yrishavjs", "_blank"),
    },
    {
      name: "Email",
      icon: Mail,
      action: () => (window.location.href = "mailto:rishabagarwaljs@gmail.com"),
    },
  ];

  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden font-sans">
      <Container className="mx-auto min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10">
        {/* RIGHT BORDER */}
        <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12">
          {" "}
        </div>

        {/* LEFT BORDER */}
        <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        {/* ---------------------------------------- */}
        {/* HEADING + SOCIALS (FIXED SAME LINE) */}
        {/* ---------------------------------------- */}

        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h1 className="font-custom text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
            <span className="link--elara">Rishav Agarwal</span>
          </h1>

          <div className="flex flex-wrap gap-4 sm:justify-end">
            {socials.map((social) => (
              <div
                key={social.name}
                className="group relative cursor-pointer"
                onMouseEnter={() => setHoveredSocial(social.name)}
                onMouseLeave={() => setHoveredSocial(null)}
                onClick={social.action}
              >
                <social.icon
                  size={20}
                  className="text-neutral-900 opacity-70 transition hover:opacity-100 dark:text-neutral-50"
                />
                {hoveredSocial === social.name && (
                  <div className="absolute top-8 left-1/2 z-20 -translate-x-1/2">
                    <div className="relative rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                      {social.name}
                      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-t border-l border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------- */}
        {/* SUBTEXT */}
        {/* ---------------------------------------- */}

        <div className="text-secondary font-custom2 text-s mt-1">
          <p>
            <span className="font-custom font-semibold text-neutral-950 dark:text-neutral-100">
              ⚀{" "}
            </span>
            <span className="text-neutral-700 dark:text-neutral-300">
              Full-Stack Developer & AI Engineer — Building intelligent web
              experiences.
            </span>
          </p>

          <p>
            <span className="font-semibold text-neutral-950 dark:text-neutral-100">
              ⚁{" "}
            </span>
            <span className="text-neutral-700 dark:text-neutral-300">
              Specializing in Next.js, TypeScript, and LangChain for AI-powered
              apps.
            </span>
          </p>

          <p>
            <span className="font-semibold text-neutral-950 dark:text-neutral-100">
              ⚂{" "}
            </span>
            <span className="text-neutral-700 dark:text-neutral-300">
              Creating next-gen digital products that think, adapt, and deliver
              impact.
            </span>
          </p>
        </div>

        <div className="absolute right-6 my-3 hidden h-px w-[53rem] bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

        <Projects />

        <br />
        <div className="absolute right-6 hidden h-px w-[53rem] bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

        <Timeline></Timeline>

        <GithubGraph></GithubGraph>

        <br></br>
        <br></br>
        <br></br>
        <div className="absolute right-6 hidden h-px w-[53rem] bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

        <Skills />
        <br></br>
        <div className="absolute right-6 hidden h-px w-[53rem] bg-(--pattern-fg) opacity-90 md:block dark:opacity-15"></div>

        <GetInTouch />
      </Container>
    </div>
  );
}
