import Link from "next/link";
import { Zap } from "lucide-react";
import { CATALOG } from "@/packages/registry";

const liveKeys = new Set(CATALOG.filter((c) => c.status === "live").map((c) => c.key));

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Calculators",
    links: [
      { href: "/calculators/dwelling-load", label: "Residential Load" },
      { href: "/calculators/commercial-load", label: "Commercial Load" },
      { href: "/calculators/cable-size", label: "Cable Size" },
      { href: "/calculators/voltage-drop", label: "Voltage Drop" },
      { href: "/panel-schedule", label: "Panel Schedule" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/calculators", label: "All calculators" },
      { href: "/assistant", label: "AI code search" },
      { href: "/blog", label: "Blog" },
      { href: "/pricing", label: "Pricing" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#contact", label: "Contact us" },
      { href: "/#contact", label: "Hire us" },
      { href: "/about", label: "About" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface">
      <div className="container-page grid gap-8 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </span>
            <span className="text-lg">Volt<span className="text-primary">Calc</span></span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Code-compliant electrical calculators and an AI assistant that cites the electrical code book. Starting with the Canadian Electrical Code (CEC/OESC).
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Not affiliated with CSA Group or the Electrical Safety Authority. Code references are for guidance only — verify against the licensed, adopted code edition.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} VoltCalc. All rights reserved.</p>
          <p>For reference and estimation only — not a substitute for a stamped design.</p>
        </div>
      </div>
    </footer>
  );
}
