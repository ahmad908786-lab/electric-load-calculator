/**
 * Equipment reference data: standard transformer sizes and motor full-load
 * current estimation. ⚠️ REFERENCE DATA — verify against the adopted edition.
 */

/** Standard three-phase dry-type transformer sizes (kVA). */
export const STANDARD_TRANSFORMER_KVA = [
  15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500,
];

/** Standard single-phase transformer sizes (kVA). */
export const STANDARD_TRANSFORMER_KVA_1PH = [
  5, 10, 15, 25, 37.5, 50, 75, 100, 167, 250, 333, 500,
];

export function nextTransformerKva(kva: number, phase: "1ph" | "3ph"): number {
  const list = phase === "3ph" ? STANDARD_TRANSFORMER_KVA : STANDARD_TRANSFORMER_KVA_1PH;
  for (const s of list) if (s >= kva) return s;
  return list[list.length - 1];
}

/**
 * Motor full-load current estimate from mechanical power.
 * Code sizing should use CEC Table 44 (3-phase) / Table 45 (single-phase); this
 * formula approximates those values from efficiency and power factor.
 */
export function motorFla(params: {
  watts: number;
  voltage: number;
  phase: "1ph" | "3ph";
  efficiency: number;
  pf: number;
}): number {
  const { watts, voltage, phase, efficiency, pf } = params;
  const denom = phase === "3ph" ? Math.sqrt(3) * voltage * efficiency * pf : voltage * efficiency * pf;
  return denom > 0 ? watts / denom : 0;
}

export const HP_TO_W = 746;
