"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Pencil, Save, Trash2 } from "lucide-react";
import type { BlogFormat, BlogPost } from "@/lib/blog/types";
import { BLOG_FORMATS, slugify } from "@/lib/blog/types";
import { savePostAction, deletePostAction, type BlogInput } from "@/app/actions/blog";
import { Prose } from "@/components/blog/prose";

const STARTER = `Write your article here using simple Markdown.

## A heading

A normal paragraph. Use **bold**, *italics*, and [links](/calculators/voltage-drop).

- Bullet points
- Work like this

> A quote or note stands out like this.
`;

const empty: BlogPost = {
  id: "", slug: "", title: "", excerpt: "", coverImage: null, format: "standard",
  body: STARTER, tags: [], author: "VoltCalc Team", status: "draft", publishedAt: null,
};

export function BlogEditor({ initial }: { initial?: BlogPost | null }) {
  const router = useRouter();
  const isNew = !initial?.id;
  const src = initial ?? empty;

  const [title, setTitle] = useState(src.title);
  const [slug, setSlug] = useState(src.slug);
  const [slugTouched, setSlugTouched] = useState(!!src.slug);
  const [excerpt, setExcerpt] = useState(src.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(src.coverImage ?? "");
  const [author, setAuthor] = useState(src.author ?? "");
  const [tags, setTags] = useState(src.tags.join(", "));
  const [format, setFormat] = useState<BlogFormat>(src.format);
  const [status, setStatus] = useState<"draft" | "published">(src.status);
  const [body, setBody] = useState(src.body || STARTER);

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function onTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const input: BlogInput = {
      id: initial?.id || undefined, slug, title, excerpt, coverImage, format, body, author,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean), status,
    };
    const r = await savePostAction(input);
    setSaving(false);
    if (r.ok) router.push("/admin/blog");
    else setMsg(r.error ?? "Could not save.");
  }

  async function del() {
    if (!initial?.id || !confirm("Delete this post?")) return;
    const r = await deletePostAction(initial.id);
    if (r.ok) router.push("/admin/blog");
    else setMsg(r.error ?? "Could not delete.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Editor */}
      <div className="space-y-5">
        <div className="card p-5">
          <div className="space-y-3">
            <div>
              <label className="field-label">Title</label>
              <input className="field-input text-lg font-semibold" value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Post title" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Slug</label>
                <input className="field-input font-mono text-sm" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} placeholder="post-slug" />
              </div>
              <div>
                <label className="field-label">Tags (comma separated)</label>
                <input className="field-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="CEC, Voltage Drop" />
              </div>
            </div>
            <div>
              <label className="field-label">Excerpt</label>
              <textarea className="field-input resize-none" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="One-line summary for cards and SEO." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Cover image URL</label>
                <input className="field-input" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://… (used by Hero & Magazine)" />
              </div>
              <div>
                <label className="field-label">Author</label>
                <input className="field-input" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Body: Markdown with live preview */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-1 border-b px-3 py-2">
            <span className="mr-auto text-sm font-semibold">Article</span>
            <button onClick={() => setTab("write")} className={`btn-ghost h-8 gap-1.5 px-3 text-xs ${tab === "write" ? "bg-muted" : ""}`}><Pencil className="h-3.5 w-3.5" /> Write</button>
            <button onClick={() => setTab("preview")} className={`btn-ghost h-8 gap-1.5 px-3 text-xs ${tab === "preview" ? "bg-muted" : ""}`}><Eye className="h-3.5 w-3.5" /> Preview</button>
          </div>
          {tab === "write" ? (
            <textarea className="min-h-[420px] w-full resize-y bg-transparent p-4 font-mono text-sm outline-none" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your article in Markdown…" />
          ) : (
            <div className="min-h-[420px] p-5"><Prose content={body} /></div>
          )}
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">Markdown: <code className="font-mono">## Heading</code>, <code className="font-mono">**bold**</code>, <code className="font-mono">- list</code>, <code className="font-mono">&gt; quote</code>, <code className="font-mono">[text](/link)</code>.</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
        <div className="card p-5">
          <label className="field-label">Page style</label>
          <div className="mt-1 space-y-2">
            {BLOG_FORMATS.map((f) => (
              <button key={f.key} onClick={() => setFormat(f.key)} className={`w-full rounded-lg border p-2.5 text-left text-sm transition ${format === f.key ? "border-primary bg-primary/5" : "hover:bg-muted"}`}>
                <span className="block font-medium">{f.name}</span>
                <span className="block text-xs text-muted-foreground">{f.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="grid gap-3">
            <div>
              <label className="field-label">Status</label>
              <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> {isNew ? "Create post" : "Save changes"}</>}
            </button>
            {!isNew && <button onClick={del} className="btn-ghost text-danger"><Trash2 className="h-4 w-4" /> Delete post</button>}
            {msg && <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">{msg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
