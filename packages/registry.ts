/**
 * Central catalog: code standards, calculator categories, and the calculator
 * registry. The web directory, calculator pages and (later) the admin dashboard
 * all read from here. When calculators move into the database, this stays the
 * shape the UI consumes.
 */

import type { CalculatorCategory, CalculatorDef, CodeContext, StandardId } from "./calc-core/types";
import { CEC_CALCULATORS } from "./codes/cec";

export interface CodeStandardMeta {
  id: StandardId;
  region: string;
  edition: string;
  /** Two-letter region/country for the selector. */
  flag: string;
  available: boolean;
}

export const CODE_STANDARDS: CodeStandardMeta[] = [
  { id: "CEC", region: "Canada — Ontario", edition: "CEC 2021 / OESC (CSA C22.1)", flag: "CA", available: true },
  { id: "NEC", region: "United States", edition: "NEC 2023 (NFPA 70)", flag: "US", available: false },
];

export function codeContext(standard: StandardId): CodeContext {
  const meta = CODE_STANDARDS.find((s) => s.id === standard) ?? CODE_STANDARDS[0];
  return { standard: meta.id, region: meta.region, edition: meta.edition };
}

export interface CategoryMeta {
  key: CalculatorCategory;
  label: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "load", label: "Load Calculation", description: "Residential, commercial and mixed-use service and feeder loads." },
  { key: "sizing", label: "Sizing", description: "Conductors, ampacity, breakers, fuses and equipment." },
  { key: "power", label: "Power & Analysis", description: "Voltage drop, fault current, power factor and more." },
  { key: "panel", label: "Panel Schedule", description: "Build and balance panel schedules." },
  { key: "conversion", label: "Conversions", description: "kVA, kW, amps and phase conversions." },
];

/** Registry keyed by standard. Today only CEC is populated. */
const REGISTRY: Record<StandardId, CalculatorDef[]> = {
  CEC: CEC_CALCULATORS,
  NEC: [],
};

export function listCalculators(standard: StandardId = "CEC"): CalculatorDef[] {
  return REGISTRY[standard] ?? [];
}

export function getCalculator(key: string, standard: StandardId = "CEC"): CalculatorDef | undefined {
  return listCalculators(standard).find((c) => c.key === key);
}

export function calculatorsByCategory(standard: StandardId = "CEC") {
  const list = listCalculators(standard);
  return CATEGORIES.map((cat) => ({
    ...cat,
    calculators: list.filter((c) => c.category === cat.key),
  })).filter((c) => c.calculators.length > 0 || c.key === "panel");
}

/**
 * The full product roadmap of calculators (implemented + planned). Drives the
 * directory so visitors see the complete scope; unimplemented ones link to a
 * "coming soon" state. Admin will later toggle these from the dashboard.
 */
export interface CatalogEntry {
  key: string;
  name: string;
  category: CalculatorCategory;
  status: "live" | "soon";
}

export const CATALOG: CatalogEntry[] = [
  { key: "dwelling-load", name: "Residential Load", category: "load", status: "live" },
  { key: "commercial-load", name: "Commercial / Mixed-Use Load", category: "load", status: "live" },
  { key: "motor-fla", name: "Motor FLA", category: "load", status: "live" },
  { key: "panel-schedule", name: "Panel Schedule", category: "panel", status: "live" },
  { key: "cable-size", name: "Cable / Wire Size", category: "sizing", status: "live" },
  { key: "ampacity", name: "Ampacity", category: "sizing", status: "live" },
  { key: "breaker-size", name: "Breaker Size", category: "sizing", status: "live" },
  { key: "fuse-size", name: "Fuse Size", category: "sizing", status: "live" },
  { key: "transformer-sizing", name: "Transformer Sizing", category: "sizing", status: "live" },
  { key: "capacitor-bank", name: "Capacitor Bank", category: "sizing", status: "live" },
  { key: "battery-size", name: "Battery Sizing", category: "sizing", status: "live" },
  { key: "conduit-fill", name: "Conduit Fill", category: "sizing", status: "live" },
  { key: "buried-cable", name: "Buried Cable Size", category: "sizing", status: "live" },
  { key: "general-sizing", name: "General Sizing", category: "sizing", status: "live" },
  { key: "voltage-drop", name: "Voltage Drop", category: "power", status: "live" },
  { key: "fault-current", name: "Fault Current", category: "power", status: "live" },
  { key: "short-circuit", name: "Short Circuit", category: "power", status: "live" },
  { key: "power-factor", name: "Power Factor", category: "power", status: "live" },
  { key: "arc-flash", name: "Arc Flash", category: "power", status: "live" },
  { key: "kva-to-amp", name: "kVA → Amps", category: "conversion", status: "live" },
  { key: "kw-to-amp", name: "kW → Amps", category: "conversion", status: "live" },
  { key: "three-phase", name: "Three-Phase", category: "conversion", status: "live" },
  { key: "single-phase", name: "Single-Phase", category: "conversion", status: "live" },
];
