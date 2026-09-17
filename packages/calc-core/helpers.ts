/** Small shared helpers for reading schema-driven inputs and formatting output. */

import type { CalcInputs } from "./types";

export function num(inputs: CalcInputs, key: string, fallback = 0): number {
  const v = inputs[key];
  if (v === undefined || v === null || v === "") return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

export function str(inputs: CalcInputs, key: string, fallback = ""): string {
  const v = inputs[key];
  return v === undefined || v === null ? fallback : String(v);
}

export function bool(inputs: CalcInputs, key: string, fallback = false): boolean {
  const v = inputs[key];
  if (v === undefined || v === null || v === "") return fallback;
  return v === true || v === "true" || v === "1" || v === "yes";
}

/** Round to n decimals without floating-point noise. */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Format a number with thousands separators and up to `decimals` places. */
export function fmt(value: number, decimals = 0): string {
  return round(value, decimals).toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/** Format watts as W or kW depending on magnitude. */
export function fmtPower(watts: number): string {
  return watts >= 1000 ? `${fmt(watts / 1000, 2)} kW` : `${fmt(watts, 0)} W`;
}
