import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";
import { readingMinutes } from "@/lib/blog/types";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group card overflow-hidden transition hover:border-primary/40 hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-surface">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
        )}
        {post.tags[0] && (
          <span className="absolute left-3 top-3 badge border-transparent bg-background/90 text-foreground">{post.tags[0]}</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold leading-snug group-hover:text-primary">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }) : "Draft"} · {readingMinutes(post.body)} min</span>
          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-70" />
        </div>
      </div>
    </Link>
  );
}
