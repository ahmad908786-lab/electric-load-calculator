import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Construction } from "lucide-react";
import { CATALOG, getCalculator } from "@/packages/registry";
import { CalculatorRunner } from "@/components/calc/calculator-runner";

export function generateStaticParams() {
  return CATALOG.map((c) => ({ key: c.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  const calc = getCalculator(key);
  const entry = CATALOG.find((c) => c.key === key);
  const name = calc?.name ?? entry?.name ?? "Calculator";
  return {
    title: name,
    description: calc?.description ?? `${name} — CEC/OESC compliant electrical calculator with code citations.`,
  };
}

export default async function CalculatorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const calc = getCalculator(key);
  const entry = CATALOG.find((c) => c.key === key);

  if (!calc && !entry) notFound();

  const name = calc?.name ?? entry?.name ?? "Calculator";

  return (
    <div className="container-page py-8">
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/calculators" className="hover:text-foreground">Calculators</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="badge border-primary/30 bg-primary/10 text-primary">CEC / OESC</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{name}</h1>
        {calc && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{calc.description}</p>}
      </div>

      {calc ? (
        <CalculatorRunner calcKey={calc.key} />
      ) : (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Construction className="h-10 w-10 text-accent" />
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            The {name} calculator is on our roadmap. It will ship with full CEC citations like our live tools. Want it prioritized?
          </p>
          <Link href="/#contact" className="btn-primary">Request this calculator</Link>
        </div>
      )}
    </div>
  );
}
