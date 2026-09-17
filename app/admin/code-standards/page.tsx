import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";
import { IngestUpload } from "@/components/admin/ingest-upload";
import { CODE_STANDARDS } from "@/packages/registry";

export const metadata: Metadata = { title: "Admin · Code standards" };

export default function AdminCodeStandardsPage() {
  return (
    <DashboardShell title="Code standards" subtitle="Manage code editions and ingest a code book for AI search." nav={adminNav("/admin/code-standards")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b px-4 py-3 text-sm font-semibold">Editions</div>
          <div className="divide-y">
            {CODE_STANDARDS.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  <span className="font-medium">{s.region}</span>
                  <span className="block text-xs text-muted-foreground">{s.edition}</span>
                </span>
                <span className={`badge ${s.available ? "border-success/40 bg-success/10 text-success" : "border-border text-muted-foreground"}`}>{s.available ? "Active" : "Planned"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Ingest a code book (AI search)</h2>
          <IngestUpload />
        </div>
      </div>
    </DashboardShell>
  );
}
