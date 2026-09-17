import { NextResponse } from "next/server";
import { getStripe, priceId } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { APP_URL } from "@/lib/config";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Billing is not configured." }, { status: 501 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured." }, { status: 501 });

  const { plan = "pro", interval = "monthly" } = await req.json().catch(() => ({}));
  const price = priceId(plan, interval);
  if (!price) return NextResponse.json({ error: `No price configured for ${plan}/${interval}.` }, { status: 400 });

  let sub = await db.subscription.findUnique({ where: { userId: user.id } });
  let customerId = sub?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
    customerId = customer.id;
    sub = await db.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, stripeCustomerId: customerId },
      update: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { userId: user.id, plan: plan.toUpperCase() } },
    success_url: `${APP_URL}/dashboard?checkout=success`,
    cancel_url: `${APP_URL}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
