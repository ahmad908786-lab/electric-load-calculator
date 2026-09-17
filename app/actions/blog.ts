"use server";

import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { features } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import type { BlogFormat } from "@/lib/blog/types";
import { isBlogLayout } from "@/lib/blog/layouts";
import { BLOG_LAYOUT_COOKIE } from "@/lib/blog/settings";

export interface BlogInput {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  format: BlogFormat;
  body: string;
  tags: string[];
  author?: string;
  status: "draft" | "published";
}

export interface BlogActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

async function requireAdmin() {
  if (!features.db) return { error: "Connect a database (DATABASE_URL) to manage posts." };
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Admin access required." };
  return { user };
}

export async function savePostAction(input: BlogInput): Promise<BlogActionResult> {
  const gate = await requireAdmin();
  if (gate.error) return { ok: false, error: gate.error };
  const db = getDb()!;

  if (!input.title.trim() || !input.slug.trim()) return { ok: false, error: "Title and slug are required." };

  const data = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() || null,
    coverImage: input.coverImage?.trim() || null,
    format: input.format,
    body: input.body,
    tags: input.tags,
    author: input.author?.trim() || null,
    status: input.status,
  };
  const publishing = input.status === "published";

  try {
    if (input.id) {
      const existing = await db.blogPost.findUnique({ where: { id: input.id } });
      const row = await db.blogPost.update({
        where: { id: input.id },
        data: { ...data, publishedAt: publishing ? existing?.publishedAt ?? new Date() : null },
      });
      return { ok: true, id: row.id };
    }
    const row = await db.blogPost.create({ data: { ...data, publishedAt: publishing ? new Date() : null } });
    return { ok: true, id: row.id };
  } catch (err) {
    const msg = String(err).includes("Unique") ? "That slug is already in use." : "Could not save the post.";
    return { ok: false, error: msg };
  }
}

/** Set the /blog page layout template. Cookie = instant/offline; SiteConfig = site-wide when a DB is connected. */
export async function setBlogLayoutAction(layout: string): Promise<BlogActionResult> {
  if (!isBlogLayout(layout)) return { ok: false, error: "Unknown layout." };
  if (features.auth) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return { ok: false, error: "Admin access required." };
  }
  const store = await cookies();
  store.set(BLOG_LAYOUT_COOKIE, layout, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });

  const db = getDb();
  if (features.db && db) {
    try {
      await db.siteConfig.upsert({
        where: { key: BLOG_LAYOUT_COOKIE },
        create: { key: BLOG_LAYOUT_COOKIE, value: { v: layout } },
        update: { value: { v: layout } },
      });
    } catch {
      /* cookie still applies */
    }
  }
  return { ok: true };
}

export async function deletePostAction(id: string): Promise<BlogActionResult> {
  const gate = await requireAdmin();
  if (gate.error) return { ok: false, error: gate.error };
  const db = getDb()!;
  try {
    await db.blogPost.delete({ where: { id } });
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete the post." };
  }
}
