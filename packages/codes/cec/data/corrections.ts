/**
 * CEC correction/adjustment factors and standard device ratings.
 *
 * ⚠️ REFERENCE DATA — verify against the currently adopted code edition.
 * Temperature-correction values track CEC Table 5A (ambient ≠ 30 °C) and the
 * multi-conductor adjustment tracks CEC Table 5C. Standard overcurrent-device
 * ratings track CEC Rule 14-104 / Table 13.
 */

import type { TempRating } from "./conductors";

interface Bracket {
  maxC: number;
  factor: number;
}

/** Ambient-temperature correction factors, by insulation temp column. Table 5A. */
const TEMP_FACTORS: Record<TempRating, Bracket[]> = {
  60: [
    { maxC: 25, factor: 1.08 }, { maxC: 30, factor: 1.0 }, { maxC: 35, factor: 0.91 },
    { maxC: 40, factor: 0.82 }, { maxC: 45, factor: 0.71 }, { maxC: 50, factor: 0.58 },
  ],
  75: [
    { maxC: 25, factor: 1.05 }, { maxC: 30, factor: 1.0 }, { maxC: 35, factor: 0.94 },
    { maxC: 40, factor: 0.88 }, { maxC: 45, factor: 0.82 }, { maxC: 50, factor: 0.75 },
    { maxC: 55, factor: 0.67 }, { maxC: 60, factor: 0.58 },
  ],
  90: [
    { maxC: 25, factor: 1.04 }, { maxC: 30, factor: 1.0 }, { maxC: 35, factor: 0.96 },
    { maxC: 40, factor: 0.91 }, { maxC: 45, factor: 0.87 }, { maxC: 50, factor: 0.82 },
    { maxC: 55, factor: 0.76 }, { maxC: 60, factor: 0.71 }, { maxC: 70, factor: 0.58 },
    { maxC: 80, factor: 0.41 },
  ],
};

export function temperatureFactor(ambientC: number, temp: TempRating): number {
  const brackets = TEMP_FACTORS[temp];
  for (const b of brackets) {
    if (ambientC <= b.maxC) return b.factor;
  }
  return brackets[brackets.length - 1].factor;
}

/**
 * Adjustment factor for more than three current-carrying conductors bundled
 * together, CEC Table 5C. (Verify brackets against the adopted edition.)
 */
export function groupingFactor(count: number): number {
  if (count <= 3) return 1.0;
  if (count <= 6) return 0.8;
  if (count <= 9) return 0.7;
  if (count <= 20) return 0.5;
  if (count <= 30) return 0.45;
  if (count <= 40) return 0.4;
  return 0.35;
}

/** Standard overcurrent-device ampere ratings, CEC Rule 14-104 / Table 13. */
export const STANDARD_OCPD: number[] = [
  15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200,
  225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200,
];

/** Smallest standard OCPD rating at or above `amps` (Rule 14-104 rounding). */
export function nextStandardOcpd(amps: number): number {
  for (const r of STANDARD_OCPD) if (r >= amps) return r;
  return STANDARD_OCPD[STANDARD_OCPD.length - 1];
}

/** Largest standard OCPD rating at or below `amps` (for the "next size down" rule). */
export function prevStandardOcpd(amps: number): number {
  let best = STANDARD_OCPD[0];
  for (const r of STANDARD_OCPD) if (r <= amps) best = r;
  return best;
}

export interface InstallMethod {
  value: string;
  label: string;
  /** Governing ampacity table for this method. */
  table: string;
  /** Whether the multi-conductor grouping adjustment (5C) applies. */
  grouping: boolean;
  /** True when we compute from Table 2/4; false ⇒ flag result as approximate. */
  usesRacewayTable: boolean;
  note?: string;
}

export const INSTALL_METHODS: InstallMethod[] = [
  { value: "raceway", label: "In conduit / raceway", table: "Table 2 (Cu) / Table 4 (Al)", grouping: true, usesRacewayTable: true },
  { value: "cable", label: "In cable (e.g. NMD90, teck)", table: "Table 2 / Table 4", grouping: true, usesRacewayTable: true },
  { value: "free-air", label: "Free air (single, spaced)", table: "Table 1 (Cu) / Table 3 (Al)", grouping: false, usesRacewayTable: false, note: "Free-air ampacity is higher than in-raceway; governed by Table 1/3. Result shown is a conservative in-raceway estimate." },
  { value: "buried", label: "Direct buried", table: "Table D8B / D9B", grouping: false, usesRacewayTable: false, note: "Direct-burial ampacity is governed by the CEC Appendix D underground tables and depends on burial depth, soil resistivity and spacing. Result is an in-raceway approximation — verify against Table D8B/D9B." },
  { value: "duct-bank", label: "In underground duct bank", table: "Table D8A–D17", grouping: false, usesRacewayTable: false, note: "Duct-bank ampacity depends on the duct configuration and soil thermal resistivity (CEC Appendix D). Result is an in-raceway approximation — verify against the applicable Appendix D table." },
  { value: "overhead", label: "Overhead in free air", table: "Table 1 / Table 3", grouping: false, usesRacewayTable: false, note: "Overhead conductors in free air use Table 1/3. Result is a conservative in-raceway estimate." },
];

export function findInstallMethod(value: string): InstallMethod {
  return INSTALL_METHODS.find((m) => m.value === value) ?? INSTALL_METHODS[0];
}
