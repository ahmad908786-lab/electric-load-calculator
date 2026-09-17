import type { CalculatorDef, CalcResult, CalcInputs } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, bool, round } from "../../../calc-core/helpers";

const tan = (pf: number) => Math.tan(Math.acos(Math.min(1, Math.max(0.01, pf))));

export const powerFactorCalc: CalculatorDef = {
  key: "power-factor",
  name: "Power Factor Correction Calculator",
  category: "power",
  description: "Reactive power (kVAR) needed to correct from an existing to a target power factor.",
  standards: ["CEC", "NEC"],
  fields: [
    { name: "kw", label: "Real power", type: "number", unit: "kW", default: 100, min: 0.1, required: true },
    { name: "pf1", label: "Existing power factor", type: "number", default: 0.75, min: 0.1, max: 1, step: 0.01, required: true },
    { name: "pf2", label: "Target power factor", type: "number", default: 0.95, min: 0.1, max: 1, step: 0.01, required: true },
  ],
  compute(inputs): CalcResult {
    const kw = num(inputs, "kw", 0);
    const pf1 = num(inputs, "pf1", 0.75);
    const pf2 = num(inputs, "pf2", 0.95);
    const kvar = kw * (tan(pf1) - tan(pf2));
    const kva1 = kw / pf1;
    const kva2 = kw / pf2;
    return {
      summary: [
        { label: "Correction required", value: `${round(kvar, 1)}`, unit: "kVAR", primary: true },
        { label: "kVA before", value: `${round(kva1, 1)}`, unit: "kVA" },
        { label: "kVA after", value: `${round(kva2, 1)}`, unit: "kVA" },
      ],
      steps: [
        { label: "Before", value: `${round(kva1, 1)} kVA`, detail: `PF ${pf1}` },
        { label: "After", value: `${round(kva2, 1)} kVA`, detail: `PF ${pf2}` },
        { label: "Capacitor kVAR", value: `${round(kvar, 1)} kVAR`, detail: "kW · (tan φ₁ − tan φ₂)" },
      ],
      citations: [],
      warnings: [{ level: "info", message: "Avoid over-correction (leading PF) at light load; consider automatic/stepped capacitor banks and harmonic conditions." }],
      disclaimer: DISCLAIMER,
    };
  },
};

export const capacitorBankCalc: CalculatorDef = {
  key: "capacitor-bank",
  name: "Capacitor Bank Sizing Calculator",
  category: "sizing",
  description: "Capacitor bank kVAR and capacitor line current to reach a target power factor.",
  standards: ["CEC", "NEC"],
  fields: [
    { name: "kw", label: "Real power", type: "number", unit: "kW", default: 100, min: 0.1, required: true },
    { name: "pf1", label: "Existing power factor", type: "number", default: 0.8, min: 0.1, max: 1, step: 0.01, required: true },
    { name: "pf2", label: "Target power factor", type: "number", default: 0.95, min: 0.1, max: 1, step: 0.01, required: true },
    { name: "phase", label: "System", type: "select", default: "3ph", options: [{ value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }] },
    { name: "voltage", label: "Line voltage", type: "number", unit: "V", default: 480, min: 1 },
  ],
  compute(inputs): CalcResult {
    const kw = num(inputs, "kw", 0);
    const pf1 = num(inputs, "pf1", 0.8);
    const pf2 = num(inputs, "pf2", 0.95);
    const phase = str(inputs, "phase", "3ph");
    const voltage = num(inputs, "voltage", 1);
    const kvar = kw * (tan(pf1) - tan(pf2));
    const f = phase === "3ph" ? Math.sqrt(3) : 1;
    const capCurrent = (kvar * 1000) / (voltage * f);
    return {
      summary: [
        { label: "Capacitor bank", value: `${round(kvar, 1)}`, unit: "kVAR", primary: true },
        { label: "Capacitor current", value: `${round(capCurrent, 1)}`, unit: "A" },
      ],
      steps: [
        { label: "Required kVAR", value: `${round(kvar, 1)} kVAR`, detail: `PF ${pf1} → ${pf2}` },
        { label: "Line current", value: `${round(capCurrent, 1)} A`, detail: phase === "3ph" ? "kVAR·1000 / (√3·V)" : "kVAR·1000 / V" },
      ],
      citations: [],
      warnings: [{ level: "info", message: "Size the capacitor's overcurrent and conductors for at least 135% of rated capacitor current (harmonics + tolerance)." }],
      disclaimer: DISCLAIMER,
    };
  },
};

function threeOrSingle(phase: "1ph" | "3ph") {
  return function compute(inputs: CalcInputs): CalcResult {
    const voltage = num(inputs, "voltage", 1);
    const current = num(inputs, "current", 0);
    const pf = Math.min(1, Math.max(0.01, num(inputs, "pf", 1)));
    const f = phase === "3ph" ? Math.sqrt(3) : 1;
    const kva = (f * voltage * current) / 1000;
    const kw = kva * pf;
    const kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));
    return {
      summary: [
        { label: "Apparent power", value: `${round(kva, 2)}`, unit: "kVA", primary: true },
        { label: "Real power", value: `${round(kw, 2)}`, unit: "kW" },
        { label: "Reactive power", value: `${round(kvar, 2)}`, unit: "kVAR" },
      ],
      steps: [
        { label: "Apparent power", value: `${round(kva, 2)} kVA`, detail: phase === "3ph" ? "√3 · V · I" : "V · I" },
        { label: "Real power", value: `${round(kw, 2)} kW`, detail: `× PF ${pf}` },
        { label: "Reactive power", value: `${round(kvar, 2)} kVAR`, detail: "√(S² − P²)" },
      ],
      citations: [],
      warnings: [],
      disclaimer: DISCLAIMER,
    };
  };
}

const phaseFields = (defV: number) => [
  { name: "voltage", label: "Line voltage", type: "number" as const, unit: "V", default: defV, min: 1, required: true },
  { name: "current", label: "Line current", type: "number" as const, unit: "A", default: 50, min: 0, required: true },
  { name: "pf", label: "Power factor", type: "number" as const, default: 0.9, min: 0.1, max: 1, step: 0.01 },
];

export const threePhaseCalc: CalculatorDef = {
  key: "three-phase",
  name: "Three-Phase Power Calculator",
  category: "conversion",
  description: "Apparent, real and reactive power for a three-phase circuit from voltage, current and power factor.",
  standards: ["CEC", "NEC"],
  fields: phaseFields(480),
  compute: threeOrSingle("3ph"),
};

export const singlePhaseCalc: CalculatorDef = {
  key: "single-phase",
  name: "Single-Phase Power Calculator",
  category: "conversion",
  description: "Apparent, real and reactive power for a single-phase circuit from voltage, current and power factor.",
  standards: ["CEC", "NEC"],
  fields: phaseFields(240),
  compute: threeOrSingle("1ph"),
};

function faultCompute(inputs: CalcInputs): CalcResult {
  const kva = num(inputs, "kva", 0);
  const voltage = num(inputs, "voltage", 1);
  const z = Math.max(0.1, num(inputs, "impedance", 5));
  const phase = str(inputs, "phase", "3ph");
  const includeMotor = bool(inputs, "motor", false);
  const f = phase === "3ph" ? Math.sqrt(3) : 1;
  const fla = (kva * 1000) / (voltage * f);
  const isc = fla * (100 / z);
  const motor = includeMotor ? 4 * fla : 0;
  const total = isc + motor;
  return {
    summary: [
      { label: "Available fault current", value: `${round(total / 1000, 1)}`, unit: "kA", primary: true, citation: { code: "CEC", ref: "Rule 14-012" } },
      { label: "Transformer contribution", value: `${round(isc / 1000, 1)}`, unit: "kA" },
      { label: "Secondary FLA", value: `${round(fla, 0)}`, unit: "A" },
    ],
    steps: [
      { label: "Secondary FLA", value: `${round(fla, 0)} A`, detail: phase === "3ph" ? "kVA·1000 / (√3·V)" : "kVA·1000 / V" },
      { label: "Transformer let-through", value: `${round(isc / 1000, 1)} kA`, detail: `FLA × 100 / ${z}% Z (infinite primary)` },
      ...(includeMotor ? [{ label: "Motor contribution", value: `${round(motor / 1000, 1)} kA`, detail: "≈ 4 × FLA" }] : []),
      { label: "Total", value: `${round(total / 1000, 1)} kA` },
    ],
    citations: [{ code: "CEC" as const, ref: "Rule 14-012", note: "Equipment must have an interrupting/withstand rating at least equal to the available fault current." }],
    warnings: [
      { level: "info", message: "Infinite-primary (worst-case) method: the actual value is lower once utility source impedance and conductor impedance are included. Use a point-to-point study for feeders downstream." },
    ],
    disclaimer: DISCLAIMER,
  };
}

const faultFields = [
  { name: "phase", label: "System", type: "select" as const, default: "3ph", options: [{ value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }] },
  { name: "kva", label: "Transformer size", type: "number" as const, unit: "kVA", default: 500, min: 1, required: true },
  { name: "voltage", label: "Secondary voltage", type: "number" as const, unit: "V", default: 208, min: 1, required: true },
  { name: "impedance", label: "Transformer impedance", type: "number" as const, unit: "%", default: 5, min: 0.5, max: 20, step: 0.1 },
  { name: "motor", label: "Include motor contribution", type: "boolean" as const, default: false, help: "Adds ≈ 4× FLA for downstream motors." },
];

export const faultCurrentCalc: CalculatorDef = {
  key: "fault-current",
  name: "Fault Current Calculator",
  category: "power",
  description: "Available fault current at a transformer secondary using the infinite-primary method (CEC Rule 14-012 withstand requirement).",
  standards: ["CEC"],
  fields: faultFields,
  compute: faultCompute,
};

export const shortCircuitCalc: CalculatorDef = {
  key: "short-circuit",
  name: "Short Circuit Calculator",
  category: "power",
  description: "Short-circuit current at a transformer secondary (infinite-primary, worst case) with optional motor contribution.",
  standards: ["CEC"],
  fields: faultFields,
  compute: faultCompute,
};
