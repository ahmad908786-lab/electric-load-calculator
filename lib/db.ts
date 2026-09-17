/**
 * Prisma client singleton. Lazily created and cached; returns null when no
 * DATABASE_URL is configured so callers can degrade gracefully.
 */
import { PrismaClient } from "@prisma/client";
import { features } from "./config";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient | null {
  if (!features.db) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
