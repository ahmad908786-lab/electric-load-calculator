import type { CalculatorDef, CalcResult } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, bool, round } from "../../../calc-core/helpers";

/**
 * Arc-flash incident energy — IEEE 1584-2002 empirical model (0.208–15 kV).
 * This is a SCREENING ESTIMATE only. A real arc-flash study (IEEE 1584-2018 /
 * CSA Z462) by a qualified engineer is required — protective-device clearing
 * time must come from the actual time-current curve at the arcing current.
 */

interface EquipParams {
  gap: number; // mm
  x: number; // distance exponent
  box: boolean;
  wd: number; // typical working distance, mm
}

const EQUIPMENT: Record<string, EquipParams> = {
  panel: { gap: 25, x: 1.641, box: true, wd: 455 },
  mcc: { gap: 25, x: 1.641, box: true, wd: 455 },
  "switchgear-lv": { gap: 32, x: 1.473, box: true, wd: 610 },
  cable: { gap: 13, x: 2.0, box: true, wd: 455 },
  open: { gap: 25, x: 2.0, box: false, wd: 455 },
};

function ppeCategory(cal: number): string {
  if (cal < 1.2) return "No AR clothing required (still a shock/AF hazard)";
  if (cal <= 4) return "Category 1 (≥ 4 cal/cm²)";
  if (cal <= 8) return "Category 2 (≥ 8 cal/cm²)";
  if (cal <= 25) return "Category 3 (≥ 25 cal/cm²)";
  if (cal <= 40) return "Category 4 (≥ 40 cal/cm²)";
  return "DANGER — > 40 cal/cm²; energized work not permitted";
}

export const arcFlashCalc: CalculatorDef = {
  key: "arc-flash",
  name: "Arc Flash Calculator",
  category: "power",
  description:
    "Screening estimate of arc-flash incident energy, arc-flash boundary and PPE category (IEEE 1584-2002). Not a substitute for a qualified arc-flash study.",
  standards: ["CEC"],
  fields: [
    { name: "equipment", label: "Equipment", type: "select", default: "panel", group: "System", options: [
      { value: "panel", label: "LV Panelboard" }, { value: "mcc", label: "LV MCC" },
      { value: "switchgear-lv", label: "LV Switchgear" }, { value: "cable", label: "Cable / junction" },
      { value: "open", label: "Open air" },
    ] },
    { name: "voltage", label: "System voltage", type: "number", unit: "kV", default: 0.48, min: 0.208, max: 15, step: 0.001, group: "System", required: true },
    { name: "boltedKa", label: "Bolted fault current", type: "number", unit: "kA", default: 25, min: 0.7, max: 106, group: "System", required: true, help: "From the fault-current calculator." },
    { name: "grounded", label: "Solidly grounded", type: "boolean", default: true, group: "System" },
    { name: "time", label: "Arc clearing time", type: "number", unit: "s", default: 0.2, min: 0.01, max: 2, step: 0.01, group: "Protection", help: "Protective device clearing time at the arcing current." },
    { name: "distance", label: "Working distance", type: "number", unit: "mm", default: 455, min: 100, group: "Protection", help: "Typical: 455 mm (panel/MCC), 610 mm (switchgear)." },
  ],
  compute(inputs): CalcResult {
    const eq = EQUIPMENT[str(inputs, "equipment", "panel")] ?? EQUIPMENT.panel;
    const V = num(inputs, "voltage", 0.48);
    const Ibf = Math.max(0.1, num(inputs, "boltedKa", 25));
    const grounded = bool(inputs, "grounded", true);
    const t = num(inputs, "time", 0.2);
    const D = Math.max(1, num(inputs, "distance", eq.wd));
    const G = eq.gap;
    const lg = Math.log10;

    // Arcing current
    let lgIa: number;
    if (V < 1) {
      const K = eq.box ? -0.097 : -0.153;
      lgIa = K + 0.662 * lg(Ibf) + 0.0966 * V + 0.000526 * G + 0.5588 * V * lg(Ibf) - 0.00304 * G * lg(Ibf);
    } else {
      lgIa = 0.00402 + 0.983 * lg(Ibf);
    }
    const Ia = 10 ** lgIa;

    // Normalized incident energy (t=0.2 s, D=610 mm)
    const K1 = eq.box ? -0.555 : -0.792;
    const K2 = grounded ? -0.113 : 0;
    const En = 10 ** (K1 + K2 + 1.081 * lg(Ia) + 0.0011 * G);

    const Cf = V > 1 ? 1.0 : 1.5;
    const Ejcm2 = 4.184 * Cf * En * (t / 0.2) * (610 / D) ** eq.x;
    const cal = Ejcm2 / 4.184;

    // Arc-flash boundary at 5 J/cm² (1.2 cal/cm²)
    const Eb = 5.0;
    const boundary = (4.184 * Cf * En * (t / 0.2) * (610 ** eq.x / Eb)) ** (1 / eq.x);

    return {
      summary: [
        { label: "Incident energy", value: `${round(cal, 1)}`, unit: "cal/cm²", primary: true },
        { label: "Arc-flash boundary", value: `${round(boundary, 0)}`, unit: "mm" },
        { label: "Arcing current", value: `${round(Ia, 1)}`, unit: "kA" },
        { label: "PPE", value: ppeCategory(cal).split(" (")[0] },
      ],
      steps: [
        { label: "Arcing current", value: `${round(Ia, 1)} kA`, detail: `from ${Ibf} kA bolted, ${G} mm gap` },
        { label: "Normalized energy", value: `${round(En, 3)} J/cm²`, detail: "at 0.2 s, 610 mm" },
        { label: "Incident energy", value: `${round(cal, 1)} cal/cm²`, detail: `${t} s clearing, ${D} mm working distance` },
        { label: "PPE category", value: ppeCategory(cal) },
      ],
      citations: [
        { code: "CEC", ref: "Rule 2-306", note: "Where required, arc-flash and shock hazard must be assessed; work per CSA Z462." },
      ],
      warnings: [
        { level: "error", message: "SCREENING ESTIMATE ONLY (IEEE 1584-2002). A qualified arc-flash study per IEEE 1584-2018 / CSA Z462 is required for real labeling and PPE selection. The clearing time must be read from the protective device's curve at the arcing current." },
      ],
      disclaimer: DISCLAIMER,
    };
  },
};
