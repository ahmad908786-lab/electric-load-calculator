"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";

export function IngestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("standard", "CEC");
      const res = await fetch("/api/admin/ingest", { method: "POST", body: fd });
      const data = await res.json();
      setMsg(res.ok ? `Ingested ${data.chunks} chunks into the ${data.standard} index.` : data.error);
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm hover:bg-muted">
        <Upload className="h-4 w-4 text-primary" />
        <span className="flex-1 truncate">{file ? file.name : "Choose code book PDF…"}</span>
        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <button onClick={upload} disabled={!file || busy} className="btn-outline w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingest for AI search"}
      </button>
      {msg && <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">{msg}</p>}
      <p className="text-xs text-muted-foreground">Extracts text → embeds → stores in pgvector so the AI assistant can cite it. Requires DATABASE_URL + VOYAGE_API_KEY.</p>
    </div>
  );
}
