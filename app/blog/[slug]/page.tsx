import type { Metadata } from "next";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { type BlogMeta, getSingleBlog } from "@/util/mdx_clean";

export const metadata: Metadata = {
  title: "Blog | Rishav Agarwal",
  description: "Reading a blog...",
};

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug?: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  let content: string;
  let frontmatter: BlogMeta = {};
  try {
    const res = await getSingleBlog(slug);
    content = res.content;
    frontmatter = res.data || {};
  } catch {
    notFound();
  }

  return (
    <article className="pt-28 pb-10 md:pt-36">
      <h1 className="font-hand text-graphite text-5xl font-bold md:text-6xl">
        {frontmatter.title ?? slug}
      </h1>

      {frontmatter.date ? (
        <p className="text-graphite-2 mt-2 font-mono text-xs">
          {frontmatter.date}
        </p>
      ) : null}

      {frontmatter.image ? (
        <div className="mx-auto my-6 max-w-3xl">
          <Image
            src={
              frontmatter.image.startsWith("/public")
                ? frontmatter.image.replace("/public", "")
                : frontmatter.image
            }
            alt={frontmatter.title ?? ""}
            width={1200}
            height={600}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      <div className="prose mx-auto">
        <MDXRemote source={content} />
      </div>
    </article>
  );
}
