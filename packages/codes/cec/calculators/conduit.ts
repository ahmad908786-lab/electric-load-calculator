import type { CalculatorDef, CalcResult } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, round } from "../../../calc-core/helpers";
import { CONDUCTOR_AREA_MM2, CONDUIT_EMT, maxFillPercent } from "../data/conduit";

const sizeOptions = Object.keys(CONDUCTOR_AREA_MM2).map((s) => ({ value: s, label: s.includes("/") || Number(s) < 300 ? `${s} AWG` : `${s} kcmil` }));

export const conduitFillCalc: CalculatorDef = {
  key: "conduit-fill",
  name: "Conduit Fill Calculator",
  category: "sizing",
  description:
    "Percent conduit fill and the minimum EMT trade size for a set of same-size conductors (CEC Rule 12-910, Tables 8–10).",
  standards: ["CEC"],
  fields: [
    { name: "size", label: "Conductor size", type: "select", default: "12", options: sizeOptions, group: "Conductors" },
    { name: "count", label: "Number of conductors", type: "number", default: 3, min: 1, max: 40, group: "Conductors", required: true },
    { name: "conduit", label: "Conduit size (to check)", type: "select", default: "3/4\"", options: CONDUIT_EMT.map((c) => ({ value: c.trade, label: `EMT ${c.trade}` })), group: "Conduit" },
  ],
  compute(inputs): CalcResult {
    const size = str(inputs, "size", "12");
    const count = Math.max(1, num(inputs, "count", 1));
    const conduitTrade = str(inputs, "conduit", '3/4"');

    const condArea = CONDUCTOR_AREA_MM2[size] ?? 0;
    const totalArea = condArea * count;
    const limit = maxFillPercent(count);
    const conduit = CONDUIT_EMT.find((c) => c.trade === conduitTrade) ?? CONDUIT_EMT[0];
    const fillPct = conduit.areaMm2 > 0 ? (totalArea / conduit.areaMm2) * 100 : 0;
    const pass = fillPct <= limit;

    // Minimum conduit that satisfies the fill limit.
    const requiredArea = totalArea / (limit / 100);
    const minConduit = CONDUIT_EMT.find((c) => c.areaMm2 >= requiredArea);

    return {
      summary: [
        { label: "Conduit fill", value: `${round(fillPct, 1)}`, unit: "%", primary: true, citation: { code: "CEC", ref: "Rule 12-910" } },
        { label: pass ? "Within limit" : "Over limit", value: pass ? "PASS" : "FAIL", unit: `≤ ${limit}%` },
        { label: "Min. EMT size", value: minConduit ? `EMT ${minConduit.trade}` : "> 4\"", citation: { code: "CEC", ref: "Table 6" } },
      ],
      steps: [
        { label: "Conductor area", value: `${condArea} mm²`, detail: `${size}, T90 Nylon`, citation: { code: "CEC", ref: "Table 10" } },
        { label: "Total conductor area", value: `${round(totalArea, 0)} mm²`, detail: `${count} × ${condArea} mm²` },
        { label: "Conduit internal area", value: `${conduit.areaMm2} mm²`, detail: `EMT ${conduit.trade}`, citation: { code: "CEC", ref: "Table 6" } },
        { label: "Fill limit", value: `${limit}%`, detail: count === 1 ? "1 conductor" : count === 2 ? "2 conductors" : "3 or more conductors", citation: { code: "CEC", ref: "Rule 12-910" } },
      ],
      citations: [
        { code: "CEC", ref: "Rule 12-910", note: "Maximum conduit fill (53% one, 31% two, 40% three or more conductors)." },
        { code: "CEC", ref: "Table 6", note: "Dimensions and percent area of conduit." },
        { code: "CEC", ref: "Table 10", note: "Cross-sectional area of insulated conductors." },
      ],
      warnings: [
        { level: "info", message: "Areas shown are for T90 Nylon in EMT and are approximate. Use CEC Table 10 for the exact insulation and Table 6/9 for the exact conduit type." },
      ],
      disclaimer: DISCLAIMER,
    };
  },
};
