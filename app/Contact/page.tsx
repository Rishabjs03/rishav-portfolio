"use client";

import Container from "@/components/containers";
import { Github, Linkedin, Twitter } from "lucide-react";
import DisplacementText from "@/components/ui/displacement-text";

export default function Contact() {
  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden font-sans">
      <Container className="mx-auto min-h-[200vh] px-8 pt-24 md:p-20 md:pb-10">
        {/* Background Pattern & Borders */}
        <div className="absolute top-0 right-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        <div className="absolute top-0 left-0 h-full w-6 border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] bg-fixed opacity-80 dark:opacity-12"></div>

        <h1 className="font-custom text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          <span className="link--elara">Contact</span>
        </h1>
        <p className="font-custom2 mt-2 mb-12 max-w-lg text-sm tracking-tight text-neutral-600 md:text-base dark:text-neutral-400">
          Hi there — I’m currently open to Full-stack and AI-driven works.
        </p>

        <div className="relative z-10 w-full max-w-2xl p-0 md:p-0">
          <form className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="font-custom2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Full name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Rishav Agarwal"
                className="font-custom2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="font-custom2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="rishav@example.com"
                className="font-custom2 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="font-custom2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="You're crazy good, never change."
                className="font-custom2 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-600"
              />
            </div>

            <button
              type="button"
              className="group relative w-full overflow-hidden rounded-lg border border-neutral-200 bg-linear-to-b from-white to-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:from-neutral-50 hover:to-neutral-100 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200 dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:from-neutral-800 dark:hover:to-neutral-800"
            >
              <span className="relative z-10">Send message</span>
            </button>
          </form>

          <div className="font-custom2 mt-10 flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 md:flex-row dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <p>Rishav Agarwal</p>
            </div>

            {/* Displacement Text - Visible and Hoverable */}
            {/* Displacement Text - Visible and Hoverable */}

            <div className="flex items-center gap-4">
              <Twitter
                size={14}
                className="cursor-pointer transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
              />
              <Linkedin
                size={14}
                className="cursor-pointer transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
              />
              <Github
                size={14}
                className="cursor-pointer transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* <div className="w-full h-60 relative overflow-hidden flex items-center justify-center ">
          <DisplacementText
            text="KARN"
            fontSize={450}
            className="h-full w-full"
            lightColor="#171717"
            darkColor="#e5e5e5"
          />
        </div> */}
      </Container>
    </div>
  );
}
