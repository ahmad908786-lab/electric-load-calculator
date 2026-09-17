import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { userNav } from "@/components/dashboard/nav-config";
import { SignedOut } from "@/components/dashboard/signed-out";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/billing-actions";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PLANS, getPlan } from "@/lib/plans";

export const metadata: Metadata = { title: "Dashboard · Billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) return <SignedOut title="Billing" nav={userNav("/dashboard/billing")} />;

  const db = getDb();
  const sub = db ? await db.subscription.findUnique({ where: { userId: user.id } }) : null;
  const planId = (sub?.plan ?? "FREE").toLowerCase();
  const plan = getPlan(planId) ?? PLANS[0];
  const isPaid = planId !== "free";

  return (
    <DashboardShell title="Billing" subtitle="Manage your subscription and payment method." nav={userNav("/dashboard/billing")}>
      <div className="card max-w-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Current plan</p>
            <p className="text-2xl font-bold">{plan.name}</p>
            {sub?.status && sub.status !== "active" && <p className="text-xs text-warning">{sub.status}</p>}
          </div>
          {isPaid ? <ManageBillingButton /> : <UpgradeButton />}
        </div>
        <ul className="mt-5 space-y-2 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {f}</li>
          ))}
        </ul>
        {!isPaid && (
          <p className="mt-5 text-xs text-muted-foreground">
            Compare plans on the <Link href="/pricing" className="font-medium text-primary">pricing page</Link>. Billing is handled securely by Stripe.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
