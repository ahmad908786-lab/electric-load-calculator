"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUp, BookOpen, Loader2, Sparkles } from "lucide-react";
import type { Citation } from "@/packages/calc-core/types";

interface CalcLink {
  key: string;
  label: string;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  calc?: CalcLink;
}

const calcHref = (key: string) => (key === "panel-schedule" ? "/panel-schedule" : `/calculators/${key}`);

const SUGGESTIONS = [
  "What size copper conductor for a 60 A feeder at 40 m?",
  "How is voltage drop limited by the CEC?",
  "Minimum service size for a 200 m² house with electric heat?",
  "When does the 125% continuous-load factor apply?",
];

// Minimal, safe formatter: escapes HTML, then renders **bold** and line breaks.
function format(text: string): string {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
}

export function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong.", citations: data.citations, calc: data.calc },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Could not reach the assistant. Please try again." }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    }
  }

  return (
    <div className="card overflow-hidden shadow-lg">
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold">Ask the Code — AI assistant</span>
        <Link href="/assistant" className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Full chat <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-[340px] space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={m.role === "user" ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground" : "max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-sm"}>
                <span dangerouslySetInnerHTML={{ __html: format(m.content) }} />
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.citations.map((c, j) => (
                      <span key={j} className="badge border-primary/30 bg-background text-primary">
                        <BookOpen className="h-3 w-3" /> {c.code} {c.ref}
                      </span>
                    ))}
                  </div>
                )}
                {m.calc && (
                  <Link href={calcHref(m.calc.key)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    Open the {m.calc.label} <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching the code…
            </div>
          )}
        </div>
      )}

      {messages.length === 0 && (
        <div className="px-4 pt-4">
          <p className="text-sm text-muted-foreground">Ask any Canadian Electrical Code question and get an answer with the exact rule cited.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="btn-outline h-auto rounded-full px-3 py-1.5 text-left text-xs">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="e.g. What derating applies to 6 conductors in a raceway?"
          className="field-input max-h-28 min-h-[42px] flex-1 resize-none"
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary h-[42px] w-[42px] shrink-0 p-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </button>
      </form>
      <p className="border-t px-4 py-2 text-[11px] text-muted-foreground">
        Paraphrased guidance with code references — always verify against the adopted edition. 3 free questions/month on the Free plan.
      </p>
    </div>
  );
}
