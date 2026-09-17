"use client";

import { useState } from "react";
import { ArrowUpRight, CreditCard, Loader2 } from "lucide-react";

async function post(url: string, body?: unknown): Promise<{ url?: string; error?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json().catch(() => ({ error: "Request failed" }));
}

export function UpgradeButton({ plan = "pro" }: { plan?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button
        className="btn-primary h-9"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          const r = await post("/api/stripe/checkout", { plan, interval: "monthly" });
          if (r.url) window.location.href = r.url;
          else {
            setErr(r.error ?? "Billing not available.");
            setBusy(false);
          }
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Upgrade to Pro <ArrowUpRight className="h-3.5 w-3.5" /></>}
      </button>
      {err && <p className="mt-1 text-xs text-muted-foreground">{err}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn-outline h-9 gap-1.5"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const r = await post("/api/stripe/portal");
        if (r.url) window.location.href = r.url;
        else setBusy(false);
      }}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" /> Manage billing</>}
    </button>
  );
}
