import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";
import { CATALOG, CATEGORIES } from "@/packages/registry";
import { features } from "@/lib/config";

export const metadata: Metadata = { title: "Admin · Analytics" };

export default function AdminAnalyticsPage() {
  const byCategory = CATEGORIES.map((c) => ({
    label: c.label,
    live: CATALOG.filter((x) => x.category === c.key && x.status === "live").length,
    total: CATALOG.filter((x) => x.category === c.key).length,
  })).filter((c) => c.total > 0);
  const maxTotal = Math.max(...byCategory.map((c) => c.total), 1);

  const kpis = [
    { label: "Calculations (30d)", value: "—" },
    { label: "AI questions (30d)", value: "—" },
    { label: "Signups (30d)", value: "—" },
    { label: "Conversion rate", value: "—" },
  ];

  return (
    <DashboardShell title="Analytics" subtitle="Usage, conversions and the calculator catalog at a glance." nav={adminNav("/admin/analytics")}>
      {!features.db && (
        <div className="mb-6 rounded-lg border border-dashed bg-surface px-4 py-3 text-sm text-muted-foreground">
          Live usage metrics populate once the database is connected. The catalog breakdown below is real.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-2xl font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-4 text-sm font-semibold">Calculators by category</h2>
        <div className="space-y-3">
          {byCategory.map((c) => (
            <div key={c.label} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 text-muted-foreground">{c.label}</span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
                <div className="h-full rounded bg-primary" style={{ width: `${(c.total / maxTotal) * 100}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right font-mono text-xs">{c.live}/{c.total}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
