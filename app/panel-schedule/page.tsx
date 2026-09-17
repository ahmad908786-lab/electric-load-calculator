import type { Metadata } from "next";
import { PanelScheduleBuilder } from "@/components/panel/panel-schedule-builder";

export const metadata: Metadata = {
  title: "Panel Schedule Builder",
  description:
    "Build a balanced electrical panel schedule: add circuits with load and poles, auto-number odd/even, balance across phases, and export. CEC-aligned.",
};

export default function PanelSchedulePage() {
  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <span className="badge border-primary/30 bg-primary/10 text-primary">CEC / OESC</span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Panel Schedule Builder</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Add circuits with a load and pole count — VoltCalc auto-numbers them (odd left, even right), balances the load across phases, and keeps a live per-phase total. Export to CSV.
        </p>
      </div>
      <PanelScheduleBuilder />
    </div>
  );
}
