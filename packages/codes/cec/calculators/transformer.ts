import type { CalculatorDef, CalcResult } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, bool, round } from "../../../calc-core/helpers";
import { nextTransformerKva } from "../data/equipment";
import { nextStandardOcpd, prevStandardOcpd } from "../data/corrections";

export const transformerSizingCalc: CalculatorDef = {
  key: "transformer-sizing",
  name: "Transformer Sizing Calculator",
  category: "sizing",
  description:
    "Selects a standard transformer kVA for a load, with primary/secondary full-load current and overcurrent protection (CEC Section 26).",
  standards: ["CEC"],
  fields: [
    { name: "phase", label: "Phase", type: "select", default: "3ph", options: [{ value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }], group: "Load" },
    { name: "loadKva", label: "Connected load", type: "number", unit: "kVA", default: 100, min: 0.1, group: "Load", required: true },
    { name: "growth", label: "Spare / growth", type: "number", unit: "%", default: 25, min: 0, max: 100, group: "Load", help: "Extra capacity above the present load." },
    { name: "primaryV", label: "Primary voltage", type: "number", unit: "V", default: 600, min: 1, group: "Voltages" },
    { name: "secondaryV", label: "Secondary voltage", type: "number", unit: "V", default: 208, min: 1, group: "Voltages" },
  ],
  compute(inputs): CalcResult {
    const phase = str(inputs, "phase", "3ph") as "1ph" | "3ph";
    const loadKva = num(inputs, "loadKva", 0);
    const growth = num(inputs, "growth", 0);
    const primaryV = num(inputs, "primaryV", 1);
    const secondaryV = num(inputs, "secondaryV", 1);

    const designKva = loadKva * (1 + growth / 100);
    const txKva = nextTransformerKva(designKva, phase);
    const f = phase === "3ph" ? Math.sqrt(3) : 1;
    const primaryFla = (txKva * 1000) / (primaryV * f);
    const secondaryFla = (txKva * 1000) / (secondaryV * f);
    const primaryOcpd = nextStandardOcpd(primaryFla * 1.25);
    const secondaryOcpd = prevStandardOcpd(secondaryFla * 1.25);

    return {
      summary: [
        { label: "Transformer size", value: `${txKva}`, unit: "kVA", primary: true },
        { label: "Primary FLA", value: `${round(primaryFla, 1)}`, unit: "A" },
        { label: "Secondary FLA", value: `${round(secondaryFla, 1)}`, unit: "A" },
        { label: "Primary OCPD", value: `${primaryOcpd}`, unit: "A", citation: { code: "CEC", ref: "Rule 26-250" } },
      ],
      steps: [
        { label: "Design load", value: `${round(designKva, 1)} kVA`, detail: `${loadKva} kVA + ${growth}% growth` },
        { label: "Standard size", value: `${txKva} kVA`, detail: "next standard rating" },
        { label: "Primary FLA", value: `${round(primaryFla, 1)} A`, detail: phase === "3ph" ? "kVA·1000 / (√3·Vp)" : "kVA·1000 / Vp" },
        { label: "Secondary FLA", value: `${round(secondaryFla, 1)} A` },
        { label: "Primary protection", value: `${primaryOcpd} A`, detail: "≈125% of primary FLA", citation: { code: "CEC", ref: "Rule 26-250" } },
      ],
      citations: [
        { code: "CEC", ref: "Rule 26-250", note: "Overcurrent protection of transformer primary." },
        { code: "CEC", ref: "Rule 26-254", note: "Secondary overcurrent protection." },
        { code: "CEC", ref: "Rule 26-256", note: "Transformer conductor sizing." },
      ],
      warnings: [
        { level: "info", message: "Primary-only protection limits depend on transformer %Z and whether the installation is supervised (Rule 26-250). Confirm the exact percentage for your case." },
      ],
      disclaimer: DISCLAIMER,
    };
  },
};

export const fuseSizeCalc: CalculatorDef = {
  key: "fuse-size",
  name: "Fuse Size Calculator",
  category: "sizing",
  description: "Standard fuse rating for a load, with the continuous-load factor (CEC Rule 8-104, 14-212).",
  standards: ["CEC"],
  fields: [
    { name: "current", label: "Load current", type: "number", unit: "A", default: 40, min: 0.1, required: true },
    { name: "continuous", label: "Continuous load (≥ 3 h)", type: "boolean", default: false, help: "Adds the 125% factor." },
    { name: "roundUp", label: "Round up to next standard size", type: "boolean", default: true },
  ],
  compute(inputs): CalcResult {
    const current = num(inputs, "current", 0);
    const continuous = bool(inputs, "continuous", false);
    const roundUp = bool(inputs, "roundUp", true);
    const required = continuous ? current * 1.25 : current;
    const rating = roundUp ? nextStandardOcpd(required) : prevStandardOcpd(required);
    return {
      summary: [
        { label: "Fuse rating", value: `${rating}`, unit: "A", primary: true, citation: { code: "CEC", ref: "Rule 14-212" } },
        { label: "Required rating", value: `${round(required, 1)}`, unit: "A" },
      ],
      steps: [
        { label: "Required rating", value: `${round(required, 1)} A`, detail: continuous ? `${round(current, 1)} A × 1.25` : `${round(current, 1)} A`, citation: continuous ? { code: "CEC", ref: "Rule 8-104" } : undefined },
        { label: "Standard fuse", value: `${rating} A`, citation: { code: "CEC", ref: "Rule 14-212" } },
      ],
      citations: [
        { code: "CEC", ref: "Rule 8-104", note: "Continuous-load factor." },
        { code: "CEC", ref: "Rule 14-212", note: "Rating of fuses." },
      ],
      warnings: [{ level: "info", message: "Fuse class (e.g., CC, J, RK5, RK1) and interrupting rating must suit the application and available fault current." }],
      disclaimer: DISCLAIMER,
    };
  },
};
