import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";
import { CATALOG } from "@/packages/registry";
import { getPublishedPosts } from "@/lib/blog/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = APP_URL.replace(/\/$/, "");
  const staticPages = ["", "/calculators", "/panel-schedule", "/pricing", "/about", "/blog", "/login", "/signup"];
  const calcPages = CATALOG.filter((c) => c.key !== "panel-schedule").map((c) => `/calculators/${c.key}`);
  const posts = await getPublishedPosts();
  const blogPages = posts.map((p) => `/blog/${p.slug}`);

  return [...staticPages, ...calcPages, ...blogPages].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
