/**
 * Retrieval-augmented code search. Ingests the code book into pgvector and
 * retrieves the most relevant passages to ground the AI assistant's answers.
 * All functions no-op / throw clearly when the DB or Voyage key is absent.
 *
 * OCR of image-only figures/tables (≈44 in the OESC PDF) is a documented
 * enhancement — extend `extractPdfText` to send image pages to a vision model.
 */
import { randomUUID } from "crypto";
import { getDb } from "./db";
import { features } from "./config";
import { embed, toVectorLiteral } from "./embeddings";
import { CODE_STANDARDS } from "@/packages/registry";

const RULE_RE = /\bRule\s+(\d+-\d+[A-Za-z]?)/;
const TABLE_RE = /\bTable\s+(\d+[A-Za-z]?)/;

export interface Chunk {
  content: string;
  section: string | null;
  table: string | null;
  page: number | null;
}

/** Split code text into ~1200-char chunks, tagging the governing rule/table. */
export function chunkText(text: string, maxLen = 1200): Chunk[] {
  const paras = text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const chunks: Chunk[] = [];
  let buf = "";
  const flush = () => {
    const content = buf.trim();
    if (!content) return;
    chunks.push({ content, section: RULE_RE.exec(content)?.[1] ? `Rule ${RULE_RE.exec(content)![1]}` : null, table: TABLE_RE.exec(content)?.[1] ? `Table ${TABLE_RE.exec(content)![1]}` : null, page: null });
    buf = "";
  };
  for (const p of paras) {
    if (buf.length + p.length > maxLen) flush();
    buf += (buf ? " " : "") + p;
  }
  flush();
  return chunks;
}

async function standardIdFor(code: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const meta = CODE_STANDARDS.find((s) => s.id === code) ?? CODE_STANDARDS[0];
  const existing = await db.codeStandard.findUnique({ where: { code } });
  if (existing) return existing.id;
  const created = await db.codeStandard.create({ data: { code, region: meta.region, edition: meta.edition, available: true } });
  return created.id;
}

/** Ingest raw code text: chunk → embed → store. Returns the chunk count. */
export async function ingestText(code: string, text: string): Promise<number> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");
  const standardId = await standardIdFor(code);
  if (!standardId) throw new Error("Could not resolve code standard");

  const chunks = chunkText(text);
  if (chunks.length === 0) return 0;

  // Replace any prior ingest for this standard.
  await db.$executeRaw`DELETE FROM "CodeChunk" WHERE "standardId" = ${standardId}`;

  const BATCH = 64;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const slice = chunks.slice(i, i + BATCH);
    const vectors = await embed(slice.map((c) => c.content), "document");
    for (let j = 0; j < slice.length; j++) {
      const c = slice[j];
      const vec = toVectorLiteral(vectors[j]);
      await db.$executeRaw`
        INSERT INTO "CodeChunk" ("id","standardId","section","table","page","content","embedding")
        VALUES (${randomUUID()}, ${standardId}, ${c.section}, ${c.table}, ${c.page}, ${c.content}, ${vec}::vector)`;
    }
  }
  return chunks.length;
}

/** Retrieve the top-k relevant passages for a question, formatted for the model. */
export async function retrieveContext(question: string, code = "CEC", k = 6): Promise<string> {
  if (!features.rag) return "";
  const db = getDb();
  if (!db) return "";
  const standardId = await standardIdFor(code);
  if (!standardId) return "";

  const [qvec] = await embed([question], "query");
  const rows = await db.$queryRaw<{ content: string; section: string | null; table: string | null }[]>`
    SELECT "content","section","table" FROM "CodeChunk"
    WHERE "standardId" = ${standardId}
    ORDER BY "embedding" <=> ${toVectorLiteral(qvec)}::vector
    LIMIT ${k}`;

  return rows
    .map((r) => {
      const ref = r.section || (r.table ? `Table ${r.table}` : "");
      return `${ref ? `[${code} ${ref}] ` : ""}${r.content}`;
    })
    .join("\n\n");
}

/** Extract text from a PDF (via unpdf, lazily imported). */
export async function extractPdfText(data: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}
