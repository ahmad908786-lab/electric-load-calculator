/** Blog content model. A post is a Markdown article rendered in one of a few page styles. */

export type BlogFormat = "standard" | "magazine" | "docs" | "minimal" | "hero";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  format: BlogFormat;
  body: string; // Markdown
  tags: string[];
  author: string | null;
  status: "draft" | "published";
  publishedAt: string | null; // ISO
}

/** The 4–5 page layout styles an author can choose for the whole blog page. */
export const BLOG_FORMATS: { key: BlogFormat; name: string; description: string }[] = [
  { key: "standard", name: "Standard", description: "Clean, centered single-column article." },
  { key: "magazine", name: "Magazine", description: "Large cover image and a wide editorial layout." },
  { key: "docs", name: "Documentation", description: "Sidebar table of contents built from your headings." },
  { key: "minimal", name: "Minimal", description: "Narrow, distraction-free, typography-first (no cover)." },
  { key: "hero", name: "Hero", description: "Full-width cover image with the title overlaid on it." },
];

export function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function readingMinutes(body: string): number {
  const words = (body || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Pull the H2 headings out of the Markdown body for the docs-style table of contents. */
export function extractHeadings(body: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  const re = /^##\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const text = m[1].trim();
    out.push({ id: slugify(text), text });
  }
  return out;
}
