import { getDb } from "@/lib/db";
import { features } from "@/lib/config";
import type { BlogFormat, BlogPost } from "./types";
import { SAMPLE_POSTS } from "./sample-posts";

type Row = {
  id: string; slug: string; title: string; excerpt: string | null; coverImage: string | null;
  format: string; body: string; tags: string[]; author: string | null; status: string; publishedAt: Date | null;
};

function mapRow(r: Row): BlogPost {
  return {
    id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, coverImage: r.coverImage,
    format: r.format as BlogFormat, body: r.body ?? "", tags: r.tags,
    author: r.author, status: r.status === "published" ? "published" : "draft",
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
  };
}

/** Published posts, newest first (public blog index). */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const db = getDb();
  if (features.db && db) {
    const rows = await db.blogPost.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" } });
    return rows.map(mapRow);
  }
  return SAMPLE_POSTS.filter((p) => p.status === "published").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

/** A single published post by slug (public). */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = getDb();
  if (features.db && db) {
    const row = await db.blogPost.findUnique({ where: { slug } });
    return row && row.status === "published" ? mapRow(row) : null;
  }
  return SAMPLE_POSTS.find((p) => p.slug === slug && p.status === "published") ?? null;
}

/** All posts including drafts (admin list). */
export async function getAllPosts(): Promise<BlogPost[]> {
  const db = getDb();
  if (features.db && db) {
    const rows = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
    return rows.map(mapRow);
  }
  return SAMPLE_POSTS;
}

/** A single post by id (admin editor). */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const db = getDb();
  if (features.db && db) {
    const row = await db.blogPost.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  }
  return SAMPLE_POSTS.find((p) => p.id === id) ?? null;
}
