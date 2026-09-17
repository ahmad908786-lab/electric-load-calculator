"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Plus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { userNav } from "@/components/dashboard/nav-config";

interface Conv {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  updatedAt: number;
}

export default function ChatsPage() {
  const [chats, setChats] = useState<Conv[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("vc_chats") || "[]");
      if (Array.isArray(c)) setChats(c);
    } catch {}
    setReady(true);
  }, []);

  function del(id: string) {
    const next = chats.filter((c) => c.id !== id);
    setChats(next);
    try {
      localStorage.setItem("vc_chats", JSON.stringify(next));
    } catch {}
  }

  const nonEmpty = chats.filter((c) => c.messages.length > 0);

  return (
    <DashboardShell title="AI chats" subtitle="Your saved conversations with the Ask the Code assistant." nav={userNav("/dashboard/chats")}>
      <div className="mb-4 flex justify-end">
        <Link href="/assistant" className="btn-primary"><Plus className="h-4 w-4" /> New chat</Link>
      </div>
      {ready && nonEmpty.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No conversations yet. Ask the assistant a question to get started.</p>
          <Link href="/assistant" className="btn-primary mt-1 h-9">Open the assistant</Link>
        </div>
      ) : (
        <div className="card divide-y">
          {nonEmpty.map((c) => (
            <div key={c.id} className="group flex items-center gap-3 px-4 py-3">
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Link href={`/assistant?chat=${c.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-primary">{c.title || "New chat"}</p>
                <p className="text-xs text-muted-foreground">{c.messages.length} messages</p>
              </Link>
              <Link href={`/assistant?chat=${c.id}`} className="btn-ghost h-8 gap-1 px-2 text-xs">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
              <button onClick={() => del(c.id)} className="text-muted-foreground hover:text-danger" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Conversations are stored on this device.</p>
    </DashboardShell>
  );
}
