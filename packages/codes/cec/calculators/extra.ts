import type { CalculatorDef, CalcResult, CalcInputs } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, round } from "../../../calc-core/helpers";
import { cableSizeCalc } from "./cable-size";
import { CONDUCTORS, ampacity } from "../data/conductors";
import type { Material, TempRating } from "../data/conductors";
import { temperatureFactor } from "../data/corrections";

/**
 * Buried cable size — reuses the full cable-size engine with the installation
 * method fixed to direct burial (single run, no grouping penalty). Burial depth
 * is informational; precise ampacity is governed by CEC Appendix D.
 */
export const buriedCableCalc: CalculatorDef = {
  key: "buried-cable",
  name: "Buried Cable Size Calculator",
  category: "sizing",
  description:
    "Sizes a direct-buried conductor for ampacity and voltage drop. Precise direct-burial ampacity is governed by CEC Appendix D (Table D8B/D9B) — this is a conservative estimate.",
  standards: ["CEC"],
  fields: [
    { name: "current", label: "Load current", type: "number", unit: "A", default: 100, min: 0.1, group: "Load", required: true },
    { name: "system", label: "System", type: "select", default: "1ph", options: [{ value: "dc", label: "DC" }, { value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }], group: "Load" },
    { name: "voltage", label: "Voltage", type: "number", unit: "V", default: 240, min: 1, group: "Load", required: true },
    { name: "material", label: "Conductor material", type: "select", default: "cu", options: [{ value: "cu", label: "Copper" }, { value: "al", label: "Aluminum" }], group: "Conductor" },
    { name: "insulation", label: "Insulation rating", type: "select", default: "90", options: [{ value: "60", label: "60 °C" }, { value: "75", label: "75 °C" }, { value: "90", label: "90 °C" }], group: "Conductor" },
    { name: "termination", label: "Termination rating", type: "select", default: "75", options: [{ value: "60", label: "60 °C" }, { value: "75", label: "75 °C" }, { value: "90", label: "90 °C" }], group: "Conductor" },
    { name: "depth", label: "Burial depth", type: "number", unit: "mm", default: 600, min: 300, group: "Installation", help: "Informational — see CEC Table 53 for minimum burial depth." },
    { name: "ambient", label: "Soil/ambient temperature", type: "number", unit: "°C", default: 20, min: -10, max: 60, group: "Installation" },
    { name: "length", label: "One-way run length", type: "number", unit: "m", default: 60, min: 0.1, group: "Voltage drop", required: true },
    { name: "vdLimit", label: "Allowable voltage drop", type: "number", unit: "%", default: 3, min: 0.5, max: 10, group: "Voltage drop" },
  ],
  compute(inputs: CalcInputs): CalcResult {
    // Delegate to the cable-size engine with the buried installation method.
    return cableSizeCalc.compute({ ...inputs, install: "buried", ccc: 1, continuous: false }, { standard: "CEC", region: "", edition: "" });
  },
};

/**
 * General sizing — pick the smallest conductor that carries a required ampacity
 * at the chosen conditions (no voltage-drop check). A quick ampacity-only sizer.
 */
export const generalSizingCalc: CalculatorDef = {
  key: "general-sizing",
  name: "General Conductor Sizing",
  category: "sizing",
  description: "Smallest copper/aluminum conductor for a required ampacity, with ambient correction and termination limit (CEC Table 2/4, 5A).",
  standards: ["CEC"],
  fields: [
    { name: "required", label: "Required ampacity", type: "number", unit: "A", default: 100, min: 0.1, required: true },
    { name: "material", label: "Material", type: "select", default: "cu", options: [{ value: "cu", label: "Copper" }, { value: "al", label: "Aluminum" }] },
    { name: "insulation", label: "Insulation rating", type: "select", default: "90", options: [{ value: "60", label: "60 °C" }, { value: "75", label: "75 °C" }, { value: "90", label: "90 °C" }] },
    { name: "termination", label: "Termination rating", type: "select", default: "75", options: [{ value: "60", label: "60 °C" }, { value: "75", label: "75 °C" }, { value: "90", label: "90 °C" }] },
    { name: "ambient", label: "Ambient temperature", type: "number", unit: "°C", default: 30, min: -10, max: 80 },
  ],
  compute(inputs: CalcInputs): CalcResult {
    const required = num(inputs, "required", 0);
    const material = str(inputs, "material", "cu") as Material;
    const insulation = Number(str(inputs, "insulation", "90")) as TempRating;
    const termination = Number(str(inputs, "termination", "75")) as TempRating;
    const ambient = num(inputs, "ambient", 30);
    const tempF = temperatureFactor(ambient, insulation);

    let chosen = CONDUCTORS[CONDUCTORS.length - 1];
    let usable = 0;
    for (const row of CONDUCTORS) {
      const base = ampacity(row, material, insulation);
      if (base == null) continue;
      const derated = base * tempF;
      const term = ampacity(row, material, termination) ?? derated;
      const u = Math.min(derated, term);
      if (u >= required) { chosen = row; usable = u; break; }
    }

    return {
      summary: [
        { label: "Conductor size", value: chosen.label, unit: material === "cu" ? "Cu" : "Al", primary: true, citation: { code: "CEC", ref: material === "cu" ? "Table 2" : "Table 4" } },
        { label: "Usable ampacity", value: `${round(usable, 1)}`, unit: "A" },
      ],
      steps: [
        { label: "Required ampacity", value: `${round(required, 1)} A` },
        { label: "Ambient correction", value: `×${tempF}`, detail: `${ambient} °C`, citation: { code: "CEC", ref: "Table 5A" } },
        { label: "Termination limit", value: `${termination} °C`, citation: { code: "CEC", ref: "Rule 4-006" } },
      ],
      citations: [
        { code: "CEC", ref: material === "cu" ? "Table 2" : "Table 4", note: "Allowable ampacity." },
        { code: "CEC", ref: "Table 5A", note: "Ambient correction." },
        { code: "CEC", ref: "Rule 4-006", note: "Termination temperature limit." },
      ],
      warnings: [{ level: "info", message: "Ampacity only — check voltage drop separately with the Cable Size or Voltage Drop calculator." }],
      disclaimer: DISCLAIMER,
    };
  },
};
