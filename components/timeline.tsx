import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SiNextdotjs,
  SiTypescript,
  SiReact,
  SiThreedotjs,
  SiPrisma,
  SiCloudflare,
  SiLangchain,
  SiNodedotjs,
} from "react-icons/si";

type TechKey =
  | "next"
  | "ts"
  | "react"
  | "three"
  | "prisma"
  | "cloud"
  | "langchain"
  | "node";

const iconMap: Record<TechKey, any> = {
  next: SiNextdotjs,
  ts: SiTypescript,
  react: SiReact,
  three: SiThreedotjs,
  prisma: SiPrisma,
  cloud: SiCloudflare,
  langchain: SiLangchain,
  node: SiNodedotjs,
};

const techNames: Record<TechKey, string> = {
  next: "Next.js",
  ts: "TypeScript",
  react: "React",
  three: "Three.js",
  prisma: "Prisma",
  cloud: "Cloudflare",
  langchain: "LangChain",
  node: "Node.js",
};

type Data = {
  title: string;
  href?: string;
  content: {
    title: string;
    description: string;
    src: string;
    href: string;
    tech?: TechKey[];
  }[];
};

export const Timeline = () => {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const data: Data[] = [
    {
      title: "AskGuru.ai",
      href: "https://askguru-six.vercel.app/",
      content: [
        {
          title: "AI & UI/UX Developer | Oct 2025 — Nov 2025",
          description: `
            Contributed to building the intelligent AI chatbot architecture for AskGuru’s platform
            Led the design and implementation of the complete UI/UX for the entire web interface
            Worked across both AI workflow and front-end systems ensuring a cohesive user experience
            Collaborated on refining conversational logic, responsiveness, and brand consistency
          `,
          src: "/askguru.png",
          href: "https://askguru-six.vercel.app/",
          tech: ["next", "ts", "react", "node"],
        },
      ],
    },
  ];

  return (
    <div>
      <h1 className="font-custom mt-2 pb-2 text-3xl font-bold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50">
        <span className="link--elara">Experiences</span>
      </h1>

      <div className="pl-6">
        {data.map((year, idx) => (
          <div key={year.title} className="relative">
            {year.href ? (
              <Link
                href={year.href}
                target="_blank"
                className="font-custom py-1 text-lg font-semibold tracking-wide text-neutral-900 transition-colors hover:text-neutral-700 dark:text-neutral-50 dark:hover:text-neutral-200"
              >
                <div className="absolute right-[-56] h-px w-212 border border-dashed bg-(--pattern-fg) opacity-15 dark:opacity-15"></div>

                <div className="py-3">{year.title}</div>
              </Link>
            ) : (
              <p className="font-custom mt-2 py-1 text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-50">
                {year.title}
              </p>
            )}

            {year.content.map((item, idx) => (
              <div
                key={item.title}
                className="font-custom2 md:text-s mt-3 flex flex-col gap-4 text-sm text-neutral-700 md:flex-row md:items-center md:justify-between dark:text-neutral-300"
              >
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-50">
                    {item.title}
                  </h3>
                  <ul className="list-disc py-5 pl-6">
                    {item.description
                      .toString()
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                  </ul>

                  {/* 🔹 Icons Updated to match Skills style with Tooltip */}
                  {item.tech && (
                    <div className="flex flex-wrap gap-3 py-3">
                      {item.tech.map((key) => {
                        const Icon = iconMap[key];
                        // Create a unique ID for each instance to avoid conflicts if same tech appears multiple times
                        const uniqueId = `${item.title}-${key}`;

                        return (
                          <div
                            key={key}
                            className="group relative cursor-pointer"
                            onMouseEnter={() => setHoveredTech(uniqueId)}
                            onMouseLeave={() => setHoveredTech(null)}
                          >
                            <Icon className="h-5 w-5 text-neutral-500 transition-colors group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />

                            {hoveredTech === uniqueId && (
                              <div className="absolute -top-10 left-1/2 z-20 -translate-x-1/2">
                                <div className="relative rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                                  {techNames[key]}

                                  {/* Arrow */}
                                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* <Image
                  src={item.src}
                  alt={item.title}
                  width={200}
                  height={120}
                  className="size-10 self-start rounded-full md:self-auto"
                /> */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
