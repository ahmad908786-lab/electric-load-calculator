/**
 * Central feature-flag surface. Every optional integration checks these so the
 * app runs fully offline and lights up capabilities as env vars are added.
 */

export const features = {
  get db() {
    return !!process.env.DATABASE_URL;
  },
  get auth() {
    return !!process.env.DATABASE_URL && !!process.env.AUTH_SECRET;
  },
  get stripe() {
    return !!process.env.STRIPE_SECRET_KEY;
  },
  get ai() {
    return !!process.env.ANTHROPIC_API_KEY;
  },
  get rag() {
    return !!process.env.DATABASE_URL && !!process.env.VOYAGE_API_KEY;
  },
} as const;

export const AUTH_SECRET = process.env.AUTH_SECRET ?? "";
export const AI_MODEL = process.env.AI_MODEL || "claude-sonnet-5";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
