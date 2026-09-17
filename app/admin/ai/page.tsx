"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";

const DEFAULT_PROMPT = `You are VoltCalc's electrical code assistant for the Canadian Electrical Code (CEC) and the Ontario Electrical Safety Code (OESC). Answer clearly in Markdown, cite the governing rule/table inline, and end with a reminder to verify against the adopted edition and a licensed professional.`;

export default function AdminAiPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [model, setModel] = useState("claude-sonnet-5");
  const [dirty, setDirty] = useState(false);

  return (
    <DashboardShell title="AI assistant" subtitle="Tune the assistant's behaviour, model and grounding." nav={adminNav("/admin/ai")}>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Status", value: "Local engine", note: "Add ANTHROPIC_API_KEY for full Claude answers" },
          { label: "Knowledge base", value: "14 topics", note: "CEC rules & live calculators" },
          { label: "Code book ingested", value: "0 chunks", note: "Upload in Code standards" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-lg font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="card max-w-2xl space-y-4 p-6">
        <label className="block">
          <span className="field-label">Model</span>
          <select className="field-input" value={model} onChange={(e) => { setModel(e.target.value); setDirty(true); }}>
            <option value="claude-sonnet-5">Claude Sonnet 5 (fast, cost-effective)</option>
            <option value="claude-opus-4-8">Claude Opus 4.8 (most capable)</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (cheapest)</option>
          </select>
        </label>
        <label className="block">
          <span className="field-label">System prompt</span>
          <textarea rows={7} className="field-input resize-none font-mono text-xs" value={prompt} onChange={(e) => { setPrompt(e.target.value); setDirty(true); }} />
        </label>
        <div className="flex items-center gap-3">
          <button disabled={!dirty} className="btn-primary" onClick={() => setDirty(false)}>Save settings</button>
          <p className="text-xs text-muted-foreground">Set the API key via the ANTHROPIC_API_KEY env var; prompt/model persist to the database once connected.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
