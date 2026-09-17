import type { Citation } from "@/packages/calc-core/types";
import { getCalculator, codeContext } from "@/packages/registry";
import { KNOWLEDGE } from "./knowledge";

export interface LocalAnswer {
  reply: string;
  citations: Citation[];
  calc?: { key: string; label: string };
}

const ctx = codeContext("CEC");
const DISCLAIMER_LINE = "\n\n_Always verify against the adopted code edition and a licensed professional._";

const reCurrent = /(\d+(?:\.\d+)?)\s*a(?:mp(?:ere)?s?)?\b/i;
const reArea = /(\d+(?:\.\d+)?)\s*(?:m²|m2|sq\.?\s*m|square\s*met\w*)/i;
const reLength = /(\d+(?:\.\d+)?)\s*m(?:etre|eter)?s?\b/i;

function summaryVal(result: ReturnType<NonNullable<ReturnType<typeof getCalculator>>["compute"]>, test: RegExp | "primary") {
  const s = test === "primary" ? result.summary.find((x) => x.primary) : result.summary.find((x) => test.test(x.label));
  return s ? `${s.value}${s.unit ? " " + s.unit : ""}` : "";
}

/** Try to answer a sizing question by actually running the relevant calculator. */
function tryCompute(q: string): LocalAnswer | null {
  const currentM = q.match(reCurrent);
  const areaM = q.match(reArea);
  const lengthM = q.replace(reArea, "").match(reLength);
  const material = /alumin/i.test(q) ? "al" : "cu";
  const materialLabel = material === "al" ? "aluminum" : "copper";

  // Conductor / cable sizing
  const wantsConductor = /(conductor|wire|cable|feeder|circuit)/i.test(q) && /(size|gauge|awg|kcmil|big|select|need|use)/i.test(q);
  if (currentM && wantsConductor) {
    const calc = getCalculator("cable-size");
    if (calc) {
      const current = parseFloat(currentM[1]);
      const length = lengthM ? parseFloat(lengthM[1]) : 30;
      const result = calc.compute(
        { current, voltage: 240, system: "1ph", material, insulation: "90", termination: "75", install: "raceway", ambient: 30, ccc: 3, length, vdLimit: 3 },
        ctx
      );
      const size = summaryVal(result, "primary");
      const usable = summaryVal(result, /ampacity/i);
      const vd = summaryVal(result, /voltage drop/i);
      return {
        reply:
          `For a **${current} A** load over **${length} m** of ${materialLabel} conductor, use **${size}**. ` +
          `That satisfies both the ampacity requirement (usable ≈ ${usable}) and the 3% voltage-drop limit (≈ ${vd}) [CEC Table ${material === "al" ? "4" : "2"}, Rule 8-102]. ` +
          `\n\nAssumes 240 V single-phase, 90 °C insulation into 75 °C terminations, in a raceway at 30 °C. Change any of these in the Cable Size calculator.` +
          DISCLAIMER_LINE,
        citations: result.citations.slice(0, 4),
        calc: { key: "cable-size", label: "Cable Size calculator" },
      };
    }
  }

  // Residential service / load sizing
  const wantsService = /(service|load)/i.test(q) && /(house|home|dwelling|residential|apartment)/i.test(q);
  if (areaM && wantsService) {
    const calc = getCalculator("dwelling-load");
    if (calc) {
      const area = parseFloat(areaM[1]);
      const heat = /(heat|baseboard|furnace)/i.test(q);
      const result = calc.compute(
        { floorArea: area, voltage: 240, heating: heat ? 10000 : 0, ac: 0, rangeKw: 12, waterHeater: 3000, evCharger: 0, other: 0 },
        ctx
      );
      const service = summaryVal(result, "primary");
      const load = summaryVal(result, /calculated load/i);
      return {
        reply:
          `A **${area} m²** dwelling${heat ? " with electric heat" : ""} works out to roughly a **${service}** service ` +
          `(calculated load ≈ ${load}) [CEC Rule 8-200], assuming a 12 kW range and a 3 kW water heater. ` +
          `Adjust the heating, range and other loads in the Residential Load calculator.` +
          DISCLAIMER_LINE,
        citations: result.citations.slice(0, 3),
        calc: { key: "dwelling-load", label: "Residential Load calculator" },
      };
    }
  }

  return null;
}

/** Answer a question locally (no API key): live calculation, else knowledge base, else guidance. */
export function answerLocally(question: string): LocalAnswer {
  const computed = tryCompute(question);
  if (computed) return computed;

  const ql = question.toLowerCase();
  let best: (typeof KNOWLEDGE)[number] | null = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE) {
    let score = entry.keywords.filter((k) => ql.includes(k)).length;
    score += (entry.patterns ?? []).filter((p) => p.test(question)).length * 2;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (best && bestScore >= 1) {
    return { reply: best.answer + DISCLAIMER_LINE, citations: best.citations, calc: best.calc };
  }

  return {
    reply:
      "I can answer questions about **voltage drop, ampacity and derating, load and service sizing, breakers and fuses, motors, conduit fill, transformers, fault current, arc flash and power factor** — each with the governing CEC rule.\n\n" +
      "Try: *“What size copper conductor for a 60 A feeder at 40 m?”*, *“How is voltage drop limited by the CEC?”*, or *“Minimum service for a 200 m² house with electric heat?”* — or open a calculator from the toolbox.",
    citations: [],
  };
}
