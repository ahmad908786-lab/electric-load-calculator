import { AlertTriangle, BookOpen, Info, CheckCircle2 } from "lucide-react";
import type { CalcResult, Citation } from "@/packages/calc-core/types";
import { cn } from "@/lib/utils";

function CitationBadge({ c }: { c: Citation }) {
  return (
    <span className="badge border-primary/30 bg-primary/10 text-primary" title={c.note ?? ""}>
      <BookOpen className="h-3 w-3" />
      {c.code} {c.ref}
    </span>
  );
}

export function ResultCard({ result }: { result: CalcResult }) {
  const warnIcon = {
    info: <Info className="h-4 w-4" />,
    warn: <AlertTriangle className="h-4 w-4" />,
    error: <AlertTriangle className="h-4 w-4" />,
  };
  const warnClass = {
    info: "border-primary/30 bg-primary/5 text-foreground",
    warn: "border-warning/40 bg-warning/10 text-foreground",
    error: "border-danger/40 bg-danger/10 text-foreground",
  };

  return (
    <div className="space-y-5">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {result.summary.map((s, i) => (
          <div key={i} className={cn("card p-4", s.primary && "border-primary/40 bg-primary/5")}>
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className={cn("mt-1 font-bold tracking-tight", s.primary ? "text-3xl text-primary" : "text-xl")}>
              {s.value}
              {s.unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{s.unit}</span>}
            </p>
            {s.citation && <div className="mt-2"><CitationBadge c={s.citation} /></div>}
          </div>
        ))}
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((w, i) => (
            <div key={i} className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", warnClass[w.level])}>
              <span className="mt-0.5 shrink-0">{warnIcon[w.level]}</span>
              <span>
                {w.message}
                {w.citation && <span className="ml-2 inline-block align-middle"><CitationBadge c={w.citation} /></span>}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step-by-step breakdown */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Calculation breakdown</h3>
        </div>
        <div className="divide-y">
          {result.steps.map((step, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
              <div className="flex min-w-0 flex-col">
                <span className="font-medium">{step.label}</span>
                {step.detail && <span className="text-xs text-muted-foreground">{step.detail}</span>}
              </div>
              <div className="flex items-center gap-2">
                {step.citation && <CitationBadge c={step.citation} />}
                {step.value && <span className="font-mono font-semibold">{step.value}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code references */}
      {result.citations.length > 0 && (
        <div className="card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary" /> Code references
          </h3>
          <ul className="space-y-2">
            {result.citations.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CitationBadge c={c} />
                {c.note && <span className="text-muted-foreground">{c.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">{result.disclaimer}</p>
    </div>
  );
}
