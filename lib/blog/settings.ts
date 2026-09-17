import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { features } from "@/lib/config";
import { DEFAULT_BLOG_LAYOUT, isBlogLayout, type BlogLayout } from "./layouts";

export const BLOG_LAYOUT_COOKIE = "blog_layout";

/**
 * The active /blog page layout. Priority: cookie (instant, works offline) →
 * SiteConfig (site-wide, when a database is connected) → default.
 */
export async function getBlogLayout(): Promise<BlogLayout> {
  try {
    const store = await cookies();
    const c = store.get(BLOG_LAYOUT_COOKIE)?.value;
    if (isBlogLayout(c)) return c;
  } catch {}

  const db = getDb();
  if (features.db && db) {
    try {
      const row = await db.siteConfig.findUnique({ where: { key: BLOG_LAYOUT_COOKIE } });
      const v = (row?.value as { v?: string } | null)?.v;
      if (isBlogLayout(v)) return v;
    } catch {}
  }
  return DEFAULT_BLOG_LAYOUT;
}
