import { NextResponse } from "next/server";
import { features } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { ingestText, extractPdfText } from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Admin: ingest a code book into the RAG store.
 * Accepts multipart (file=PDF, standard=CEC) or JSON { text, standard }.
 */
export async function POST(req: Request) {
  if (!features.rag) {
    return NextResponse.json({ error: "RAG isn't configured (needs DATABASE_URL + VOYAGE_API_KEY)." }, { status: 501 });
  }
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let text = "";
    let standard = "CEC";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      standard = String(form.get("standard") ?? "CEC");
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      text = await extractPdfText(new Uint8Array(await file.arrayBuffer()));
    } else {
      const body = await req.json();
      standard = String(body.standard ?? "CEC");
      text = String(body.text ?? "");
    }

    if (text.trim().length < 20) return NextResponse.json({ error: "No extractable text found." }, { status: 400 });

    const chunks = await ingestText(standard, text);
    return NextResponse.json({ ok: true, chunks, standard });
  } catch (err) {
    return NextResponse.json({ error: `Ingestion failed: ${String(err)}` }, { status: 500 });
  }
}
