import { NextResponse } from "next/server";
import { features } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { checkUsage, recordUsage } from "@/lib/usage";
import { retrieveContext } from "@/lib/rag";
import { answerLocally, type LocalAnswer } from "@/lib/assistant/engine";
import { streamText, streamAnthropic } from "@/lib/assistant/stream";

/**
 * AI code-search endpoint. Two modes:
 *   - JSON (default): { reply, citations, calc } — used by the homepage box.
 *   - Streaming (body.stream === true): a text/markdown stream — used by /assistant.
 *
 * With ANTHROPIC_API_KEY it answers with Claude (grounded by retrieveContext);
 * without a key it answers from the local CEC engine (knowledge base + live
 * calculators). The local engine is also the fallback if the LLM call fails.
 */

const SYSTEM_PROMPT = `You are VoltCalc's electrical code assistant for the Canadian Electrical Code (CEC, CSA C22.1) and the Ontario Electrical Safety Code (OESC).

- Answer practical electrical questions clearly, conversationally, and in Markdown (use headings, lists, tables and code blocks where helpful).
- Include the governing rule/table reference inline, e.g. "[CEC Rule 8-102]" or "[CEC Table 2]". You may quote the code directly.
- If a value depends on conditions (ambient temperature, grouping, termination rating), say so and point to the relevant table.
- End with a one-line reminder to verify against the adopted code edition and a licensed professional.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const calcHref = (key: string) => (key === "panel-schedule" ? "/panel-schedule" : `/calculators/${key}`);

function localMarkdown(a: LocalAnswer): string {
  return a.calc ? `${a.reply}\n\n**[Open the ${a.calc.label} →](${calcHref(a.calc.key)})**` : a.reply;
}

function streamResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  let messages: ChatMessage[] = [];
  let wantStream = false;
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    wantStream = body?.stream === true;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const last = messages.filter((m) => m.role === "user").at(-1)?.content?.trim() ?? "";
  if (!last) return NextResponse.json({ error: "Ask a question to get started." }, { status: 400 });

  // Meter AI questions for signed-in users on a limited plan (no-op otherwise).
  let userId: string | null = null;
  if (features.auth) {
    const user = await getCurrentUser();
    if (user) {
      userId = user.id;
      const usage = await checkUsage(user.id, "ai_question");
      if (!usage.allowed) {
        const msg = `You've reached your ${usage.limit} free AI questions this month. Upgrade to Pro for unlimited code search.`;
        return wantStream ? streamResponse(streamText(msg)) : NextResponse.json({ reply: msg, limitReached: true, configured: true });
      }
    }
  }
  if (userId) await recordUsage(userId, "ai_question");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.AI_MODEL || "claude-sonnet-5";
  const local = answerLocally(last);

  // No LLM key → local engine.
  if (!apiKey) {
    return wantStream
      ? streamResponse(streamText(localMarkdown(local)))
      : NextResponse.json({ reply: local.reply, citations: local.citations, calc: local.calc, configured: false, mode: "local" });
  }

  // LLM path.
  const context = await retrieveContext(last);
  const system = context ? `${SYSTEM_PROMPT}\n\nRetrieved code context (paraphrase or quote, cite by number):\n${context}` : SYSTEM_PROMPT;
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  if (wantStream) {
    try {
      return streamResponse(await streamAnthropic({ apiKey, model, system, messages: apiMessages }));
    } catch (err) {
      console.error("AI stream failed, using local fallback:", err);
      return streamResponse(streamText(localMarkdown(local)));
    }
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 1024, system, messages: apiMessages }),
    });
    if (!res.ok) {
      console.error(`Anthropic error ${res.status}:`, await res.text());
      return NextResponse.json({ reply: local.reply, citations: local.citations, calc: local.calc, configured: false, mode: "local-fallback" });
    }
    const data = await res.json();
    const reply = (data?.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n") || "No answer generated.";
    return NextResponse.json({ reply, configured: true });
  } catch (err) {
    console.error("AI request failed:", err);
    return NextResponse.json({ reply: local.reply, citations: local.citations, calc: local.calc, configured: false, mode: "local-fallback" });
  }
}

export const runtime = "nodejs";
