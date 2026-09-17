import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold tracking-tight">About VoltCalc</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          VoltCalc is a suite of electrical engineering calculators built around the code that governs the work.
          Every result — a conductor size, a breaker rating, a service load — comes with the exact rule or table it
          came from, so you can check it, defend it, and submit it.
        </p>
        <p>
          We start with the Canadian Electrical Code (CEC) and the Ontario Electrical Safety Code (OESC), and we&apos;re
          adding more regions. Alongside the calculators, our AI assistant searches the electrical code book and answers
          plain-language questions with references you can verify.
        </p>
        <p>
          VoltCalc is a reference tool, not a replacement for professional judgment. Always verify against the adopted
          code edition and a licensed electrician or engineer. Need the work done for you?{" "}
          <Link href="/#contact" className="font-medium text-primary">Hire our engineers</Link>.
        </p>
      </div>
    </div>
  );
}
