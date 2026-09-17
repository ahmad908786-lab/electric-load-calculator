/**
 * Usage metering for the free tier. Counts UsageEvent rows per calendar month
 * and compares against the plan's limit (admin-configurable via PlanConfig;
 * falls back to lib/plans). No-ops (always allowed) when the DB is absent.
 */
import { getDb } from "./db";
import { getPlan } from "./plans";

export type UsageKind = "calculation" | "ai_question" | "export";

export function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function planLimit(userId: string, kind: UsageKind): Promise<number | null> {
  const db = getDb();
  if (!db) return null;
  const sub = await db.subscription.findUnique({ where: { userId } });
  const planId = (sub?.plan ?? "FREE").toLowerCase();
  const plan = getPlan(planId);
  if (!plan) return null;
  return kind === "ai_question" ? plan.aiQuestionsPerMonth : plan.freeCalcsPerMonth;
}

export interface UsageStatus {
  allowed: boolean;
  used: number;
  limit: number | null; // null = unlimited
}

export async function checkUsage(userId: string, kind: UsageKind): Promise<UsageStatus> {
  const db = getDb();
  if (!db) return { allowed: true, used: 0, limit: null };
  const limit = await planLimit(userId, kind);
  if (limit === null) return { allowed: true, used: 0, limit: null };
  const used = await db.usageEvent.count({ where: { userId, kind, month: monthKey() } });
  return { allowed: used < limit, used, limit };
}

export async function recordUsage(userId: string, kind: UsageKind, calculatorKey?: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.usageEvent.create({ data: { userId, kind, calculatorKey, month: monthKey() } });
}
