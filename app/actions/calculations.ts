"use server";

import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { checkUsage, recordUsage } from "@/lib/usage";

export interface SaveResult {
  ok: boolean;
  id?: string;
  error?: string;
  limitReached?: boolean;
}

export async function saveCalculationAction(input: {
  calculatorKey: string;
  inputs: unknown;
  result: unknown;
  projectId?: string;
}): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to save calculations." };
  const db = getDb();
  if (!db) return { ok: false, error: "Database not configured." };

  const usage = await checkUsage(user.id, "calculation");
  if (!usage.allowed) {
    return { ok: false, limitReached: true, error: `You've used all ${usage.limit} free calculations this month. Upgrade to Pro for unlimited.` };
  }

  const row = await db.calculation.create({
    data: {
      userId: user.id,
      projectId: input.projectId ?? null,
      calculatorKey: input.calculatorKey,
      inputs: input.inputs as object,
      result: input.result as object,
    },
  });
  await recordUsage(user.id, "calculation", input.calculatorKey);
  return { ok: true, id: row.id };
}

export async function listCalculationsAction() {
  const user = await getCurrentUser();
  const db = getDb();
  if (!user || !db) return [];
  return db.calculation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
