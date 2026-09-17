"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";
import { PLANS } from "@/lib/plans";

export default function AdminPricingPage() {
  const [plans, setPlans] = useState(() => PLANS.map((p) => ({ ...p })));
  const [dirty, setDirty] = useState(false);

  const set = (id: string, field: string, value: number | null) => {
    setPlans((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    setDirty(true);
  };

  return (
    <DashboardShell title="Pricing & limits" subtitle="Set plan prices and the free-tier calculation / AI-question caps." nav={adminNav("/admin/pricing")}>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="card p-5">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-xs text-muted-foreground">{p.tagline}</p>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="field-label">Monthly price ($)</span>
                <input type="number" className="field-input" value={p.priceMonthly} min={0} onChange={(e) => set(p.id, "priceMonthly", Number(e.target.value))} />
              </label>
              <label className="block">
                <span className="field-label">Yearly price ($)</span>
                <input type="number" className="field-input" value={p.priceYearly} min={0} onChange={(e) => set(p.id, "priceYearly", Number(e.target.value))} />
              </label>
              <label className="block">
                <span className="field-label">Free calculations / month</span>
                <input type="number" className="field-input" value={p.freeCalcsPerMonth ?? ""} placeholder="Unlimited" min={0} onChange={(e) => set(p.id, "freeCalcsPerMonth", e.target.value === "" ? null : Number(e.target.value))} />
              </label>
              <label className="block">
                <span className="field-label">Free AI questions / month</span>
                <input type="number" className="field-input" value={p.aiQuestionsPerMonth ?? ""} placeholder="Unlimited" min={0} onChange={(e) => set(p.id, "aiQuestionsPerMonth", e.target.value === "" ? null : Number(e.target.value))} />
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={!dirty} className="btn-primary" onClick={() => setDirty(false)}>Save pricing</button>
        <p className="text-xs text-muted-foreground">Leave a limit blank for unlimited. Persists to the database once connected; Stripe price IDs are set via env.</p>
      </div>
    </DashboardShell>
  );
}
