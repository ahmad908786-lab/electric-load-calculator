import Link from "next/link";
import { CalendarDays, ChevronRight, Clock, User } from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";
import { readingMinutes, extractHeadings } from "@/lib/blog/types";
import { Prose } from "./prose";

function Meta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      {post.author && <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {post.author}</span>}
      {post.publishedAt && <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {new Date(post.publishedAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</span>}
      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {readingMinutes(post.body)} min read</span>
    </div>
  );
}

const Tags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="badge border-primary/30 bg-primary/10 text-primary">{t}</span>)}</div>
);

const Breadcrumb = ({ title }: { title: string }) => (
  <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
    <Link href="/" className="hover:text-foreground">Home</Link>
    <ChevronRight className="h-3 w-3" />
    <Link href="/blog" className="hover:text-foreground">Blog</Link>
    <ChevronRight className="h-3 w-3" />
    <span className="max-w-[16rem] truncate text-foreground">{title}</span>
  </nav>
);

export function PostView({ post }: { post: BlogPost }) {
  // HERO — full-bleed cover with the title overlaid.
  if (post.format === "hero") {
    return (
      <article>
        <header className="relative overflow-hidden border-b bg-gradient-to-br from-primary/20 via-surface to-background">
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          )}
          <div className="container-page relative py-20">
            <Breadcrumb title={post.title} />
            <div className="mb-3"><Tags tags={post.tags} /></div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{post.excerpt}</p>}
            <div className="mt-5"><Meta post={post} /></div>
          </div>
        </header>
        <div className="container-page max-w-3xl py-10"><Prose content={post.body} /></div>
      </article>
    );
  }

  // MAGAZINE — cover band, wide editorial layout.
  if (post.format === "magazine") {
    return (
      <article>
        <div className="container-page pt-8"><Breadcrumb title={post.title} /></div>
        <div className="container-page">
          <div className="relative flex h-52 items-end overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/25 via-primary/5 to-surface sm:h-64">
            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
        </div>
        <div className="container-page max-w-3xl py-8">
          <div className="mb-3"><Tags tags={post.tags} /></div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-3 text-xl text-muted-foreground">{post.excerpt}</p>}
          <div className="mt-4 border-b pb-6"><Meta post={post} /></div>
          <Prose content={post.body} />
        </div>
      </article>
    );
  }

  // DOCS — sidebar table of contents.
  if (post.format === "docs") {
    const toc = extractHeadings(post.body);
    return (
      <article className="container-page py-10">
        <Breadcrumb title={post.title} />
        <div className="mb-3"><Tags tags={post.tags} /></div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{post.excerpt}</p>}
        <div className="mt-4"><Meta post={post} /></div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            {toc.length > 0 && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
                <nav className="space-y-1 border-l">
                  {toc.map((h) => <a key={h.id} href={`#${h.id}`} className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground">{h.text}</a>)}
                </nav>
              </>
            )}
          </aside>
          <div className="min-w-0 max-w-2xl"><Prose content={post.body} /></div>
        </div>
      </article>
    );
  }

  // MINIMAL — narrow, typography-first, no cover/tags clutter.
  if (post.format === "minimal") {
    return (
      <article className="container-page max-w-xl py-14">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-3 border-b pb-5"><Meta post={post} /></div>
        <Prose content={post.body} />
      </article>
    );
  }

  // STANDARD — clean centered article.
  return (
    <article className="container-page max-w-2xl py-10">
      <Breadcrumb title={post.title} />
      <div className="mb-3"><Tags tags={post.tags} /></div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
      {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}
      <div className="mt-4 border-b pb-6"><Meta post={post} /></div>
      <Prose content={post.body} />
    </article>
  );
}
