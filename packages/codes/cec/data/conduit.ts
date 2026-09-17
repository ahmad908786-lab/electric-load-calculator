/**
 * Conduit-fill reference data. ⚠️ Approximate values — verify against CEC
 * Table 6/9 (conduit dimensions) and Table 10 (conductor cross-sectional areas)
 * for the exact insulation type. Areas below are for T90 Nylon / RW90 (XLPE)
 * class conductors and EMT trade sizes, in mm².
 */

/** Approx overall cross-sectional area of one insulated conductor (mm²), T90 Nylon. */
export const CONDUCTOR_AREA_MM2: Record<string, number> = {
  "14": 6.26, "12": 8.58, "10": 13.61, "8": 23.61, "6": 32.71, "4": 53.16,
  "3": 62.77, "2": 74.71, "1": 100.8, "1/0": 119.7, "2/0": 143.4, "3/0": 172.8,
  "4/0": 208.8, "250": 256.1, "300": 297.3, "350": 338.2, "400": 378.2, "500": 456.3,
};

export interface ConduitSize {
  trade: string;
  areaMm2: number; // 100% internal area
}

/** EMT internal areas (mm²), by trade size. */
export const CONDUIT_EMT: ConduitSize[] = [
  { trade: '1/2"', areaMm2: 196 },
  { trade: '3/4"', areaMm2: 344 },
  { trade: '1"', areaMm2: 557 },
  { trade: '1-1/4"', areaMm2: 965 },
  { trade: '1-1/2"', areaMm2: 1314 },
  { trade: '2"', areaMm2: 2165 },
  { trade: '2-1/2"', areaMm2: 3779 },
  { trade: '3"', areaMm2: 5707 },
  { trade: '3-1/2"', areaMm2: 7448 },
  { trade: '4"', areaMm2: 9518 },
];

/** Maximum conduit fill (CEC Rule 12-910 / Table 8): 1 cond 53%, 2 cond 31%, ≥3 cond 40%. */
export function maxFillPercent(nConductors: number): number {
  if (nConductors <= 1) return 53;
  if (nConductors === 2) return 31;
  return 40;
}
