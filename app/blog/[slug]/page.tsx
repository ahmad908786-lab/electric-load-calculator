import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog/store";
import { PostView } from "@/components/blog/post-view";
import { SAMPLE_POSTS } from "@/lib/blog/sample-posts";

export const dynamicParams = true;

export function generateStaticParams() {
  // Build-time params from the built-in posts; DB posts render on demand.
  return SAMPLE_POSTS.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined, type: "article", images: post.coverImage ? [post.coverImage] : undefined },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = (await getPublishedPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <PostView post={post} />
      <div className="container-page max-w-3xl pb-12">
        <Link href="/blog" className="btn-outline"><ArrowLeft className="h-4 w-4" /> All posts</Link>
      </div>
      {related.length > 0 && (
        <section className="border-t bg-surface">
          <div className="container-page py-12">
            <h2 className="mb-6 text-xl font-bold">More from the blog</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="card p-5 transition hover:border-primary/40">
                  <h3 className="font-semibold hover:text-primary">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
