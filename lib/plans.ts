/**
 * Subscription plans. Single source of truth for the pricing page, the paywall,
 * and (later) Stripe price IDs + the admin-editable PlanConfig. Prices reflect
 * the researched benchmarks for solo-pro / team engineering tools.
 */

export interface Plan {
  id: "free" | "pro" | "team";
  name: string;
  priceMonthly: number;
  priceYearly: number;
  tagline: string;
  featured?: boolean;
  /** Free-tier calculation cap (admin-configurable); null = unlimited. */
  freeCalcsPerMonth: number | null;
  aiQuestionsPerMonth: number | null;
  features: string[];
  cta: string;
  /** Stripe price IDs (filled from env / dashboard when billing is wired). */
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    tagline: "Try every calculator",
    freeCalcsPerMonth: 3,
    aiQuestionsPerMonth: 3,
    features: [
      "3 calculations / month",
      "3 AI code questions / month",
      "All calculators & inline citations",
      "Panel schedule builder",
    ],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    priceYearly: 290,
    tagline: "For working electricians & engineers",
    featured: true,
    freeCalcsPerMonth: null,
    aiQuestionsPerMonth: null,
    features: [
      "Unlimited calculations",
      "Unlimited AI code search",
      "Save projects & calculation history",
      "PDF & Excel export (no watermark)",
      "Priority calculator roadmap requests",
    ],
    cta: "Go Pro",
  },
  {
    id: "team",
    name: "Team",
    priceMonthly: 69,
    priceYearly: 690,
    tagline: "For firms & contractors",
    freeCalcsPerMonth: null,
    aiQuestionsPerMonth: null,
    features: [
      "Everything in Pro",
      "Up to 5 seats included",
      "Shared projects & templates",
      "Centralized billing",
      "Priority support",
    ],
    cta: "Start Team",
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
