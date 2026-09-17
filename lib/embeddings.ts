/**
 * Voyage AI embeddings (Anthropic's recommended embeddings partner).
 * voyage-3 outputs 1024-dim vectors, matching CodeChunk.embedding vector(1024).
 */

const MODEL = "voyage-3";
export const EMBED_DIM = 1024;

export async function embed(texts: string[], inputType: "document" | "query" = "document"): Promise<number[][]> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new Error("VOYAGE_API_KEY not configured");
  if (texts.length === 0) return [];

  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ input: texts, model: MODEL, input_type: inputType }),
  });
  if (!res.ok) throw new Error(`Voyage error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.data as { embedding: number[] }[]).map((d) => d.embedding);
}

/** Format a vector as a pgvector literal, e.g. "[0.1,0.2,...]". */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
