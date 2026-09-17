import type { Metadata } from "next";
import Link from "next/link";
import { FileText, LayoutDashboard } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { userNav } from "@/components/dashboard/nav-config";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/billing-actions";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { features } from "@/lib/config";
import { checkUsage } from "@/lib/usage";
import { listCalculationsAction } from "@/app/actions/calculations";
import { getCalculator } from "@/packages/registry";
import type { CalcResult } from "@/packages/calc-core/types";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const nav = userNav("/dashboard");

function UsageBar({ used, limit }: { used: number; limit: number | null }) {
  if (limit === null) return <p className="mt-1 text-2xl font-bold">Unlimited</p>;
  return (
    <>
      <p className="mt-1 text-2xl font-bold">{used}<span className="text-base font-medium text-muted-foreground"> / {limit}</span></p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Not signed in (or auth not configured) → preview.
  if (!user) {
    return (
      <DashboardShell
        title="Dashboard"
        subtitle="Your calculations, projects and subscription in one place."
        nav={nav}
        banner={
          <div className="mb-6 rounded-lg border border-dashed bg-surface px-4 py-3 text-sm text-muted-foreground">
            {features.auth ? "Sign in to view your dashboard." : "Preview dashboard. Accounts and saved work activate once authentication and the database are connected."}
          </div>
        }
      >
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <LayoutDashboard className="h-9 w-9 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Sign in to save calculations, build projects and manage your subscription.</p>
          <div className="flex gap-2">
            <Link href="/login" className="btn-primary">Sign in</Link>
            <Link href="/signup" className="btn-outline">Create account</Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const db = getDb();
  const sub = db ? await db.subscription.findUnique({ where: { userId: user.id } }) : null;
  const planLabel = { FREE: "Free", PRO: "Pro", TEAM: "Team" }[sub?.plan ?? "FREE"];
  const calcUsage = await checkUsage(user.id, "calculation");
  const aiUsage = await checkUsage(user.id, "ai_question");
  const calcs = await listCalculationsAction();

  return (
    <DashboardShell title={`Welcome back${user.name ? ", " + user.name.split(" ")[0] : ""}`} subtitle="Your calculations, projects and subscription in one place." nav={nav}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-medium text-muted-foreground">Current plan</p>
          <p className="mt-1 text-2xl font-bold">{planLabel}</p>
          <div className="mt-2">{sub?.plan && sub.plan !== "FREE" ? <ManageBillingButton /> : <UpgradeButton />}</div>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-muted-foreground">Calculations this month</p>
          <UsageBar used={calcUsage.used} limit={calcUsage.limit} />
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-muted-foreground">AI questions this month</p>
          <UsageBar used={aiUsage.used} limit={aiUsage.limit} />
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-3 text-sm font-semibold">Recent calculations</h2>
        {calcs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No calculations saved yet.</p>
            <Link href="/calculators" className="btn-primary mt-1 h-9">Run a calculation</Link>
          </div>
        ) : (
          <ul className="divide-y">
            {calcs.map((c) => {
              const result = c.result as unknown as CalcResult;
              const primary = result?.summary?.find((s) => s.primary);
              const name = getCalculator(c.calculatorKey)?.name ?? c.calculatorKey;
              return (
                <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="flex items-center gap-3">
                    {primary && <span className="font-mono text-primary">{primary.value} {primary.unit}</span>}
                    <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-CA")}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
