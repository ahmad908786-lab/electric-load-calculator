import Link from "next/link";
import { ArrowRight, Gauge, Cable, Activity, LayoutGrid, Repeat } from "lucide-react";
import type { CalculatorCategory } from "@/packages/calc-core/types";
import { CATALOG, CATEGORIES } from "@/packages/registry";

const ICONS: Record<CalculatorCategory, React.ReactNode> = {
  load: <Gauge className="h-4 w-4" />,
  sizing: <Cable className="h-4 w-4" />,
  power: <Activity className="h-4 w-4" />,
  panel: <LayoutGrid className="h-4 w-4" />,
  conversion: <Repeat className="h-4 w-4" />,
};

function hrefFor(key: string) {
  return key === "panel-schedule" ? "/panel-schedule" : `/calculators/${key}`;
}

export function CalculatorDirectory({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES.map((cat) => {
        const items = CATALOG.filter((c) => c.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key} className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{ICONS[cat.key]}</span>
              <div>
                <h3 className="text-sm font-semibold">{cat.label}</h3>
                {!compact && <p className="text-xs text-muted-foreground">{cat.description}</p>}
              </div>
            </div>
            <ul className="space-y-0.5">
              {items.map((c) => (
                <li key={c.key}>
                  <Link
                    href={hrefFor(c.key)}
                    className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      {c.name}
                      {c.status === "soon" && <span className="badge border-border text-[10px] text-muted-foreground">Soon</span>}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
