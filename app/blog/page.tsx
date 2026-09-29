import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogs } from "@/util/mdx_clean";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { SketchBorder } from "@/components/sketch/SketchBorder";

export const metadata: Metadata = {
  title: "Blog | Rishav Agarwal",
  description: "Notes on software engineering, web development and AI.",
};

export default async function BlogIndex() {
  const posts = await getAllBlogs();

  return (
    <div className="pt-28 pb-10 md:pt-36">
      <SectionHeader id="blog-title" sheet="Notebook" title="All blogs">
        Notes from the margins: things I learned while building.
      </SectionHeader>
      <ul className="space-y-6">
        {posts.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <SketchBorder seed={i + 3} redrawOnHover className="p-5 md:p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                  <h2 className="font-hand text-graphite text-3xl font-bold">
                    {p.title ?? p.slug}
                  </h2>
                  {p.date && (
                    <time className="text-graphite-2 font-mono text-[11px] tracking-[0.15em] uppercase">
                      {new Date(p.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                  )}
                </div>
                {p.description && (
                  <p className="text-graphite-2 mt-2 max-w-2xl text-[15px] leading-relaxed">
                    {p.description}
                  </p>
                )}
              </SketchBorder>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
