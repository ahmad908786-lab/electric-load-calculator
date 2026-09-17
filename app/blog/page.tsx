import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog/store";
import { getBlogLayout } from "@/lib/blog/settings";
import { BlogIndex } from "@/components/blog/blog-index";

export const metadata: Metadata = {
  title: "Blog — Electrical Code Guides & How-Tos",
  description: "Guides, how-tos and explainers on the Canadian Electrical Code: load calculations, voltage drop, conductor sizing, panel schedules and more.",
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();
  const layout = await getBlogLayout();

  return (
    <div className="container-page py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">The VoltCalc Blog</h1>
        <p className="mt-3 text-muted-foreground">Guides, how-tos and explainers on electrical design and the Canadian Electrical Code.</p>
      </div>
      <BlogIndex posts={posts} layout={layout} />
    </div>
  );
}
