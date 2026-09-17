import type { Citation } from "@/packages/calc-core/types";

/**
 * Curated CEC knowledge base for the local (no-API-key) assistant. Each entry
 * is matched against the question by keyword/pattern score; the best answer is
 * returned with its citations and an optional calculator to open.
 */
export interface KBEntry {
  id: string;
  keywords: string[];
  patterns?: RegExp[];
  answer: string;
  citations: Citation[];
  calc?: { key: string; label: string };
}

const cite = (ref: string, note?: string): Citation => ({ code: "CEC", ref, note });

export const KNOWLEDGE: KBEntry[] = [
  {
    id: "voltage-drop-limit",
    keywords: ["voltage", "drop", "vd", "5%", "3%", "limit", "8-102"],
    patterns: [/voltage\s*drop/],
    answer:
      "The CEC limits **voltage drop from the supply to the point of utilization to 5%** of nominal voltage [CEC Rule 8-102]. Designers usually split that budget — commonly **3% for a feeder or branch** and the rest elsewhere. For a single-phase run, Vd = 2·I·R·L; for three-phase use √3.",
    citations: [cite("Rule 8-102", "Voltage-drop limits (5% overall; 3% common per section)."), cite("Table D3", "Voltage-drop reference data.")],
    calc: { key: "voltage-drop", label: "Voltage Drop calculator" },
  },
  {
    id: "ampacity",
    keywords: ["ampacity", "current", "carry", "rated", "amps", "table 2", "table 4"],
    patterns: [/ampacit/],
    answer:
      "Allowable conductor ampacity comes from **[CEC Table 2] (copper)** and **[CEC Table 4] (aluminum)** for conductors in raceway or cable, at 30 °C ambient with not more than three current-carrying conductors. Correct for ambient with **[CEC Table 5A]** and for bundling with **[CEC Table 5C]**, and remember the termination limit **[CEC Rule 4-006]**.",
    citations: [cite("Table 2", "Copper ampacity."), cite("Table 4", "Aluminum ampacity."), cite("Rule 4-006", "Termination temperature limit.")],
    calc: { key: "ampacity", label: "Ampacity lookup" },
  },
  {
    id: "grouping-derating",
    keywords: ["derate", "derating", "grouping", "bundled", "more than 3", "spacing", "5c", "conductors in"],
    patterns: [/more than (three|3)/, /bundl/, /derat/],
    answer:
      "When more than three current-carrying conductors share a raceway or cable, reduce their ampacity by the **[CEC Table 5C]** factor (≈0.80 for 4–6, 0.70 for 7–9, and lower above that). Apply it together with the ambient-temperature correction from **[CEC Table 5A]**.",
    citations: [cite("Table 5C", "Adjustment for more than three current-carrying conductors."), cite("Table 5A", "Ambient temperature correction.")],
    calc: { key: "cable-size", label: "Cable Size calculator" },
  },
  {
    id: "continuous-load",
    keywords: ["continuous", "125%", "125 percent", "3 hour", "three hour", "8-104"],
    patterns: [/125\s*%/, /continuous/],
    answer:
      "A **continuous load** (expected to run for 3 hours or more) is sized at **125% of the load** for conductors and overcurrent devices [CEC Rule 8-104]. So a 40 A continuous load needs conductors/OCPD rated for 40 × 1.25 = 50 A.",
    citations: [cite("Rule 8-104", "Continuous-load 125% factor.")],
    calc: { key: "breaker-size", label: "Breaker Size calculator" },
  },
  {
    id: "dwelling-service",
    keywords: ["service", "dwelling", "house", "home", "residential", "minimum service", "100 amp", "8-200"],
    patterns: [/service size/, /size .*service/, /(house|dwelling|home)/],
    answer:
      "A single-dwelling calculated load starts with **5000 W for the first 90 m² of living area plus 1000 W for each additional 90 m²** [CEC Rule 8-200], then adds heating/AC (the larger of the two), an electric range (6000 W + 40% over 12 kW), and other loads. A dwelling of **80 m² or more needs a minimum 100 A service**.",
    citations: [cite("Rule 8-200", "Single-dwelling calculated load."), cite("Rule 8-106", "Demand factors, heating/AC interlock.")],
    calc: { key: "dwelling-load", label: "Residential Load calculator" },
  },
  {
    id: "termination-temp",
    keywords: ["termination", "lug", "terminal", "75", "90", "60 degree", "4-006"],
    patterns: [/terminat/],
    answer:
      "Conductor ampacity is capped by the **temperature rating of the terminations** [CEC Rule 4-006]. Even with 90 °C insulation, if the equipment lugs are rated 75 °C you must use the 75 °C ampacity column for the final selection (the 90 °C column is only used for applying derating factors).",
    citations: [cite("Rule 4-006", "Ampacity limited by termination temperature rating.")],
    calc: { key: "cable-size", label: "Cable Size calculator" },
  },
  {
    id: "breaker-sizing",
    keywords: ["breaker", "overcurrent", "ocpd", "standard size", "next size", "14-104", "fuse"],
    patterns: [/breaker|overcurrent|ocpd/],
    answer:
      "Overcurrent devices come in **standard ampere ratings** — 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200 A and up [CEC Rule 14-104]. Size to at least the (continuous-adjusted) load, then round to the next standard rating, coordinating with conductor ampacity.",
    citations: [cite("Rule 14-104", "Standard overcurrent-device ratings."), cite("Rule 8-104", "Continuous-load factor.")],
    calc: { key: "breaker-size", label: "Breaker Size calculator" },
  },
  {
    id: "motor",
    keywords: ["motor", "fla", "full load", "28-106", "section 28"],
    patterns: [/motor/],
    answer:
      "Motor branch-circuit conductors are sized at **125% of the motor full-load current** [CEC Rule 28-106], and the FLA should be taken from **[CEC Table 44] (three-phase)** or **[CEC Table 45] (single-phase)** rather than the nameplate. Overload and branch protection have their own maximum percentages.",
    citations: [cite("Rule 28-106", "Motor conductors at 125% of FLA."), cite("Table 44", "Three-phase motor FLA."), cite("Table 45", "Single-phase motor FLA.")],
    calc: { key: "motor-fla", label: "Motor FLA calculator" },
  },
  {
    id: "conduit-fill",
    keywords: ["conduit", "fill", "raceway fill", "how many conductors", "40%", "12-910"],
    patterns: [/conduit\s*fill/, /fill/],
    answer:
      "Maximum conduit fill is **53% for one conductor, 31% for two, and 40% for three or more** [CEC Rule 12-910]. Use the conductor areas in **[CEC Table 10]** and the conduit areas in **[CEC Table 6/9]** to check the percentage.",
    citations: [cite("Rule 12-910", "Maximum conduit fill percentages."), cite("Table 10", "Conductor cross-sectional areas.")],
    calc: { key: "conduit-fill", label: "Conduit Fill calculator" },
  },
  {
    id: "copper-vs-aluminum",
    keywords: ["aluminum", "aluminium", "copper", "cu", "al", "material"],
    patterns: [/alumin/, /copper/],
    answer:
      "For the same size, **aluminum carries less current than copper** — roughly one to two trade sizes' worth — so aluminum feeders are usually up-sized [CEC Table 4 vs Table 2]. Aluminum is common above 100 A for the cost savings; use terminations rated for aluminum and torque to spec.",
    citations: [cite("Table 2", "Copper ampacity."), cite("Table 4", "Aluminum ampacity.")],
    calc: { key: "cable-size", label: "Cable Size calculator" },
  },
  {
    id: "fault-current",
    keywords: ["fault", "short circuit", "interrupting", "withstand", "aic", "14-012"],
    patterns: [/fault|short\s*circuit/],
    answer:
      "Equipment must have an **interrupting/withstand rating at least equal to the available fault current** at its location [CEC Rule 14-012]. A quick transformer-secondary estimate (infinite primary) is I = FLA ÷ %Z; the real value is lower once source and conductor impedance are included.",
    citations: [cite("Rule 14-012", "Equipment rated for available fault current.")],
    calc: { key: "fault-current", label: "Fault Current calculator" },
  },
  {
    id: "arc-flash",
    keywords: ["arc flash", "incident energy", "ppe", "z462", "cal/cm"],
    patterns: [/arc\s*flash/],
    answer:
      "Arc-flash incident energy and PPE are determined by an **arc-flash study per IEEE 1584 / CSA Z462**. Our calculator gives an IEEE 1584-2002 **screening estimate** only — a qualified study is required for real labeling and PPE selection.",
    citations: [cite("Rule 2-306", "Hazard assessment; work per CSA Z462.")],
    calc: { key: "arc-flash", label: "Arc Flash calculator" },
  },
  {
    id: "power-factor",
    keywords: ["power factor", "kvar", "capacitor", "correction", "leading", "lagging"],
    patterns: [/power\s*factor/],
    answer:
      "To correct power factor, the capacitor size is **kVAR = kW × (tan φ₁ − tan φ₂)**, where φ is arccos of the power factor. Avoid over-correcting into a leading power factor at light load.",
    citations: [],
    calc: { key: "power-factor", label: "Power Factor calculator" },
  },
  {
    id: "panel-balance",
    keywords: ["panel", "phase balance", "panel schedule", "circuit number", "odd even"],
    patterns: [/panel/],
    answer:
      "Panel circuits are numbered **odd down the left, even down the right**, with each row on a phase (A, B, C on three-phase). Balance the connected VA across phases so no single leg is overloaded; multi-pole breakers spread their load across the phases they span.",
    citations: [cite("Rule 14-104", "Standard device ratings.")],
    calc: { key: "panel-schedule", label: "Panel Schedule builder" },
  },
];
