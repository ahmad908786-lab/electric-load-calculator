import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPostById } from "@/lib/blog/store";
import { BlogEditor } from "@/components/admin/blog-editor";

export const metadata: Metadata = { title: "Admin · Edit post" };
export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const post = isNew ? null : await getPostById(id);

  return (
    <div className="container-page py-8">
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">Admin</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/admin/blog" className="hover:text-foreground">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{isNew ? "New post" : "Edit"}</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{isNew ? "New post" : "Edit post"}</h1>
      <BlogEditor initial={post} />
    </div>
  );
}
