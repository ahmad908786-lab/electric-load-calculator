import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/** Stripe webhook: keeps the local Subscription in sync with Stripe. */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Not configured." }, { status: 501 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "No database." }, { status: 501 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${String(err)}` }, { status: 400 });
  }

  const planFrom = (m?: Stripe.Metadata | null) => {
    const p = (m?.plan ?? "").toUpperCase();
    return p === "PRO" || p === "TEAM" ? p : undefined;
  };

  try {
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const s = event.data.object as Stripe.Subscription;
      const item = s.items.data[0];
      await db.subscription.updateMany({
        where: { stripeCustomerId: String(s.customer) },
        data: {
          stripeSubscriptionId: s.id,
          status: s.status,
          plan: planFrom(s.metadata) ?? undefined,
          currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : undefined,
        },
      });
    } else if (event.type === "customer.subscription.deleted") {
      const s = event.data.object as Stripe.Subscription;
      await db.subscription.updateMany({
        where: { stripeCustomerId: String(s.customer) },
        data: { status: "canceled", plan: "FREE" },
      });
    }
  } catch (err) {
    return NextResponse.json({ error: `Handler error: ${String(err)}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
