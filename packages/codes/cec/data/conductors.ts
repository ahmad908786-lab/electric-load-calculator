/**
 * CEC conductor reference data.
 *
 * ⚠️ IMPORTANT — DATA VERIFICATION:
 * These values are transcribed from widely published conductor data and are
 * broadly harmonized with CEC 2021 Table 2 (copper) and Table 4 (aluminum),
 * 30 °C ambient, not more than three current-carrying conductors. They are
 * provided as REFERENCE DATA and MUST be validated against the licensed,
 * currently adopted edition of the code before any production/engineering use.
 * This file is intentionally the single source of truth so values can be
 * audited and corrected in one place (and later loaded from the DB so the
 * admin dashboard can maintain them).
 *
 * Ampacity is a fact-based number; we cite the governing table (CEC Table 2/4)
 * but do not reproduce the code's text or layout.
 */

export type Material = "cu" | "al";
export type TempRating = 60 | 75 | 90;

export interface ConductorRow {
  /** Canonical size id, e.g. "8", "1/0", "250". */
  size: string;
  /** Display label, e.g. "8 AWG", "1/0 AWG", "250 kcmil". */
  label: string;
  /** Cross-sectional area of the conductor metal, mm² (for VD by resistivity). */
  areaMm2: number;
  /** Allowable ampacity by insulation temperature column (copper, Table 2). */
  ampCu: Record<TempRating, number>;
  /** Allowable ampacity by insulation temperature column (aluminum, Table 4). */
  ampAl: Record<TempRating, number | null>;
}

/**
 * Ordered smallest → largest. Aluminum is not used below 8 AWG in practice, so
 * those cells are null. kcmil sizes carry no AWG.
 */
export const CONDUCTORS: ConductorRow[] = [
  { size: "14", label: "14 AWG", areaMm2: 2.08, ampCu: { 60: 15, 75: 20, 90: 25 }, ampAl: { 60: null, 75: null, 90: null } },
  { size: "12", label: "12 AWG", areaMm2: 3.31, ampCu: { 60: 20, 75: 25, 90: 30 }, ampAl: { 60: 15, 75: 20, 90: 25 } },
  { size: "10", label: "10 AWG", areaMm2: 5.26, ampCu: { 60: 30, 75: 35, 90: 40 }, ampAl: { 60: 25, 75: 30, 90: 35 } },
  { size: "8", label: "8 AWG", areaMm2: 8.37, ampCu: { 60: 40, 75: 50, 90: 55 }, ampAl: { 60: 30, 75: 40, 90: 45 } },
  { size: "6", label: "6 AWG", areaMm2: 13.3, ampCu: { 60: 55, 75: 65, 90: 75 }, ampAl: { 60: 40, 75: 50, 90: 55 } },
  { size: "4", label: "4 AWG", areaMm2: 21.2, ampCu: { 60: 70, 75: 85, 90: 95 }, ampAl: { 60: 55, 75: 65, 90: 75 } },
  { size: "3", label: "3 AWG", areaMm2: 26.7, ampCu: { 60: 85, 75: 100, 90: 110 }, ampAl: { 60: 65, 75: 75, 90: 85 } },
  { size: "2", label: "2 AWG", areaMm2: 33.6, ampCu: { 60: 95, 75: 115, 90: 130 }, ampAl: { 60: 75, 75: 90, 90: 100 } },
  { size: "1", label: "1 AWG", areaMm2: 42.4, ampCu: { 60: 110, 75: 130, 90: 150 }, ampAl: { 60: 85, 75: 100, 90: 115 } },
  { size: "1/0", label: "1/0 AWG", areaMm2: 53.5, ampCu: { 60: 125, 75: 150, 90: 170 }, ampAl: { 60: 100, 75: 120, 90: 135 } },
  { size: "2/0", label: "2/0 AWG", areaMm2: 67.4, ampCu: { 60: 145, 75: 175, 90: 195 }, ampAl: { 60: 115, 75: 135, 90: 150 } },
  { size: "3/0", label: "3/0 AWG", areaMm2: 85.0, ampCu: { 60: 165, 75: 200, 90: 225 }, ampAl: { 60: 130, 75: 155, 90: 175 } },
  { size: "4/0", label: "4/0 AWG", areaMm2: 107.2, ampCu: { 60: 195, 75: 230, 90: 260 }, ampAl: { 60: 150, 75: 180, 90: 205 } },
  { size: "250", label: "250 kcmil", areaMm2: 127, ampCu: { 60: 215, 75: 255, 90: 290 }, ampAl: { 60: 170, 75: 205, 90: 230 } },
  { size: "300", label: "300 kcmil", areaMm2: 152, ampCu: { 60: 240, 75: 285, 90: 320 }, ampAl: { 60: 195, 75: 230, 90: 260 } },
  { size: "350", label: "350 kcmil", areaMm2: 177, ampCu: { 60: 260, 75: 310, 90: 350 }, ampAl: { 60: 210, 75: 250, 90: 280 } },
  { size: "400", label: "400 kcmil", areaMm2: 203, ampCu: { 60: 280, 75: 335, 90: 380 }, ampAl: { 60: 225, 75: 270, 90: 305 } },
  { size: "500", label: "500 kcmil", areaMm2: 253, ampCu: { 60: 320, 75: 380, 90: 430 }, ampAl: { 60: 260, 75: 310, 90: 350 } },
  { size: "600", label: "600 kcmil", areaMm2: 304, ampCu: { 60: 355, 75: 420, 90: 475 }, ampAl: { 60: 285, 75: 340, 90: 385 } },
  { size: "750", label: "750 kcmil", areaMm2: 380, ampCu: { 60: 400, 75: 475, 90: 535 }, ampAl: { 60: 320, 75: 385, 90: 435 } },
];

/** Resistivity (Ω·mm²/m) at ~75 °C operating temp — physics, used for voltage drop. */
export const RESISTIVITY_75C: Record<Material, number> = {
  cu: 0.0214,
  al: 0.0353,
};

export function ampacity(row: ConductorRow, material: Material, temp: TempRating): number | null {
  return material === "cu" ? row.ampCu[temp] : row.ampAl[temp];
}

/** DC resistance of one conductor, Ω per metre, at 75 °C, from cross-section. */
export function resistancePerMetre(row: ConductorRow, material: Material): number {
  return RESISTIVITY_75C[material] / row.areaMm2;
}
