"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";
import { CATALOG } from "@/packages/registry";

interface Row {
  key: string;
  name: string;
  category: string;
  status: string;
  enabled: boolean;
  freeTier: boolean;
}

export default function AdminCalculatorsPage() {
  const [rows, setRows] = useState<Row[]>(() => CATALOG.map((c) => ({ ...c, enabled: c.status === "live", freeTier: true })));
  const [dirty, setDirty] = useState(false);

  const update = (key: string, patch: Partial<Row>) => {
    setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
    setDirty(true);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    setRows((r) => {
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  };

  return (
    <DashboardShell title="Calculators" subtitle="Enable or disable tools, reorder them, and set which are free vs. paid." nav={adminNav("/admin/calculators")}>
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-b bg-muted/40 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
          <span>Calculator</span><span>Free</span><span>Enabled</span><span>Order</span>
        </div>
        <div className="divide-y">
          {rows.map((row, i) => (
            <div key={row.key} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-4 py-2.5 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium">{row.name}</span>
                <span className="badge border-border text-[10px] text-muted-foreground">{row.category}</span>
                {row.status === "soon" && <span className="badge border-border text-[10px] text-muted-foreground">soon</span>}
              </span>
              <button onClick={() => update(row.key, { freeTier: !row.freeTier })} className={`flex h-5 w-5 items-center justify-center rounded ${row.freeTier ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                {row.freeTier ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => update(row.key, { enabled: !row.enabled })} role="switch" aria-checked={row.enabled} className={`relative h-5 w-9 rounded-full transition ${row.enabled ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${row.enabled ? "left-[18px]" : "left-0.5"}`} />
              </button>
              <span className="flex items-center gap-0.5">
                <button onClick={() => move(i, -1)} className="btn-ghost h-7 w-7 p-0" aria-label="Up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => move(i, 1)} className="btn-ghost h-7 w-7 p-0" aria-label="Down"><ArrowDown className="h-3.5 w-3.5" /></button>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={!dirty} className="btn-primary" onClick={() => setDirty(false)}>Save changes</button>
        <p className="text-xs text-muted-foreground">{dirty ? "Unsaved changes — " : ""}Changes persist to the database once it&apos;s connected.</p>
      </div>
    </DashboardShell>
  );
}
