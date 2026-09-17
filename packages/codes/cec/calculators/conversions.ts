import type { CalculatorDef, CalcResult } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, bool, round } from "../../../calc-core/helpers";
import { CONDUCTORS, ampacity } from "../data/conductors";
import type { Material, TempRating } from "../data/conductors";
import { nextStandardOcpd, prevStandardOcpd } from "../data/corrections";

const phaseField = {
  name: "system", label: "System", type: "select" as const, default: "3ph",
  options: [{ value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }],
};

export const kvaToAmpCalc: CalculatorDef = {
  key: "kva-to-amp",
  name: "kVA to Amps Calculator",
  category: "conversion",
  description: "Convert apparent power (kVA) to line current for single- or three-phase systems.",
  standards: ["CEC", "NEC"],
  fields: [
    { ...phaseField },
    { name: "kva", label: "Apparent power", type: "number", unit: "kVA", default: 75, min: 0, required: true },
    { name: "voltage", label: "Line voltage", type: "number", unit: "V", default: 208, min: 1, required: true },
  ],
  compute(inputs): CalcResult {
    const system = str(inputs, "system", "3ph");
    const kva = num(inputs, "kva", 0);
    const voltage = num(inputs, "voltage", 1);
    const f = system === "3ph" ? Math.sqrt(3) : 1;
    const amps = (kva * 1000) / (voltage * f);
    return {
      summary: [{ label: "Line current", value: `${round(amps, 1)}`, unit: "A", primary: true }],
      steps: [{ label: "Formula", value: system === "3ph" ? "I = kVA·1000 / (V·√3)" : "I = kVA·1000 / V" }],
      citations: [],
      warnings: [],
      disclaimer: DISCLAIMER,
    };
  },
};

export const kwToAmpCalc: CalculatorDef = {
  key: "kw-to-amp",
  name: "kW to Amps Calculator",
  category: "conversion",
  description: "Convert real power (kW) to current using the power factor, single- or three-phase.",
  standards: ["CEC", "NEC"],
  fields: [
    { ...phaseField },
    { name: "kw", label: "Real power", type: "number", unit: "kW", default: 50, min: 0, required: true },
    { name: "voltage", label: "Line voltage", type: "number", unit: "V", default: 208, min: 1, required: true },
    { name: "pf", label: "Power factor", type: "number", default: 0.9, min: 0.1, max: 1, step: 0.01 },
  ],
  compute(inputs): CalcResult {
    const system = str(inputs, "system", "3ph");
    const kw = num(inputs, "kw", 0);
    const voltage = num(inputs, "voltage", 1);
    const pf = Math.max(0.01, num(inputs, "pf", 0.9));
    const f = system === "3ph" ? Math.sqrt(3) : 1;
    const amps = (kw * 1000) / (voltage * f * pf);
    return {
      summary: [
        { label: "Line current", value: `${round(amps, 1)}`, unit: "A", primary: true },
        { label: "Apparent power", value: `${round(kw / pf, 1)}`, unit: "kVA" },
      ],
      steps: [{ label: "Formula", value: system === "3ph" ? "I = kW·1000 / (V·√3·PF)" : "I = kW·1000 / (V·PF)" }],
      citations: [],
      warnings: [],
      disclaimer: DISCLAIMER,
    };
  },
};

export const ampacityLookupCalc: CalculatorDef = {
  key: "ampacity",
  name: "Ampacity Lookup",
  category: "sizing",
  description: "Allowable ampacity of a copper or aluminum conductor by insulation temperature column (CEC Table 2/4).",
  standards: ["CEC"],
  fields: [
    { name: "material", label: "Material", type: "select", default: "cu", options: [{ value: "cu", label: "Copper" }, { value: "al", label: "Aluminum" }] },
    { name: "size", label: "Conductor size", type: "select", default: "8", options: CONDUCTORS.map((c) => ({ value: c.size, label: c.label })) },
    { name: "temp", label: "Insulation column", type: "select", default: "90", options: [{ value: "60", label: "60 °C" }, { value: "75", label: "75 °C" }, { value: "90", label: "90 °C" }] },
  ],
  compute(inputs): CalcResult {
    const material = str(inputs, "material", "cu") as Material;
    const sizeId = str(inputs, "size", "8");
    const temp = Number(str(inputs, "temp", "90")) as TempRating;
    const row = CONDUCTORS.find((c) => c.size === sizeId) ?? CONDUCTORS[0];
    const amp = ampacity(row, material, temp);
    return {
      summary: [
        { label: "Allowable ampacity", value: amp == null ? "n/a" : `${amp}`, unit: "A", primary: true, citation: { code: "CEC", ref: material === "cu" ? "Table 2" : "Table 4" } },
      ],
      steps: [
        { label: "Conductor", value: `${material === "cu" ? "Copper" : "Aluminum"} ${row.label}` },
        { label: "Column", value: `${temp} °C`, detail: "at 30 °C ambient, ≤ 3 conductors" },
      ],
      citations: [{ code: "CEC", ref: material === "cu" ? "Table 2" : "Table 4", note: "Allowable ampacity of insulated conductors." }],
      warnings: amp == null ? [{ level: "warn", message: "Aluminum is not tabulated at this size." }] : [],
      disclaimer: DISCLAIMER,
    };
  },
};

export const breakerSizeCalc: CalculatorDef = {
  key: "breaker-size",
  name: "Breaker / OCPD Size Calculator",
  category: "sizing",
  description: "Standard overcurrent-device rating for a given load, with the continuous-load factor (CEC Rule 8-104, 14-104).",
  standards: ["CEC"],
  fields: [
    { name: "current", label: "Load current", type: "number", unit: "A", default: 40, min: 0.1, required: true },
    { name: "continuous", label: "Continuous load (≥ 3 h)", type: "boolean", default: false, help: "Adds the 125% factor." },
    { name: "roundUp", label: "Round up to next standard size", type: "boolean", default: true, help: "Off = nearest standard size at or below the required rating." },
  ],
  compute(inputs): CalcResult {
    const current = num(inputs, "current", 0);
    const continuous = bool(inputs, "continuous", false);
    const roundUp = bool(inputs, "roundUp", true);
    const required = continuous ? current * 1.25 : current;
    const rating = roundUp ? nextStandardOcpd(required) : prevStandardOcpd(required);
    return {
      summary: [
        { label: "Overcurrent device", value: `${rating}`, unit: "A", primary: true, citation: { code: "CEC", ref: "Rule 14-104" } },
        { label: "Required rating", value: `${round(required, 1)}`, unit: "A" },
      ],
      steps: [
        { label: "Required rating", value: `${round(required, 1)} A`, detail: continuous ? `${round(current, 1)} A × 1.25` : `${round(current, 1)} A`, citation: continuous ? { code: "CEC", ref: "Rule 8-104" } : undefined },
        { label: "Standard rating", value: `${rating} A`, citation: { code: "CEC", ref: "Rule 14-104 / Table 13" } },
      ],
      citations: [
        { code: "CEC", ref: "Rule 8-104", note: "Continuous-load factor." },
        { code: "CEC", ref: "Rule 14-104", note: "Standard overcurrent-device ampere ratings." },
      ],
      warnings: [{ level: "info", message: "The device must also coordinate with conductor ampacity and equipment ratings (Rule 14-100 series)." }],
      disclaimer: DISCLAIMER,
    };
  },
};
