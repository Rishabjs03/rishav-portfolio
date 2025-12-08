"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Github, X } from "lucide-react";
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

interface Project {
  title: string;
  src: string;
  video: string;
  description: string;
  tech: TechKey[];
  github: string;
  live: string;
}

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

const Projects = ({ showAll = false }: { showAll?: boolean }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const projects: Project[] = [
    {
      title: "Nova AI",
      src: "/nova.png",
      video: "/inquiro.mp4", // Kept original video placeholder as no video source was found
      description:
        "Nova AI is an advanced multi-modal assistant that can read webpages, research live information, run Python code, and interact through natural voice conversations.",
      tech: ["langchain", "ts", "next"],
      github: "https://github.com/Rishabjs03",
      live: "https://nova-gamma-five.vercel.app/",
    },
    {
      title: "Converso",
      src: "/converso.jpg",
      video: "/inquiro.mp4",
      description:
        "An AI-powered learning companion that lets students discuss topics and concepts in real time with an intelligent study partner.",
      tech: ["next", "ts", "react"],
      github: "https://github.com/Rishabjs03",
      live: "https://converso-amber-nine.vercel.app/",
    },
    {
      title: "SkillSwap",
      src: "/skillswap.png",
      video: "/scribble.mp4",
      description:
        "A micro-gig platform where people list their specialized skills, host learning sessions, and earn per hour — complete with real-time chatting.",
      tech: ["next", "ts", "prisma"],
      github: "https://github.com/Rishabjs03",
      live: "https://skill-swap-fsct.vercel.app/",
    },
    {
      title: "XMatch",
      src: "/xmatch-new.png",
      video: "/scribble.mp4",
      description:
        "A Tinder-style matchmaking app for developers — chat, match, and connect with fellow devs using real-time communication.",
      tech: ["next", "prisma", "node"],
      github: "https://github.com/Rishabjs03",
      live: "https://tinder-clone-red.vercel.app/",
    },
  ];

  return (
    <div className="mt-8">
      {/* Subtitle */}
      {/* <p className="font-custom2 mt-3 inline-block border border-dashed border-neutral-300 bg-neutral-100 px-4 py-[7px] text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        I love designing and building thoughtful, production-grade applications.
      </p> */}

      {/* GRID */}
      <div className="grid grid-cols-1 gap-5 py-7 sm:grid-cols-2 md:grid-cols-2">
        {(showAll ? projects : projects.slice(0, 2)).map((project, idx) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: idx * 0.12,
            }}
            viewport={{ once: true, amount: 0.2 }}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-black"
          >
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_130%,rgba(0,0,0,0.08),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_50%_130%,rgba(255,255,255,0.10),transparent_75%)]" />

            {/* IMAGE */}
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={project.src}
                alt={project.title}
                fill
                className="object-cover"
              />

              {/* Black tint overlay */}
              <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/10" />

              {/* PLAY BUTTON */}
            </div>

            {/* CONTENT */}
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-custom text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {project.title}
                </h2>

                <div className="flex gap-3">
                  <Globe
                    size={17}
                    onClick={() => window.open(project.live, "_blank")}
                    className="cursor-pointer text-neutral-700 opacity-75 transition hover:opacity-100 dark:text-neutral-300"
                  />
                  <Github
                    size={17}
                    onClick={() => window.open(project.github, "_blank")}
                    className="cursor-pointer text-neutral-700 opacity-75 transition hover:opacity-100 dark:text-neutral-300"
                  />
                </div>
              </div>

              <p className="font-custom2 mb-4 text-sm leading-relaxed tracking-wide text-neutral-600 dark:text-neutral-400">
                {project.description}
              </p>

              {/* TECH STACK */}
              <p className="font-custom2 mb-2 text-xs font-medium text-neutral-500">
                Tech Stack
              </p>

              <div className="flex flex-wrap gap-3">
                {project.tech.map((key) => {
                  const Icon = iconMap[key];
                  const uniqueId = `${project.title}-${key}`;

                  return (
                    <div
                      key={key}
                      className="relative cursor-pointer"
                      onMouseEnter={() => setHoveredTech(uniqueId)}
                      onMouseLeave={() => setHoveredTech(null)}
                    >
                      <Icon className="h-5 w-5 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100" />

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
            </div>
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-[90%] max-w-3xl overflow-hidden rounded-xl bg-black shadow-xl"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 cursor-pointer rounded-full bg-neutral-500 p-2"
              >
                <X size={20} className="text-neutral-200" />
              </button>

              {activeVideo.includes("youtube") ? (
                <iframe
                  src={activeVideo}
                  className="aspect-video w-full"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  src={activeVideo}
                  className="h-auto w-full"
                  controls
                  autoPlay
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
          delay: 2 * 0.12,
        }}
        viewport={{ once: true, amount: 0.2 }}
        className="w-full"
      >
        {!showAll && (
          <div>
            <div className="flex justify-center">
              <div className="mt-2 flex justify-center">
                <Link href="/projects">
                  <AnimatedButton className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-linear-to-b from-white to-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:from-neutral-50 hover:to-neutral-100 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:from-neutral-800 dark:hover:to-neutral-800">
                    View all projects
                  </AnimatedButton>
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Projects;
