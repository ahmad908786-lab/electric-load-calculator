/**
 * Minimal, dependency-light session auth: a signed (HMAC-SHA256) httpOnly
 * cookie carrying the user id. Real credentials live in the database (bcrypt
 * hashes). Everything no-ops gracefully when auth isn't configured.
 *
 * This is intentionally small and swappable — drop in Auth.js later without
 * changing callers of getCurrentUser().
 */
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { AUTH_SECRET, features } from "./config";
import { getDb } from "./db";

const COOKIE = "vc_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
}

export function createToken(userId: string): string {
  const body = b64url(JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE * 1000 }));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined): string | null {
  if (!token || !AUTH_SECRET) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!uid || typeof exp !== "number" || exp < Date.now()) return null;
    return uid as string;
  } catch {
    return null;
  }
}

/** Set the session cookie — call from a Server Action or Route Handler. */
export async function setSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE, createToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
}

/** Read the current user from the session cookie, or null. Safe to call anywhere server-side. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!features.auth) return null;
  const db = getDb();
  if (!db) return null;
  const store = await cookies();
  const uid = verifyToken(store.get(COOKIE)?.value);
  if (!uid) return null;
  const user = await db.user.findUnique({ where: { id: uid }, select: { id: true, name: true, email: true, role: true } });
  return user ?? null;
}
