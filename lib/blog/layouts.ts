/** Layout templates for the whole /blog listing page (not individual posts). */

export type BlogLayout = "grid" | "list" | "magazine" | "minimal" | "compact";

export const BLOG_PAGE_LAYOUTS: { key: BlogLayout; name: string; description: string }[] = [
  { key: "grid", name: "Grid", description: "Three-column cards with cover images (default)." },
  { key: "list", name: "List", description: "Full-width rows: thumbnail on the left, text on the right." },
  { key: "magazine", name: "Magazine", description: "One large featured post on top, then a grid below." },
  { key: "minimal", name: "Minimal", description: "A clean text list of titles and dates — no images." },
  { key: "compact", name: "Compact", description: "Dense two-column cards to show more at once." },
];

export const DEFAULT_BLOG_LAYOUT: BlogLayout = "grid";

export function isBlogLayout(v: unknown): v is BlogLayout {
  return typeof v === "string" && BLOG_PAGE_LAYOUTS.some((l) => l.key === v);
}
