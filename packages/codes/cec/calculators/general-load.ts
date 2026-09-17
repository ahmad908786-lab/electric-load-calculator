import type { CalculatorDef, CalcResult, CalcStep } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, round, fmt } from "../../../calc-core/helpers";
import { nextStandardOcpd } from "../data/corrections";

/**
 * Commercial + mixed-use calculated load. Commercial lighting/receptacle load
 * follows the area-based minimum (Rule 8-210); the largest motor carries the
 * 125% factor (Section 28). An optional residential block folds in dwelling
 * units for mixed-use buildings (Rule 8-202 demand — verify the demand schedule).
 */
export const generalLoadCalc: CalculatorDef = {
  key: "commercial-load",
  name: "Commercial / Mixed-Use Load Calculator",
  category: "load",
  description:
    "Calculated service/feeder load for commercial and mixed-use buildings: area-based lighting (Rule 8-210), receptacle, HVAC and motor loads (Section 28), plus an optional residential block for mixed use.",
  standards: ["CEC"],
  fields: [
    { name: "system", label: "System", type: "select", default: "3ph", options: [{ value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }], group: "Service" },
    { name: "voltage", label: "Service voltage", type: "number", unit: "V", default: 208, min: 120, group: "Service", required: true },

    { name: "area", label: "Commercial floor area", type: "number", unit: "m²", default: 300, min: 0, group: "Commercial loads" },
    { name: "lightingDensity", label: "Lighting load density", type: "number", unit: "W/m²", default: 30, min: 0, group: "Commercial loads", help: "Area-based lighting allowance (Rule 8-210); treated as continuous (×1.25)." },
    { name: "receptacleVA", label: "Receptacle load", type: "number", unit: "VA", default: 5000, min: 0, group: "Commercial loads" },
    { name: "hvacVA", label: "HVAC load", type: "number", unit: "VA", default: 15000, min: 0, group: "Commercial loads" },
    { name: "motorVA", label: "Largest motor", type: "number", unit: "VA", default: 0, min: 0, group: "Commercial loads", help: "125% applied per Section 28." },
    { name: "otherVA", label: "Other loads", type: "number", unit: "VA", default: 0, min: 0, group: "Commercial loads" },

    { name: "resUnits", label: "Dwelling units", type: "number", default: 0, min: 0, group: "Residential (mixed-use)" },
    { name: "resPerUnitKw", label: "Load per unit", type: "number", unit: "kW", default: 0, min: 0, group: "Residential (mixed-use)", help: "Per-unit calculated load (from Rule 8-200)." },
    { name: "resDemandPct", label: "Residential demand factor", type: "number", unit: "%", default: 100, min: 1, max: 100, group: "Residential (mixed-use)", help: "Demand factor for the number of units (Rule 8-202)." },
  ],
  compute(inputs): CalcResult {
    const system = str(inputs, "system", "3ph");
    const voltage = num(inputs, "voltage", 208);
    const area = num(inputs, "area", 0);
    const density = num(inputs, "lightingDensity", 0);
    const receptacle = num(inputs, "receptacleVA", 0);
    const hvac = num(inputs, "hvacVA", 0);
    const motor = num(inputs, "motorVA", 0);
    const other = num(inputs, "otherVA", 0);
    const resUnits = num(inputs, "resUnits", 0);
    const resPerUnitKw = num(inputs, "resPerUnitKw", 0);
    const resDemandPct = num(inputs, "resDemandPct", 100);

    const lighting = area * density;
    const lightingContinuous = lighting * 1.25;
    const motorAdj = motor * 1.25;
    const commercial = lightingContinuous + receptacle + hvac + motorAdj + other;
    const residential = resUnits * resPerUnitKw * 1000 * (resDemandPct / 100);
    const total = commercial + residential;

    const phaseFactor = system === "3ph" ? Math.sqrt(3) : 1;
    const amps = total / (voltage * phaseFactor);
    const service = nextStandardOcpd(amps);

    const steps: CalcStep[] = [
      { label: "Lighting", value: `${fmt(lightingContinuous)} VA`, detail: `${fmt(area)} m² × ${density} W/m² × 1.25`, citation: { code: "CEC", ref: "Rule 8-210" } },
      { label: "Receptacles", value: `${fmt(receptacle)} VA` },
      { label: "HVAC", value: `${fmt(hvac)} VA` },
    ];
    if (motor > 0) steps.push({ label: "Largest motor", value: `${fmt(motorAdj)} VA`, detail: `${fmt(motor)} VA × 1.25`, citation: { code: "CEC", ref: "Section 28" } });
    if (other > 0) steps.push({ label: "Other", value: `${fmt(other)} VA` });
    if (residential > 0) steps.push({ label: "Residential (mixed-use)", value: `${fmt(residential)} VA`, detail: `${resUnits} units × ${resPerUnitKw} kW × ${resDemandPct}%`, citation: { code: "CEC", ref: "Rule 8-202" } });
    steps.push({ label: "Total calculated load", value: `${fmt(total / 1000, 2)} kVA` });
    steps.push({ label: "Service current", value: `${round(amps, 1)} A`, detail: system === "3ph" ? `${fmt(total)} ÷ (${voltage} × √3)` : `${fmt(total)} ÷ ${voltage}` });

    return {
      summary: [
        { label: "Minimum service", value: `${service}`, unit: "A", primary: true, citation: { code: "CEC", ref: "Rule 14-104" } },
        { label: "Calculated load", value: fmt(total / 1000, 2), unit: "kVA" },
        { label: "Service current", value: `${round(amps, 1)}`, unit: "A" },
      ],
      steps,
      citations: [
        { code: "CEC", ref: "Rule 8-210", note: "Determination of area-based load for commercial/institutional occupancies." },
        { code: "CEC", ref: "Rule 8-202", note: "Demand factors for apartment and similar buildings." },
        { code: "CEC", ref: "Section 28", note: "Motor circuit conductor and overcurrent sizing (125% of largest motor)." },
        { code: "CEC", ref: "Rule 8-104", note: "Continuous-load factor." },
      ],
      warnings: [
        { level: "info", message: "Occupancy-specific demand factors (Rule 8-208 to 8-304) can reduce these loads — verify against the applicable rule for your building type." },
      ],
      disclaimer: DISCLAIMER,
    };
  },
};
