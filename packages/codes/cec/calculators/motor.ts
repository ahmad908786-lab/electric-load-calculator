import type { CalculatorDef, CalcResult } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, round } from "../../../calc-core/helpers";
import { motorFla, HP_TO_W } from "../data/equipment";
import { nextStandardOcpd } from "../data/corrections";

export const motorFlaCalc: CalculatorDef = {
  key: "motor-fla",
  name: "Motor FLA Calculator",
  category: "load",
  description:
    "Estimates motor full-load current and the 125% conductor sizing basis (CEC Section 28, Rule 28-106; use Table 44/45 for code values).",
  standards: ["CEC"],
  fields: [
    { name: "phase", label: "Motor type", type: "select", default: "3ph", options: [{ value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }], group: "Motor" },
    { name: "powerUnit", label: "Rating unit", type: "select", default: "hp", options: [{ value: "hp", label: "Horsepower (hp)" }, { value: "kw", label: "Kilowatts (kW)" }], group: "Motor" },
    { name: "power", label: "Motor rating", type: "number", default: 10, min: 0.1, group: "Motor", required: true },
    { name: "voltage", label: "Voltage", type: "number", unit: "V", default: 480, min: 1, group: "Motor", required: true },
    { name: "efficiency", label: "Efficiency", type: "number", default: 0.9, min: 0.1, max: 1, step: 0.01, group: "Motor" },
    { name: "pf", label: "Power factor", type: "number", default: 0.85, min: 0.1, max: 1, step: 0.01, group: "Motor" },
  ],
  compute(inputs): CalcResult {
    const phase = str(inputs, "phase", "3ph") as "1ph" | "3ph";
    const unit = str(inputs, "powerUnit", "hp");
    const power = num(inputs, "power", 0);
    const voltage = num(inputs, "voltage", 1);
    const efficiency = Math.min(1, Math.max(0.1, num(inputs, "efficiency", 0.9)));
    const pf = Math.min(1, Math.max(0.1, num(inputs, "pf", 0.85)));

    const watts = unit === "hp" ? power * HP_TO_W : power * 1000;
    const fla = motorFla({ watts, voltage, phase, efficiency, pf });
    const conductorAmps = fla * 1.25;
    const breaker = nextStandardOcpd(conductorAmps);

    return {
      summary: [
        { label: "Full-load current", value: `${round(fla, 1)}`, unit: "A", primary: true, citation: { code: "CEC", ref: phase === "3ph" ? "Table 44" : "Table 45" } },
        { label: "Conductor sizing (125%)", value: `${round(conductorAmps, 1)}`, unit: "A", citation: { code: "CEC", ref: "Rule 28-106" } },
        { label: "Branch OCPD (approx)", value: `${breaker}`, unit: "A" },
      ],
      steps: [
        { label: "Mechanical power", value: `${round(watts, 0)} W`, detail: unit === "hp" ? `${power} hp × 746` : `${power} kW` },
        { label: "Full-load current", value: `${round(fla, 1)} A`, detail: phase === "3ph" ? "P / (√3·V·η·PF)" : "P / (V·η·PF)", citation: { code: "CEC", ref: phase === "3ph" ? "Table 44" : "Table 45" } },
        { label: "Conductor ampacity", value: `${round(conductorAmps, 1)} A`, detail: "125% of FLA", citation: { code: "CEC", ref: "Rule 28-106" } },
      ],
      citations: [
        { code: "CEC", ref: "Table 44", note: "Full-load currents of three-phase AC motors." },
        { code: "CEC", ref: "Table 45", note: "Full-load currents of single-phase AC motors." },
        { code: "CEC", ref: "Rule 28-106", note: "Motor branch-circuit conductors sized at 125% of full-load current." },
      ],
      warnings: [
        { level: "info", message: "For code compliance, take FLA from CEC Table 44/45 (not the nameplate). Branch-circuit overcurrent protection has separate maximum percentages by device type (Rule 28-200)." },
      ],
      disclaimer: DISCLAIMER,
    };
  },
};
