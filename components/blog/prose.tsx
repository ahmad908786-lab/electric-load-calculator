import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/blog/types";

function toText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (node && typeof node === "object" && "props" in node) return toText((node as { props?: { children?: ReactNode } }).props?.children);
  return "";
}

/** Renders a Markdown article with article-grade typography and heading anchors. */
export function Prose({ content }: { content: string }) {
  return (
    <div className="text-[15px] leading-7 text-foreground/90 [&>*:first-child]:mt-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-4">{children}</p>,
          h2: ({ children }) => <h2 id={slugify(toText(children))} className="mt-8 mb-3 scroll-mt-24 text-2xl font-bold tracking-tight text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 id={slugify(toText(children))} className="mt-6 mb-2 scroll-mt-24 text-lg font-semibold text-foreground">{children}</h3>,
          ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6">{children}</ol>,
          li: ({ children }) => <li className="marker:text-muted-foreground">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => <blockquote className="my-5 rounded-r-lg border-l-4 border-primary/40 bg-primary/5 px-4 py-2 text-foreground/80">{children}</blockquote>,
          hr: () => <hr className="my-8" />,
          a: ({ href, children }) => {
            const url = href ?? "#";
            return url.startsWith("/") ? (
              <Link href={url} className="font-medium text-primary hover:underline">{children}</Link>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{children}</a>
            );
          },
          img: ({ src, alt }) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} className="my-6 w-full rounded-xl border" />
            ) : null,
          pre: ({ children }) => <pre className="my-5 overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm [&_code]:bg-transparent [&_code]:p-0">{children}</pre>,
          code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>,
          table: ({ children }) => <div className="my-5 overflow-x-auto"><table className="w-full border-collapse text-sm">{children}</table></div>,
          th: ({ children }) => <th className="border px-3 py-1.5 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border px-3 py-1.5">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
