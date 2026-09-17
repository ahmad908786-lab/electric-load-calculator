"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, MessageSquarePlus, Plus, SendHorizontal, Sparkles, Square, Trash2, X, Zap } from "lucide-react";
import { Markdown } from "./markdown";

interface Msg {
  role: "user" | "assistant";
  content: string;
}
interface Conversation {
  id: string;
  title: string;
  messages: Msg[];
  updatedAt: number;
}

const STORAGE_KEY = "vc_chats";
const SUGGESTIONS = [
  "What size copper conductor for a 60 A feeder at 40 m?",
  "Explain the CEC voltage drop limits",
  "Minimum service for a 200 m² house with electric heat",
  "How do I balance a three-phase panel?",
];

function genId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `c${Math.random().toString(36).slice(2, 10)}`;
  }
}
const newConversation = (): Conversation => ({ id: genId(), title: "New chat", messages: [], updatedAt: Date.now() });

export function AssistantChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Load / seed conversations.
  useEffect(() => {
    let loaded: Conversation[] = [];
    try {
      loaded = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {}
    if (!Array.isArray(loaded) || loaded.length === 0) loaded = [newConversation()];
    const wanted = new URLSearchParams(window.location.search).get("chat");
    const initial = wanted && loaded.some((c) => c.id === wanted) ? wanted : loaded[0].id;
    setConversations(loaded);
    setCurrentId(initial);
  }, []);

  // Persist.
  useEffect(() => {
    if (conversations.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 50)));
      } catch {}
    }
  }, [conversations]);

  const current = conversations.find((c) => c.id === currentId);
  const messages = current?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function autoGrow() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }

  function newChat() {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setCurrentId(c.id);
    setSidebarOpen(false);
  }
  function deleteChat(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      const list = next.length ? next : [newConversation()];
      if (id === currentId) setCurrentId(list[0].id);
      return list;
    });
  }

  function updateCurrent(fn: (msgs: Msg[]) => Msg[]) {
    setConversations((prev) => prev.map((c) => (c.id === currentId ? { ...c, messages: fn(c.messages), updatedAt: Date.now() } : c)));
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || streaming) return;
    const apiMessages = [...messages, { role: "user" as const, content: q }];

    setInput("");
    requestAnimationFrame(autoGrow);
    const isFirst = messages.length === 0;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentId
          ? { ...c, title: isFirst ? q.slice(0, 48) : c.title, messages: [...c.messages, { role: "user", content: q }, { role: "assistant", content: "" }], updatedAt: Date.now() }
          : c
      )
    );

    setStreaming(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, stream: true }),
        signal: ac.signal,
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        updateCurrent((m) => m.map((msg, i) => (i === m.length - 1 ? { ...msg, content: acc } : msg)));
      }
      if (!acc) updateCurrent((m) => m.map((msg, i) => (i === m.length - 1 ? { ...msg, content: "_No answer generated._" } : msg)));
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        updateCurrent((m) => m.map((msg, i) => (i === m.length - 1 ? { ...msg, content: "Sorry — something went wrong. Please try again." } : msg)));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 w-72 border-r bg-surface pt-16 transition-transform lg:static lg:z-0 lg:translate-x-0 lg:pt-0`}>
        <div className="flex h-full flex-col p-3">
          <button onClick={newChat} className="btn-outline w-full justify-start gap-2">
            <Plus className="h-4 w-4" /> New chat
          </button>
          <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
            {conversations.map((c) => (
              <div key={c.id} className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${c.id === currentId ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <button onClick={() => { setCurrentId(c.id); setSidebarOpen(false); }} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <MessageSquarePlus className="h-4 w-4 shrink-0 opacity-60" />
                  <span className="truncate">{c.title || "New chat"}</span>
                </button>
                <button onClick={() => deleteChat(c.id)} className="shrink-0 opacity-0 transition group-hover:opacity-100" aria-label="Delete chat">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-danger" />
                </button>
              </div>
            ))}
          </div>
          <p className="px-2 pt-2 text-[11px] text-muted-foreground">Chats are stored on this device.</p>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-2 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost h-9 w-9 p-0"><Menu className="h-5 w-5" /></button>
          <span className="font-semibold">Ask the Code</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Zap className="h-7 w-7" /></span>
              <h1 className="mt-4 text-2xl font-bold">Ask the Code</h1>
              <p className="mt-2 text-muted-foreground">Your Canadian Electrical Code assistant. Ask anything — get an answer with the exact rule cited.</p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="card px-4 py-3 text-left text-sm hover:border-primary/40">{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((m, i) => (
                <div key={i} className={m.role === "assistant" ? "border-b bg-surface/50" : "border-b"}>
                  <div className="mx-auto flex max-w-3xl gap-3 px-4 py-5">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {m.role === "assistant" ? <Sparkles className="h-4 w-4" /> : "You"}
                    </span>
                    <div className="min-w-0 flex-1">
                      {m.role === "assistant" ? (
                        m.content ? <Markdown content={m.content} /> : <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-primary/40" />
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t bg-background px-4 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring"
          >
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoGrow(); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              rows={1}
              placeholder="Ask about voltage drop, ampacity, load calcs…"
              className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            {streaming ? (
              <button type="button" onClick={stop} className="btn-outline h-9 w-9 shrink-0 p-0" aria-label="Stop"><Square className="h-4 w-4" /></button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="btn-primary h-9 w-9 shrink-0 p-0" aria-label="Send"><SendHorizontal className="h-4 w-4" /></button>
            )}
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
            Answers include CEC references — always verify against the adopted edition and a licensed professional.
          </p>
        </div>
      </div>
    </div>
  );
}
