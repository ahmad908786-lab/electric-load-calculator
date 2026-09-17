"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { BLOG_PAGE_LAYOUTS, type BlogLayout } from "@/lib/blog/layouts";
import { setBlogLayoutAction } from "@/app/actions/blog";

export function BlogLayoutPicker({ current }: { current: BlogLayout }) {
  const router = useRouter();
  const [selected, setSelected] = useState<BlogLayout>(current);
  const [busy, setBusy] = useState<BlogLayout | null>(null);

  async function pick(layout: BlogLayout) {
    if (layout === selected || busy) return;
    setBusy(layout);
    setSelected(layout);
    await setBlogLayoutAction(layout);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold">Blog page layout</h2>
      <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Choose how the whole /blog listing page is displayed. Applies immediately.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {BLOG_PAGE_LAYOUTS.map((l) => {
          const active = selected === l.key;
          return (
            <button
              key={l.key}
              onClick={() => pick(l.key)}
              className={`relative rounded-lg border p-3 text-left text-sm transition ${active ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
            >
              <span className="flex items-center justify-between font-medium">
                {l.name}
                {busy === l.key ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : active ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{l.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
