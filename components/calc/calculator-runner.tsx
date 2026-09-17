"use client";

import { useMemo, useState } from "react";
import { FileDown, Printer, RotateCcw, Save } from "lucide-react";
import { getCalculator, codeContext } from "@/packages/registry";
import type { CalcField, CalcInputs } from "@/packages/calc-core/types";
import { saveCalculationAction } from "@/app/actions/calculations";
import { ResultCard } from "./result-card";

function defaults(fields: CalcField[]): CalcInputs {
  const out: CalcInputs = {};
  for (const f of fields) out[f.name] = f.default ?? (f.type === "boolean" ? false : f.type === "number" ? 0 : "");
  return out;
}

function visible(field: CalcField, inputs: CalcInputs): boolean {
  if (!field.showWhen) return true;
  const [name, value] = field.showWhen.split("=");
  return String(inputs[name]) === value;
}

export function CalculatorRunner({ calcKey }: { calcKey: string }) {
  const calc = getCalculator(calcKey);
  const [inputs, setInputs] = useState<CalcInputs>(() => (calc ? defaults(calc.fields) : {}));
  const [exporting, setExporting] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const result = useMemo(() => {
    if (!calc) return null;
    try {
      return calc.compute(inputs, codeContext("CEC"));
    } catch {
      return null;
    }
  }, [calc, inputs]);

  if (!calc) return <p className="text-sm text-muted-foreground">Calculator not found.</p>;

  const groups = Array.from(new Set(calc.fields.map((f) => f.group ?? "Inputs")));

  function set(name: string, value: string | number | boolean) {
    setInputs((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* Input form */}
      <form className="card h-fit p-5 print:hidden" onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Inputs</h2>
          <button type="button" onClick={() => setInputs(defaults(calc.fields))} className="btn-ghost h-8 gap-1 px-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
        <div className="space-y-5">
          {groups.map((group) => (
            <fieldset key={group} className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</legend>
              {calc.fields.filter((f) => (f.group ?? "Inputs") === group && visible(f, inputs)).map((f) => (
                <Field key={f.name} field={f} value={inputs[f.name]} onChange={(v) => set(f.name, v)} />
              ))}
            </fieldset>
          ))}
        </div>
      </form>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <h2 className="text-sm font-semibold">Results</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!result}
              onClick={async () => {
                if (!result) return;
                setSaveMsg("Saving…");
                const r = await saveCalculationAction({ calculatorKey: calc.key, inputs, result });
                setSaveMsg(r.ok ? "Saved to your dashboard." : r.error ?? "Could not save.");
              }}
              className="btn-outline h-8 gap-1.5 px-3 text-xs"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
            <button
              type="button"
              disabled={!result || exporting}
              onClick={async () => {
                if (!result) return;
                setExporting(true);
                try {
                  const { exportResultPdf } = await import("@/lib/export/pdf");
                  await exportResultPdf({ title: calc.name, fields: calc.fields, inputs, result });
                } finally {
                  setExporting(false);
                }
              }}
              className="btn-primary h-8 gap-1.5 px-3 text-xs"
            >
              <FileDown className="h-3.5 w-3.5" /> {exporting ? "Preparing…" : "Download PDF"}
            </button>
            <button type="button" onClick={() => window.print()} className="btn-outline h-8 gap-1.5 px-3 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>
        {saveMsg && <p className="text-xs text-muted-foreground print:hidden">{saveMsg}</p>}
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}

function Field({ field, value, onChange }: { field: CalcField; value: CalcInputs[string]; onChange: (v: string | number | boolean) => void }) {
  if (field.type === "boolean") {
    return (
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border accent-[var(--primary)]"
        />
        <span className="font-medium">{field.label}</span>
        {field.help && <span className="text-xs text-muted-foreground">— {field.help}</span>}
      </label>
    );
  }

  return (
    <div>
      <label className="field-label">
        {field.label}
        {field.unit && <span className="ml-1 font-normal text-muted-foreground">({field.unit})</span>}
      </label>
      {field.type === "select" ? (
        <select className="field-input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          className="field-input"
          value={value === undefined ? "" : String(value)}
          min={field.min}
          max={field.max}
          step={field.step ?? (field.type === "number" ? "any" : undefined)}
          onChange={(e) => onChange(field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
        />
      )}
      {field.help && <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}
