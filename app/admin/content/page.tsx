"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";

const DEFAULTS = {
  heroTitle: "Electrical calculations that cite the code.",
  heroSubtitle: "Load calcs, panel schedules, cable sizing and voltage drop — each answer backed by the exact CEC rule.",
  contactHeading: "Hire our engineers for your calculations",
  contactEmail: "hello@voltcalc.app",
  footerTagline: "Code-compliant electrical calculators and an AI assistant that cites the electrical code book.",
};

const fields: { key: keyof typeof DEFAULTS; label: string; area?: boolean }[] = [
  { key: "heroTitle", label: "Hero title" },
  { key: "heroSubtitle", label: "Hero subtitle", area: true },
  { key: "contactHeading", label: "Contact / hire heading" },
  { key: "contactEmail", label: "Contact email" },
  { key: "footerTagline", label: "Footer tagline", area: true },
];

export default function AdminContentPage() {
  const [content, setContent] = useState(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  const set = (key: keyof typeof DEFAULTS, value: string) => {
    setContent((c) => ({ ...c, [key]: value }));
    setDirty(true);
  };

  return (
    <DashboardShell title="Site content" subtitle="Edit the landing hero, contact block and footer copy." nav={adminNav("/admin/content")}>
      <div className="card max-w-2xl space-y-4 p-6">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="field-label">{f.label}</span>
            {f.area ? (
              <textarea rows={2} className="field-input resize-none" value={content[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <input className="field-input" value={content[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </label>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <button disabled={!dirty} className="btn-primary" onClick={() => setDirty(false)}>Save content</button>
          <p className="text-xs text-muted-foreground">Stored as site settings (SiteConfig) once the database is connected.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
