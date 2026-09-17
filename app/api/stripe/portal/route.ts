import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { APP_URL } from "@/lib/config";

/** Opens the Stripe billing portal for the current user. */
export async function POST() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Billing is not configured." }, { status: 501 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not configured." }, { status: 501 });

  const sub = await db.subscription.findUnique({ where: { userId: user.id } });
  if (!sub?.stripeCustomerId) return NextResponse.json({ error: "No billing account yet." }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${APP_URL}/dashboard`,
  });
  return NextResponse.json({ url: session.url });
}
