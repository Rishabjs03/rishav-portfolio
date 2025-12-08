"use client";

import React, { useState } from "react";
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiNextdotjs,
  SiPrisma,
  SiPostgresql,
  SiPython,
  SiExpress,
  SiMongodb,
  SiHtml5,
  SiCss3,
  SiTailwindcss,
  SiVercel,
} from "react-icons/si";
import { FaDatabase, FaLink, FaAws, FaCode } from "react-icons/fa";

const skills = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "React", icon: SiReact },
  { name: "TypeScript", icon: SiTypescript },
  { name: "JavaScript", icon: SiJavascript },
  { name: "Python", icon: SiPython },
  { name: "LangChain", icon: FaLink },
  { name: "AI SDK", icon: SiVercel },
  { name: "HTML5", icon: SiHtml5 },
  { name: "CSS3", icon: SiCss3 },
  { name: "Tailwind", icon: SiTailwindcss },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Express", icon: SiExpress },
  { name: "MongoDB", icon: SiMongodb },
  { name: "Postgres", icon: SiPostgresql },
  { name: "Prisma", icon: SiPrisma },
];

export default function Skills() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <div className="relative mt-4 w-full">
      <div className="flex flex-col items-start space-y-3">
        <h1 className="font-custom text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
          <span className="link--elara">Skills</span>
        </h1>

        <p className="font-custom2 mb-6 max-w-lg text-sm tracking-tight text-neutral-600 md:text-base dark:text-neutral-400">
          I love working with these technologies to build functional
          applications.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="group relative cursor-pointer"
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <skill.icon className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />

              {hoveredSkill === skill.name && (
                <div className="absolute -top-10 left-1/2 z-20 -translate-x-1/2">
                  <div className="relative rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                    {skill.name}

                    {/* Arrow */}
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
