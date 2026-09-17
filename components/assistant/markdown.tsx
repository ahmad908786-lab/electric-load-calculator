import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders assistant Markdown with app styling. Internal links use client nav. */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed [&>*:first-child]:mt-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-3">{children}</p>,
          h1: ({ children }) => <h1 className="mb-2 mt-4 text-xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-4 text-lg font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-base font-semibold">{children}</h3>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="marker:text-muted-foreground">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => <blockquote className="my-3 border-l-4 border-primary/40 pl-3 text-muted-foreground">{children}</blockquote>,
          hr: () => <hr className="my-4" />,
          a: ({ href, children }) => {
            const url = href ?? "#";
            return url.startsWith("/") ? (
              <Link href={url} className="font-medium text-primary hover:underline">{children}</Link>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{children}</a>
            );
          },
          pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs [&_code]:bg-transparent [&_code]:p-0">{children}</pre>,
          code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>,
          table: ({ children }) => <div className="my-3 overflow-x-auto"><table className="w-full border-collapse text-xs">{children}</table></div>,
          th: ({ children }) => <th className="border px-2 py-1 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border px-2 py-1">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
