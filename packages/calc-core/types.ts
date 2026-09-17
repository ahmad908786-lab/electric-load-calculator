/**
 * calc-core — shared, UI-agnostic types for every calculator in every code standard.
 *
 * The design principle (see plan): a calculator is a *pure function* of
 * `(inputs, codeContext) => CalcResult`. Every result carries not just numbers
 * but the **deration steps** and **code citations** that produced them — this is
 * the product's differentiator. Calculators are also *schema-driven*: each one
 * declares its input `fields`, so the web UI and the admin dashboard can render
 * and gate any calculator without bespoke code.
 */

export type StandardId = "CEC" | "NEC";

export interface CodeContext {
  /** Which code standard's rules to apply. */
  standard: StandardId;
  /** Human region label, e.g. "Ontario, Canada". */
  region: string;
  /** Edition label, e.g. "CEC 2021 (CSA C22.1)". */
  edition: string;
}

/** A reference back to the governing code, surfaced inline next to a value. */
export interface Citation {
  /** Standard short code, e.g. "CEC". */
  code: StandardId;
  /** The clause/table id, e.g. "Table 2", "Rule 8-200", "8-102". */
  ref: string;
  /** Optional plain-language note (paraphrase only — never reproduce code text). */
  note?: string;
}

/** One line in the transparent calculation breakdown. */
export interface CalcStep {
  label: string;
  /** Formatted value for display, e.g. "55 A". */
  value?: string;
  /** Extra detail, e.g. "×0.80 grouping factor". */
  detail?: string;
  citation?: Citation;
}

export type WarningLevel = "info" | "warn" | "error";

export interface CalcWarning {
  level: WarningLevel;
  message: string;
  citation?: Citation;
}

/** A headline output value shown in the result card. */
export interface ResultValue {
  label: string;
  value: string;
  unit?: string;
  /** Marks the single most important number (rendered largest). */
  primary?: boolean;
  citation?: Citation;
}

export interface CalcResult {
  summary: ResultValue[];
  steps: CalcStep[];
  citations: Citation[];
  warnings: CalcWarning[];
  /** Always present — professional-liability guard rail. */
  disclaimer: string;
}

/* ------------------------------------------------------------------ */
/* Schema-driven input fields                                          */
/* ------------------------------------------------------------------ */

export type FieldType = "number" | "select" | "text" | "boolean";

export interface FieldOption {
  value: string;
  label: string;
}

export interface CalcField {
  name: string;
  label: string;
  type: FieldType;
  /** Unit suffix shown in the input, e.g. "A", "m", "V". */
  unit?: string;
  default?: string | number | boolean;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  /** `${otherField}=${value}` — only show this field when the condition holds. */
  showWhen?: string;
  /** Group heading for laying out the form into sections. */
  group?: string;
  required?: boolean;
}

export type CalcInputs = Record<string, string | number | boolean | undefined>;

export type CalculatorCategory =
  | "load"
  | "sizing"
  | "power"
  | "panel"
  | "conversion";

export interface CalculatorDef {
  /** Stable url/db key, e.g. "cable-size". */
  key: string;
  name: string;
  category: CalculatorCategory;
  /** One-line description for cards and SEO. */
  description: string;
  /** Standards this calculator supports. */
  standards: StandardId[];
  fields: CalcField[];
  compute: (inputs: CalcInputs, ctx: CodeContext) => CalcResult;
}

/** Standard professional-liability disclaimer appended to every result. */
export const DISCLAIMER =
  "For reference and estimation only. Results must be verified against the current, " +
  "adopted edition of the electrical code and reviewed by a licensed electrician or " +
  "professional engineer. This tool is not a substitute for a stamped design.";
