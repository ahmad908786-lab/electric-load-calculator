import type { CalculatorDef, CalcResult, CalcStep, CalcWarning } from "../../../calc-core/types";
import { DISCLAIMER } from "../../../calc-core/types";
import { num, str, bool, round } from "../../../calc-core/helpers";
import { CONDUCTORS, ampacity } from "../data/conductors";
import type { Material, TempRating } from "../data/conductors";
import { temperatureFactor, groupingFactor, nextStandardOcpd, findInstallMethod, INSTALL_METHODS } from "../data/corrections";
import { voltageDropVolts, type SystemType } from "../shared";

const tempOptions = [
  { value: "60", label: "60 °C (T90 in 60° termination, TW)" },
  { value: "75", label: "75 °C (TWU75, RW75)" },
  { value: "90", label: "90 °C (RW90, T90 Nylon)" },
];

export const cableSizeCalc: CalculatorDef = {
  key: "cable-size",
  name: "Cable / Conductor Size Calculator",
  category: "sizing",
  description:
    "Sizes copper or aluminum conductors for ampacity (with ambient + grouping derating and termination limits) and voltage drop. Cites CEC Table 2/4, 5A, 5C and Rule 8-102.",
  standards: ["CEC"],
  fields: [
    { name: "current", label: "Load current", type: "number", unit: "A", default: 40, min: 0.1, group: "Load", required: true },
    { name: "continuous", label: "Continuous load (≥ 3 h)", type: "boolean", default: false, group: "Load", help: "Applies the 125% factor (CEC Rule 8-104)." },
    {
      name: "system", label: "System", type: "select", default: "1ph", group: "Load",
      options: [{ value: "dc", label: "DC" }, { value: "1ph", label: "Single phase" }, { value: "3ph", label: "Three phase" }],
    },
    { name: "voltage", label: "Voltage", type: "number", unit: "V", default: 240, min: 1, group: "Load", required: true },

    { name: "material", label: "Conductor material", type: "select", default: "cu", options: [{ value: "cu", label: "Copper" }, { value: "al", label: "Aluminum" }], group: "Conductor" },
    { name: "insulation", label: "Insulation rating", type: "select", default: "90", options: tempOptions, group: "Conductor", help: "Temperature column used before derating (CEC Table 2/4)." },
    { name: "termination", label: "Termination rating", type: "select", default: "75", options: tempOptions, group: "Conductor", help: "Equipment lug rating that caps final ampacity (CEC Rule 4-006)." },

    { name: "install", label: "Installation method", type: "select", default: "raceway", options: INSTALL_METHODS.map((m) => ({ value: m.value, label: m.label })), group: "Installation" },
    { name: "ambient", label: "Ambient temperature", type: "number", unit: "°C", default: 30, min: -10, max: 80, group: "Installation" },
    { name: "ccc", label: "Current-carrying conductors", type: "number", default: 3, min: 1, max: 60, group: "Installation", help: "Bundled conductors driving the grouping factor (CEC Table 5C)." },

    { name: "length", label: "One-way run length", type: "number", unit: "m", default: 40, min: 0.1, group: "Voltage drop", required: true },
    { name: "vdLimit", label: "Allowable voltage drop", type: "number", unit: "%", default: 3, min: 0.5, max: 10, group: "Voltage drop" },
  ],
  compute(inputs): CalcResult {
    const current = num(inputs, "current", 0);
    const continuous = bool(inputs, "continuous", false);
    const system = str(inputs, "system", "1ph") as SystemType;
    const voltage = num(inputs, "voltage", 240);
    const material = str(inputs, "material", "cu") as Material;
    const insulation = Number(str(inputs, "insulation", "90")) as TempRating;
    const termination = Number(str(inputs, "termination", "75")) as TempRating;
    const method = findInstallMethod(str(inputs, "install", "raceway"));
    const ambient = num(inputs, "ambient", 30);
    const ccc = Math.max(1, num(inputs, "ccc", 3));
    const lengthM = num(inputs, "length", 0);
    const vdLimit = num(inputs, "vdLimit", 3);

    const requiredAmp = continuous ? current * 1.25 : current;
    const tempF = temperatureFactor(ambient, insulation);
    const groupF = method.grouping ? groupingFactor(ccc) : 1;

    let chosen: (typeof CONDUCTORS)[number] | null = null;
    let chosenUsable = 0;
    let chosenVdPct = 0;
    let ampacityOnlySize = "";

    for (const row of CONDUCTORS) {
      const base = ampacity(row, material, insulation);
      if (base == null) continue; // material/size not applicable
      const derated = base * tempF * groupF;
      const termAmp = ampacity(row, material, termination) ?? derated;
      const usable = Math.min(derated, termAmp);

      const ampOk = usable >= requiredAmp;
      if (ampOk && !ampacityOnlySize) ampacityOnlySize = row.label;

      const vd = voltageDropVolts({ system, current, row, material, lengthM });
      const vdPct = voltage > 0 ? (vd / voltage) * 100 : 0;
      const vdOk = vdPct <= vdLimit;

      if (ampOk && vdOk) {
        chosen = row;
        chosenUsable = usable;
        chosenVdPct = vdPct;
        break;
      }
    }

    const warnings: CalcWarning[] = [];
    if (!chosen) {
      const last = CONDUCTORS[CONDUCTORS.length - 1];
      chosen = last;
      chosenUsable = (ampacity(last, material, insulation) ?? 0) * tempF * groupF;
      const vd = voltageDropVolts({ system, current, row: last, material, lengthM });
      chosenVdPct = voltage > 0 ? (vd / voltage) * 100 : 0;
      warnings.push({ level: "error", message: "No single conductor in the table satisfies both ampacity and voltage drop. Use parallel conductors or a larger engineered cable." });
    }

    const base = ampacity(chosen, material, insulation) ?? 0;
    const derated = base * tempF * groupF;
    const termAmp = ampacity(chosen, material, termination) ?? derated;
    const breaker = nextStandardOcpd(requiredAmp);
    const vdDrove = ampacityOnlySize && ampacityOnlySize !== chosen.label;

    if (!method.usesRacewayTable && method.note) {
      warnings.push({ level: "info", message: method.note, citation: { code: "CEC", ref: method.table } });
    }
    if (chosenVdPct > vdLimit) {
      warnings.push({ level: "warn", message: `Voltage drop ${round(chosenVdPct, 2)}% exceeds ${vdLimit}%.`, citation: { code: "CEC", ref: "Rule 8-102" } });
    }

    const steps: CalcStep[] = [
      { label: "Required ampacity", value: `${round(requiredAmp, 1)} A`, detail: continuous ? `${round(current, 1)} A × 1.25 (continuous)` : `${round(current, 1)} A load`, citation: continuous ? { code: "CEC", ref: "Rule 8-104", note: "Continuous-load 125% factor." } : undefined },
      { label: `Base ampacity (${insulation} °C)`, value: `${base} A`, detail: `${material === "cu" ? "Copper" : "Aluminum"} ${chosen.label}`, citation: { code: "CEC", ref: material === "cu" ? "Table 2" : "Table 4" } },
      { label: "Ambient correction", value: `×${tempF}`, detail: `${ambient} °C ambient`, citation: { code: "CEC", ref: "Table 5A" } },
      { label: "Grouping adjustment", value: `×${groupF}`, detail: method.grouping ? `${ccc} current-carrying conductors` : "not applicable for this method", citation: { code: "CEC", ref: "Table 5C" } },
      { label: "Derated ampacity", value: `${round(derated, 1)} A` },
      { label: `Termination limit (${termination} °C)`, value: `${termAmp} A`, citation: { code: "CEC", ref: "Rule 4-006" } },
      { label: "Usable ampacity", value: `${round(chosenUsable, 1)} A`, detail: "lesser of derated and termination" },
      { label: "Voltage drop", value: `${round(chosenVdPct, 2)}%`, detail: `over ${lengthM} m, limit ${vdLimit}%`, citation: { code: "CEC", ref: "Rule 8-102" } },
    ];

    return {
      summary: [
        { label: "Conductor size", value: `${chosen.label}`, unit: material === "cu" ? "Cu" : "Al", primary: true },
        { label: "Usable ampacity", value: `${round(chosenUsable, 1)}`, unit: "A" },
        { label: "Voltage drop", value: `${round(chosenVdPct, 2)}`, unit: "%" },
        { label: "Overcurrent device", value: `${breaker}`, unit: "A", citation: { code: "CEC", ref: "Rule 14-104" } },
      ],
      steps,
      citations: [
        { code: "CEC", ref: material === "cu" ? "Table 2" : "Table 4", note: "Allowable ampacity of insulated conductors in raceway or cable." },
        { code: "CEC", ref: "Table 5A", note: "Ambient temperature correction factors." },
        { code: "CEC", ref: "Table 5C", note: "Adjustment for more than three current-carrying conductors." },
        { code: "CEC", ref: "Rule 4-006", note: "Conductor ampacity limited by termination temperature rating." },
        { code: "CEC", ref: "Rule 8-102", note: "Voltage-drop limits." },
        { code: "CEC", ref: "Rule 14-104", note: "Standard overcurrent-device ratings." },
      ],
      warnings: [
        ...(vdDrove ? [{ level: "info" as const, message: `Voltage drop drove the size up from ${ampacityOnlySize} (ampacity-only) to ${chosen.label}.` }] : []),
        ...warnings,
      ],
      disclaimer: DISCLAIMER,
    };
  },
};
