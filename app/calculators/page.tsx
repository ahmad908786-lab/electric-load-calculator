import type { Metadata } from "next";
import { CalculatorDirectory } from "@/components/home/calculator-directory";
import { CATALOG } from "@/packages/registry";

export const metadata: Metadata = {
  title: "All Electrical Calculators",
  description:
    "Every VoltCalc electrical calculator — load calculation, cable sizing, voltage drop, panel schedule and more, compliant with the Canadian Electrical Code (CEC/OESC).",
};

export default function CalculatorsIndex() {
  const live = CATALOG.filter((c) => c.status === "live").length;
  return (
    <div className="container-page py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Electrical Calculators</h1>
        <p className="mt-2 text-muted-foreground">
          {live} tools live today and more shipping every month — each one built on the Canadian Electrical Code (CEC/OESC) with inline code citations you can trust.
        </p>
      </div>
      <CalculatorDirectory />
    </div>
  );
}
