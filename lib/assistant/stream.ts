/** Streaming helpers for the assistant: simulated local streaming + Anthropic SSE. */

const encoder = new TextEncoder();

/** Stream a finished string out in small chunks to mimic token-by-token typing. */
export function streamText(text: string): ReadableStream<Uint8Array> {
  const tokens = text.split(/(\s+)/); // keep whitespace between words
  let i = 0;
  return new ReadableStream({
    async pull(controller) {
      if (i >= tokens.length) {
        controller.close();
        return;
      }
      const chunk = tokens.slice(i, i + 2).join("");
      i += 2;
      controller.enqueue(encoder.encode(chunk));
      await new Promise((r) => setTimeout(r, 14));
    },
  });
}

interface AnthropicOpts {
  apiKey: string;
  model: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
}

/** Stream text deltas from the Anthropic Messages API. Throws if the request fails to start. */
export async function streamAnthropic(opts: AnthropicOpts): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: opts.model, max_tokens: 1024, system: opts.system, stream: true, messages: opts.messages }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Anthropic error ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const payload = t.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
            controller.enqueue(encoder.encode(ev.delta.text));
          }
        } catch {
          /* ignore keep-alive / partial lines */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}
