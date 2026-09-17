import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";
import { BlogLayoutPicker } from "@/components/admin/blog-layout-picker";
import { getAllPosts } from "@/lib/blog/store";
import { getBlogLayout } from "@/lib/blog/settings";
import { features } from "@/lib/config";
import { BLOG_FORMATS } from "@/lib/blog/types";

export const metadata: Metadata = { title: "Admin · Blog" };
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();
  const layout = await getBlogLayout();

  return (
    <DashboardShell
      title="Blog posts"
      subtitle="Choose the blog page layout, then create, edit, publish and remove posts."
      nav={adminNav("/admin/blog")}
      banner={
        !features.db && (
          <div className="mb-6 rounded-lg border border-dashed bg-surface px-4 py-3 text-sm text-muted-foreground">
            Preview — these are the built-in sample posts. Connect a database and sign in as an admin to create, edit and remove posts.
          </div>
        )
      }
    >
      <div className="mb-6"><BlogLayoutPicker current={layout} /></div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Posts</h2>
        <Link href="/admin/blog/new" className="btn-primary"><Plus className="h-4 w-4" /> New post</Link>
      </div>
      <div className="card overflow-hidden">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.title || "Untitled"}</p>
                  <p className="truncate text-xs text-muted-foreground">/{p.slug} · {BLOG_FORMATS.find((f) => f.key === p.format)?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${p.status === "published" ? "border-success/40 bg-success/10 text-success" : "border-border text-muted-foreground"}`}>{p.status}</span>
                  <Link href={`/admin/blog/${p.id}`} className="btn-outline h-8 gap-1.5 px-3 text-xs"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
