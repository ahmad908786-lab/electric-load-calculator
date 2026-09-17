import type { CalculatorDef, CalcResult } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, round } from "../../../calc-core/helpers";

export const batterySizeCalc: CalculatorDef = {
  key: "battery-size",
  name: "Battery Bank Sizing Calculator",
  category: "sizing",
  description: "Required battery capacity (Ah and kWh) for a load and autonomy, accounting for depth of discharge and system efficiency.",
  standards: ["CEC", "NEC"],
  fields: [
    { name: "loadUnit", label: "Load unit", type: "select", default: "w", options: [{ value: "w", label: "Watts (W)" }, { value: "a", label: "Amps (A)" }], group: "Load" },
    { name: "load", label: "Continuous load", type: "number", default: 500, min: 0.1, group: "Load", required: true },
    { name: "hours", label: "Autonomy", type: "number", unit: "h", default: 8, min: 0.1, group: "Load", required: true },
    { name: "systemV", label: "System voltage", type: "number", unit: "V", default: 48, min: 1, group: "Battery" },
    { name: "dod", label: "Depth of discharge", type: "number", unit: "%", default: 80, min: 10, max: 100, group: "Battery", help: "Usable fraction (e.g. 50% lead-acid, 80–90% lithium)." },
    { name: "efficiency", label: "System efficiency", type: "number", unit: "%", default: 90, min: 10, max: 100, group: "Battery", help: "Inverter + wiring losses." },
  ],
  compute(inputs): CalcResult {
    const unit = str(inputs, "loadUnit", "w");
    const load = num(inputs, "load", 0);
    const hours = num(inputs, "hours", 0);
    const systemV = num(inputs, "systemV", 1);
    const dod = Math.min(100, Math.max(1, num(inputs, "dod", 80))) / 100;
    const eff = Math.min(100, Math.max(1, num(inputs, "efficiency", 90))) / 100;

    const watts = unit === "w" ? load : load * systemV;
    const energyWh = watts * hours;
    const requiredWh = energyWh / (dod * eff);
    const requiredAh = requiredWh / systemV;

    return {
      summary: [
        { label: "Battery capacity", value: `${round(requiredAh, 0)}`, unit: "Ah", primary: true },
        { label: "Usable energy", value: `${round(energyWh / 1000, 2)}`, unit: "kWh" },
        { label: "Rated capacity", value: `${round(requiredWh / 1000, 2)}`, unit: "kWh" },
      ],
      steps: [
        { label: "Energy demand", value: `${round(energyWh, 0)} Wh`, detail: `${round(watts, 0)} W × ${hours} h` },
        { label: "Adjust for DoD & efficiency", value: `${round(requiredWh, 0)} Wh`, detail: `÷ (${round(dod * 100)}% DoD × ${round(eff * 100)}% eff)` },
        { label: "At system voltage", value: `${round(requiredAh, 0)} Ah`, detail: `÷ ${systemV} V` },
      ],
      citations: [],
      warnings: [
        { level: "info", message: "Add margins for temperature, aging and future load. Stationary battery sizing follows IEEE 485 (lead-acid) / 1187 (VRLA); installation follows CEC Section 26." },
      ],
      disclaimer: DISCLAIMER,
    };
  },
};
