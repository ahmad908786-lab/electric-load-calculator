import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { userNav } from "@/components/dashboard/nav-config";
import { SignedOut } from "@/components/dashboard/signed-out";
import { getCurrentUser } from "@/lib/auth";
import { listCalculationsAction } from "@/app/actions/calculations";
import { getCalculator } from "@/packages/registry";
import type { CalcResult } from "@/packages/calc-core/types";

export const metadata: Metadata = { title: "Dashboard · History" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) return <SignedOut title="History" nav={userNav("/dashboard/history")} />;

  const calcs = await listCalculationsAction();

  return (
    <DashboardShell title="Calculation history" subtitle="Every calculation you've saved." nav={userNav("/dashboard/history")}>
      {calcs.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No saved calculations yet. Hit “Save” on any calculator result.</p>
          <Link href="/calculators" className="btn-primary mt-1 h-9">Run a calculation</Link>
        </div>
      ) : (
        <div className="card divide-y">
          {calcs.map((c) => {
            const result = c.result as unknown as CalcResult;
            const primary = result?.summary?.find((s) => s.primary);
            const name = getCalculator(c.calculatorKey)?.name ?? c.calculatorKey;
            return (
              <Link key={c.id} href={`/calculators/${c.calculatorKey}`} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40">
                <span className="font-medium">{name}</span>
                <span className="flex items-center gap-3">
                  {primary && <span className="font-mono text-primary">{primary.value} {primary.unit}</span>}
                  <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-CA")}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
