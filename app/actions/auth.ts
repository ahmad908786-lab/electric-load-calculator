"use server";

import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { features } from "@/lib/config";
import { setSession, clearSession } from "@/lib/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function signUpAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!features.auth) return { ok: false, error: "Authentication isn't configured yet (needs DATABASE_URL + AUTH_SECRET)." };
  const db = getDb();
  if (!db) return { ok: false, error: "Database not configured." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!emailRe.test(email)) return { ok: false, error: "Enter a valid email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists." };

  const user = await db.user.create({
    data: { name: name || null, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  await db.subscription.create({ data: { userId: user.id, plan: "FREE" } });
  await setSession(user.id);
  return { ok: true };
}

export async function signInAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!features.auth) return { ok: false, error: "Authentication isn't configured yet (needs DATABASE_URL + AUTH_SECRET)." };
  const db = getDb();
  if (!db) return { ok: false, error: "Database not configured." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }
  await setSession(user.id);
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  await clearSession();
}
