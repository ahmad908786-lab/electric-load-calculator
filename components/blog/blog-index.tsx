import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";
import { readingMinutes } from "@/lib/blog/types";
import type { BlogLayout } from "@/lib/blog/layouts";
import { PostCard } from "./post-card";

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "Draft";

function Cover({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-surface ${className ?? ""}`}>
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  );
}

export function BlogIndex({ posts, layout }: { posts: BlogPost[]; layout: BlogLayout }) {
  if (posts.length === 0) {
    return <div className="card p-12 text-center text-muted-foreground">No posts published yet — check back soon.</div>;
  }

  if (layout === "list") {
    return (
      <div className="space-y-4">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group card flex flex-col overflow-hidden transition hover:border-primary/40 sm:flex-row">
            <Cover post={p} className="h-40 shrink-0 sm:h-auto sm:w-56" />
            <div className="flex-1 p-5">
              <div className="mb-1 flex flex-wrap gap-2">{p.tags.slice(0, 2).map((t) => <span key={t} className="badge border-primary/30 bg-primary/10 text-primary">{t}</span>)}</div>
              <h3 className="text-lg font-semibold group-hover:text-primary">{p.title}</h3>
              {p.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
              <p className="mt-2 text-xs text-muted-foreground">{fmtDate(p.publishedAt)} · {readingMinutes(p.body)} min read</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (layout === "magazine") {
    const [featured, ...rest] = posts;
    return (
      <div className="space-y-8">
        <Link href={`/blog/${featured.slug}`} className="group card grid overflow-hidden transition hover:border-primary/40 lg:grid-cols-2">
          <Cover post={featured} className="h-56 lg:h-full" />
          <div className="p-7">
            <div className="mb-2 flex flex-wrap gap-2">{featured.tags.slice(0, 3).map((t) => <span key={t} className="badge border-primary/30 bg-primary/10 text-primary">{t}</span>)}</div>
            <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary sm:text-3xl">{featured.title}</h2>
            {featured.excerpt && <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>}
            <p className="mt-4 text-xs text-muted-foreground">{fmtDate(featured.publishedAt)} · {readingMinutes(featured.body)} min read</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Read article <ArrowRight className="h-4 w-4" /></span>
          </div>
        </Link>
        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{rest.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}
      </div>
    );
  }

  if (layout === "minimal") {
    return (
      <div className="mx-auto max-w-2xl divide-y">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="min-w-0">
              <span className="block font-medium group-hover:text-primary">{p.title}</span>
              {p.excerpt && <span className="mt-0.5 block text-sm text-muted-foreground">{p.excerpt}</span>}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">{p.tags[0]} · {fmtDate(p.publishedAt)}</span>
          </Link>
        ))}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group card p-4 transition hover:border-primary/40">
            <div className="mb-1 flex flex-wrap gap-2">{p.tags.slice(0, 1).map((t) => <span key={t} className="badge border-primary/30 bg-primary/10 text-primary">{t}</span>)}</div>
            <h3 className="font-semibold leading-snug group-hover:text-primary">{p.title}</h3>
            {p.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
            <p className="mt-2 text-xs text-muted-foreground">{fmtDate(p.publishedAt)} · {readingMinutes(p.body)} min</p>
          </Link>
        ))}
      </div>
    );
  }

  // grid (default)
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
