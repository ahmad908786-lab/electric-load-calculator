import type { CalculatorDef, CalcResult } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, round, fmt } from "../../../calc-core/helpers";
import { CONDUCTORS } from "../data/conductors";
import type { Material } from "../data/conductors";
import { voltageDropVolts, type SystemType } from "../shared";

const sizeOptions = CONDUCTORS.map((c) => ({ value: c.size, label: c.label }));

export const voltageDropCalc: CalculatorDef = {
  key: "voltage-drop",
  name: "Voltage Drop Calculator",
  category: "power",
  description:
    "Percent voltage drop for a copper or aluminum run, checked against the CEC 3% / 5% limits (Rule 8-102).",
  standards: ["CEC"],
  fields: [
    {
      name: "system", label: "System", type: "select", default: "1ph", group: "Circuit",
      options: [
        { value: "dc", label: "DC" },
        { value: "1ph", label: "Single phase (2-wire)" },
        { value: "3ph", label: "Three phase" },
      ],
    },
    { name: "voltage", label: "Voltage", type: "number", unit: "V", default: 240, min: 1, group: "Circuit", required: true },
    { name: "current", label: "Load current", type: "number", unit: "A", default: 40, min: 0.1, group: "Circuit", required: true },
    {
      name: "material", label: "Conductor material", type: "select", default: "cu", group: "Conductor",
      options: [{ value: "cu", label: "Copper" }, { value: "al", label: "Aluminum" }],
    },
    { name: "size", label: "Conductor size", type: "select", default: "8", options: sizeOptions, group: "Conductor", required: true },
    { name: "sets", label: "Parallel runs per phase", type: "number", default: 1, min: 1, max: 10, group: "Conductor" },
    { name: "length", label: "One-way run length", type: "number", unit: "m", default: 40, min: 0.1, group: "Run", required: true },
    { name: "limit", label: "Allowable drop", type: "number", unit: "%", default: 3, min: 0.5, max: 10, group: "Run", help: "CEC Rule 8-102: 5% overall from supply to point of use; 3% is common for a feeder or branch." },
  ],
  compute(inputs): CalcResult {
    const system = (str(inputs, "system", "1ph")) as SystemType;
    const voltage = num(inputs, "voltage", 240);
    const current = num(inputs, "current", 0);
    const material = (str(inputs, "material", "cu")) as Material;
    const sizeId = str(inputs, "size", "8");
    const sets = Math.max(1, num(inputs, "sets", 1));
    const lengthM = num(inputs, "length", 0);
    const limit = num(inputs, "limit", 3);

    const row = CONDUCTORS.find((c) => c.size === sizeId) ?? CONDUCTORS[0];

    const vd = voltageDropVolts({ system, current, row, material, lengthM, sets });
    const vdPct = voltage > 0 ? (vd / voltage) * 100 : 0;
    const endVoltage = voltage - vd;
    const pass = vdPct <= limit;

    return {
      summary: [
        { label: "Voltage drop", value: `${round(vdPct, 2)}`, unit: "%", primary: true },
        { label: "Voltage drop", value: `${round(vd, 2)}`, unit: "V" },
        { label: "Voltage at load", value: `${round(endVoltage, 1)}`, unit: "V" },
        { label: pass ? "Within limit" : "Exceeds limit", value: pass ? "PASS" : "FAIL", unit: `≤ ${limit}%` },
      ],
      steps: [
        { label: "Method", value: system === "3ph" ? "√3 · I · R · L" : "2 · I · R · L", detail: `${material === "cu" ? "Copper" : "Aluminum"} ${row.label}, ${sets} run(s)/phase` },
        { label: "Resistance", detail: `derived from ${row.areaMm2} mm² at 75 °C` },
        { label: "Run length", value: `${fmt(lengthM)} m (one way)` },
        { label: "Voltage drop", value: `${round(vd, 2)} V = ${round(vdPct, 2)}%`, citation: { code: "CEC", ref: "Rule 8-102", note: "Maximum voltage drop from supply to point of utilization." } },
      ],
      citations: [
        { code: "CEC", ref: "Rule 8-102", note: "Voltage-drop limits (overall 5%; commonly 3% for a feeder or branch)." },
        { code: "CEC", ref: "Table D3", note: "Voltage-drop reference data for copper and aluminum conductors." },
      ],
      warnings: pass
        ? []
        : [{ level: "warn", message: `Voltage drop of ${round(vdPct, 2)}% exceeds the ${limit}% target. Increase conductor size or reduce run length.`, citation: { code: "CEC", ref: "Rule 8-102" } }],
      disclaimer: DISCLAIMER,
    };
  },
};
