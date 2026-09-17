import Stripe from "stripe";
import { features } from "./config";

let cached: Stripe | null = null;

/** Stripe client, or null when STRIPE_SECRET_KEY isn't set. */
export function getStripe(): Stripe | null {
  if (!features.stripe) return null;
  if (!cached) cached = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return cached;
}

/** Resolve the Stripe price id for a plan + interval from env. */
export function priceId(plan: string, interval: "monthly" | "yearly"): string | undefined {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key];
}
