import type { CalculatorDef, CalcResult, CalcStep } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, round, fmt, fmtPower } from "../../../calc-core/helpers";
import { nextStandardOcpd } from "../data/corrections";

export const dwellingLoadCalc: CalculatorDef = {
  key: "dwelling-load",
  name: "Single Dwelling Load Calculator",
  category: "load",
  description:
    "Minimum service/feeder calculated load for a single dwelling per CEC Rule 8-200, with the basic living-area load, heating/AC demand and range allowance.",
  standards: ["CEC"],
  fields: [
    { name: "floorArea", label: "Living area", type: "number", unit: "m²", default: 150, min: 1, group: "Dwelling", required: true, help: "Total heated living area (exclude basement if unfinished, per code interpretation)." },
    { name: "voltage", label: "Service voltage", type: "number", unit: "V", default: 240, min: 120, group: "Dwelling" },
    { name: "heating", label: "Electric space heating", type: "number", unit: "W", default: 10000, min: 0, group: "Loads" },
    { name: "ac", label: "Air conditioning", type: "number", unit: "W", default: 0, min: 0, group: "Loads", help: "Interlocked with heating counts once (larger of the two)." },
    { name: "rangeKw", label: "Electric range rating", type: "number", unit: "kW", default: 12, min: 0, group: "Loads", help: "0 if no electric range." },
    { name: "waterHeater", label: "Electric water heater", type: "number", unit: "W", default: 3000, min: 0, group: "Loads" },
    { name: "evCharger", label: "EV charger", type: "number", unit: "W", default: 0, min: 0, group: "Loads", help: "Consider an EVEMS to reduce this (Rule 8-200/8-500)." },
    { name: "other", label: "Other loads (> 1500 W each)", type: "number", unit: "W", default: 0, min: 0, group: "Loads", help: "Hot tub, pool, sauna, etc." },
  ],
  compute(inputs): CalcResult {
    const area = num(inputs, "floorArea", 0);
    const voltage = num(inputs, "voltage", 240);
    const heating = num(inputs, "heating", 0);
    const ac = num(inputs, "ac", 0);
    const rangeKw = num(inputs, "rangeKw", 0);
    const waterHeater = num(inputs, "waterHeater", 0);
    const evCharger = num(inputs, "evCharger", 0);
    const other = num(inputs, "other", 0);

    // (i) Basic living-area load: 5000 W first 90 m² + 1000 W per additional 90 m² (or portion).
    const extraBlocks = Math.ceil(Math.max(0, area - 90) / 90);
    const basic = 5000 + 1000 * extraBlocks;

    // (ii) Heating vs AC — larger governs when interlocked (Rule 8-106(4)); heating demand 100% first 10 kW + 75% remainder.
    const heatDemand = heating <= 10000 ? heating : 10000 + 0.75 * (heating - 10000);
    const climate = Math.max(heatDemand, ac);

    // (iii) Electric range: 6000 W + 40% of any amount over 12 kW.
    const rangeW = rangeKw > 0 ? 6000 + (rangeKw * 1000 > 12000 ? 0.4 * (rangeKw * 1000 - 12000) : 0) : 0;

    const total = basic + climate + rangeW + waterHeater + evCharger + other;
    const amps = total / voltage;
    const minService = area >= 80 ? 100 : 60;
    const service = Math.max(nextStandardOcpd(amps), minService);

    const steps: CalcStep[] = [
      { label: "Basic load", value: fmtPower(basic), detail: `5000 W first 90 m² + ${extraBlocks} × 1000 W (${fmt(area)} m²)`, citation: { code: "CEC", ref: "Rule 8-200 (1)(a)(i)" } },
      { label: "Heating / AC", value: fmtPower(climate), detail: heating > 10000 ? "100% first 10 kW + 75% remainder" : "larger of heating and AC", citation: { code: "CEC", ref: "Rule 8-106 (4)" } },
    ];
    if (rangeW > 0) steps.push({ label: "Electric range", value: fmtPower(rangeW), detail: rangeKw > 12 ? `6000 W + 40% over 12 kW` : "6000 W", citation: { code: "CEC", ref: "Rule 8-200 (1)(a)(iv)" } });
    if (waterHeater > 0) steps.push({ label: "Water heater", value: fmtPower(waterHeater) });
    if (evCharger > 0) steps.push({ label: "EV charger", value: fmtPower(evCharger), citation: { code: "CEC", ref: "Rule 8-200 / 8-500" } });
    if (other > 0) steps.push({ label: "Other loads", value: fmtPower(other) });
    steps.push({ label: "Calculated load", value: fmtPower(total) });
    steps.push({ label: "Service current", value: `${round(amps, 1)} A`, detail: `${fmtPower(total)} ÷ ${voltage} V` });
    steps.push({ label: "Minimum service", value: `${minService} A`, detail: area >= 80 ? "floor area ≥ 80 m²" : "small dwelling", citation: { code: "CEC", ref: "Rule 8-200 (1)(b)" } });

    return {
      summary: [
        { label: "Minimum service", value: `${service}`, unit: "A", primary: true, citation: { code: "CEC", ref: "Rule 8-200" } },
        { label: "Calculated load", value: fmt(total / 1000, 2), unit: "kW" },
        { label: "Service current", value: `${round(amps, 1)}`, unit: "A" },
      ],
      steps,
      citations: [
        { code: "CEC", ref: "Rule 8-200", note: "Minimum calculated load for a single dwelling." },
        { code: "CEC", ref: "Rule 8-106", note: "Use and demand factors, heating/AC interlock." },
        { code: "CEC", ref: "Rule 14-104", note: "Standard overcurrent-device ratings." },
      ],
      warnings: [
        { level: "info", message: "Demand factors for EV, water heating and multiple special loads have code-specific rules — verify each against Section 8 for your project." },
      ],
      disclaimer: DISCLAIMER,
    };
  },
};
