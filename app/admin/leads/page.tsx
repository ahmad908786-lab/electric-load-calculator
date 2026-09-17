import type { Metadata } from "next";
import { Inbox, Mail, Wrench } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/components/dashboard/nav-config";
import { getDb } from "@/lib/db";
import { features } from "@/lib/config";

export const metadata: Metadata = { title: "Admin · Leads" };
export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const db = getDb();
  const leads = features.db && db ? await db.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 100 }) : [];

  return (
    <DashboardShell title="Leads" subtitle="Contact and 'hire us' requests from the site." nav={adminNav("/admin/leads")}>
      {leads.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{features.db ? "No leads yet." : "Leads submitted from the contact form will appear here once the database is connected."}</p>
        </div>
      ) : (
        <div className="card divide-y">
          {leads.map((l) => (
            <div key={l.id} className="flex items-start gap-3 px-4 py-3">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${l.type === "hire" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}>
                {l.type === "hire" ? <Wrench className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{l.name} <span className="font-normal text-muted-foreground">· {l.email}</span></p>
                <p className="mt-0.5 text-sm text-muted-foreground">{l.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString("en-CA")} · {l.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
