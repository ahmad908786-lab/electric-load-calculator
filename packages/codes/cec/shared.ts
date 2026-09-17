/** Shared electrical primitives used across CEC calculators. */

import type { ConductorRow, Material } from "./data/conductors";
import { resistancePerMetre } from "./data/conductors";

export type SystemType = "dc" | "1ph" | "3ph";

/** Line-to-line multiplier for power/drop: 2 for DC & single-phase, √3 for three-phase. */
export function systemFactor(system: SystemType): number {
  return system === "3ph" ? Math.sqrt(3) : 2;
}

/**
 * Voltage drop in volts along a run.
 * Vd = k · I · R_perMetre · L / sets   (k = 2 or √3; sets = parallel conductors/phase)
 */
export function voltageDropVolts(params: {
  system: SystemType;
  current: number;
  row: ConductorRow;
  material: Material;
  lengthM: number;
  sets?: number;
}): number {
  const { system, current, row, material, lengthM } = params;
  const sets = Math.max(1, params.sets ?? 1);
  const r = resistancePerMetre(row, material) / sets;
  return systemFactor(system) * current * r * lengthM;
}

/** Line current from apparent/real power. */
export function currentFromKva(kva: number, voltage: number, system: SystemType): number {
  const f = system === "3ph" ? Math.sqrt(3) : 1;
  return (kva * 1000) / (voltage * f);
}

export function currentFromKw(kw: number, voltage: number, pf: number, system: SystemType): number {
  const f = system === "3ph" ? Math.sqrt(3) : 1;
  return (kw * 1000) / (voltage * f * Math.max(0.01, pf));
}
