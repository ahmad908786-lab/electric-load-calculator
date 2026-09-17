import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for VoltCalc. Start free with 3 calculations a month; upgrade for unlimited calculations, exports and AI code search.",
};

export default function PricingPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple, honest pricing</h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need unlimited calculations, exports and AI code search. Cancel anytime.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`card relative flex flex-col p-6 ${plan.featured ? "border-primary ring-1 ring-primary" : ""}`}>
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge border-primary bg-primary text-primary-foreground">Most popular</span>
            )}
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="text-sm text-muted-foreground">{plan.tagline}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">${plan.priceMonthly}</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
            {plan.priceYearly > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">or ${plan.priceYearly}/year — save ${plan.priceMonthly * 12 - plan.priceYearly}</p>
            )}
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Link href={plan.id === "free" ? "/signup" : `/signup?plan=${plan.id}`} className={`mt-6 ${plan.featured ? "btn-primary" : "btn-outline"} w-full`}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
        Prices in USD. The free-tier calculation limit is configurable by the operator. Billing is handled securely by Stripe.
      </p>
    </div>
  );
}
