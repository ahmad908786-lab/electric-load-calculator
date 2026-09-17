import type { BlogPost } from "./types";

/**
 * Built-in sample posts. Shown when no database is configured so the blog works
 * offline; once DATABASE_URL is set, posts are managed from the admin dashboard
 * and these are ignored. Each `body` is plain Markdown.
 */
export const SAMPLE_POSTS: BlogPost[] = [
  {
    id: "sample-commercial-space",
    slug: "commercial-space-load-calculation",
    title: "Commercial Space Load Calculation: A Worked Example (CEC Rule 8-210)",
    excerpt: "Step by step through a 400 m² retail service — area lighting, receptacles, HVAC and the largest motor — to a compliant service size.",
    coverImage: null,
    format: "docs",
    tags: ["Commercial", "Load Calculation", "Worked Example", "CEC"],
    author: "VoltCalc Team",
    status: "published",
    publishedAt: "2026-07-22T10:00:00.000Z",
    body: `Commercial and institutional occupancies are sized differently from dwellings. Instead of the living-area rules, you build up the calculated load from the actual connected loads — lighting, receptacles, HVAC and equipment — and apply the right factors. Here's the method, then a full worked example.

## The method

For a commercial space the calculated load is the sum of its parts, with two factors to remember [CEC Rule 8-210]:

- **Lighting** — the connected load, or a design density (often 20–35 W/m²). Lighting is continuous, so multiply by 1.25 [CEC Rule 8-104].
- **Receptacles** — the connected load, or an allowance per outlet.
- **HVAC** — at 100% of the connected load.
- **Largest motor** — add 25% of the largest motor's full-load current [CEC Section 28].
- **Other / special loads** — signage, water heating, kitchen equipment, EV, etc.

> "Continuous" means a load expected to run for 3 hours or more. Store lighting almost always qualifies, so the 1.25 factor applies.

## Worked example: a 400 m² retail unit

A single-storey retail unit, 400 m² of floor area, fed at 208 V three-phase. Design lighting density 30 W/m², plus receptacle and HVAC loads.

1. Lighting: 400 m² × 30 W/m² = 12 000 W. Continuous, so ×1.25 → **15 000 VA** [CEC Rule 8-210, 8-104].
2. Receptacles: **5 000 VA**.
3. HVAC (rooftop unit): **15 000 VA** at 100%.
4. Largest motor: included in the HVAC figure here; otherwise add 25% of its FLA.
5. Total calculated load = 15 000 + 5 000 + 15 000 = **35 000 VA = 35 kVA**.
6. Service current = 35 000 ÷ (208 × √3) = 35 000 ÷ 360.3 ≈ **97 A**.
7. Next standard service size = **100 A** [CEC Rule 14-104].

**Result:** a 100 A, 208 V three-phase service comfortably covers this unit. Add spare capacity (often 25%) if future tenants or equipment are likely.

## Watch-outs

- Occupancy-specific demand factors (Rule 8-208 to 8-304) can reduce the load for some building types — check yours.
- Kitchen, laundry and data-centre loads have their own rules and rarely follow the simple density approach.
- Size the conductors and overcurrent device for the continuous-adjusted current, not the raw connected load.

Try these numbers yourself in the [Commercial / Mixed-Use Load calculator](/calculators/commercial-load).

> For reference and estimation only. Verify every figure against the adopted CEC/OESC edition and have the design reviewed by a licensed electrician or engineer.`,
  },
  {
    id: "sample-mixed-use",
    slug: "mixed-use-building-load-calculation",
    title: "Mixed-Use Building Load Calculation: Retail Below, Apartments Above",
    excerpt: "Combining a commercial service with residential dwelling loads (CEC Rule 8-200 / 8-202 / 8-210) — a complete worked example to a 200 A service.",
    coverImage: null,
    format: "magazine",
    tags: ["Mixed-Use", "Load Calculation", "Residential", "Commercial"],
    author: "VoltCalc Team",
    status: "published",
    publishedAt: "2026-07-21T10:00:00.000Z",
    body: `Mixed-use buildings — retail or offices on the ground floor with apartments above — are one of the most common sources of load-calc confusion. The trick is simple: calculate each occupancy on its own rules, then add them for the main service.

## Two calculations, one service

The commercial portion follows the area/connected-load method [CEC Rule 8-210]. The residential portion follows the dwelling rules — Rule 8-200 for each unit and Rule 8-202 for the group of dwelling units. Keep them separate, then combine at the main service and metering point.

> Separate feeders (and meters) usually run to the commercial tenant and to the residential house panel, but the utility service must carry the combined calculated load.

## Step 1 — the commercial portion

Take the 400 m² retail unit from our commercial worked example: 30 W/m² lighting (×1.25), 5 kVA receptacles and 15 kVA HVAC give a calculated load of **35 kVA** [CEC Rule 8-210].

## Step 2 — the residential portion

Six apartment units sit above the retail. Each is calculated per Rule 8-200 at roughly 8 kW. Because the suites don't all peak together, Rule 8-202 lets you apply a demand factor to the summed suite loads.

1. Per-unit calculated load: ≈ 8 kW each [CEC Rule 8-200].
2. Connected total: 6 × 8 kW = 48 kW.
3. Apply the Rule 8-202 demand factor (illustrative 65% here) → 0.65 × 48 = **31.2 kW**.

> The Rule 8-202 demand schedule depends on the number of dwelling units and whether electric space heating is included — the 65% here is illustrative. Always use the exact factors from Rule 8-202(3).

## Step 3 — combine and size the service

1. Commercial: 35 kVA.
2. Residential: 31.2 kW ≈ 31.2 kVA.
3. Combined calculated load ≈ **66.2 kVA**.
4. Service current = 66 200 ÷ (208 × √3) ≈ **184 A**.
5. Next standard service = **200 A** [CEC Rule 14-104].

**Result:** a 200 A, 208 V three-phase main service. The commercial tenant and residential house panel are then fed from it through their own metering.

## Practical notes

- House/landlord loads (corridor lighting, elevators, pumps) are their own load — don't forget them.
- EV chargers may need an energy-management system to avoid over-sizing the service [CEC Rule 8-500].
- Confirm metering arrangements early with the utility; they affect where the split happens.

Model the split in the [Commercial / Mixed-Use Load calculator](/calculators/commercial-load).

> For reference and estimation only. Verify against the adopted CEC/OESC edition and have the design reviewed by a licensed electrician or engineer.`,
  },
  {
    id: "sample-apartment-building",
    slug: "apartment-building-service-sizing",
    title: "Sizing the Service for an Apartment Building (CEC Rule 8-202)",
    excerpt: "Multi-unit residential is more than the sum of its suites — demand factors let you right-size the service. A 12-unit worked example.",
    coverImage: null,
    format: "standard",
    tags: ["Residential", "Apartment", "Load Calculation", "CEC"],
    author: "VoltCalc Team",
    status: "published",
    publishedAt: "2026-07-20T10:00:00.000Z",
    body: `An apartment building's service isn't the sum of every suite at full load — that would be wildly oversized. Rule 8-202 recognizes that suites peak at different times and applies demand factors so you can size the service realistically.

## Step 1 — the per-unit load

Calculate each dwelling unit on its own with Rule 8-200: the basic living-area load (5000 W for the first 90 m² plus 1000 W per additional 90 m²), heating or AC, the range, water heating and any other loads.

## Step 2 — the building demand factor

Sum the suite loads, then apply the Rule 8-202 demand factor for the number of dwelling units. Electric space heating and air-conditioning are handled separately under their own demand rules.

> The demand factor falls as the number of units rises — a 40-unit building is far from 40× a single suite. The exact schedule lives in Rule 8-202(3).

## Worked example: a 12-unit building

1. Per-unit calculated load: ≈ 7 kW each [CEC Rule 8-200].
2. Connected total: 12 × 7 kW = 84 kW.
3. Apply the Rule 8-202 demand factor (illustrative 60%) → 0.60 × 84 ≈ **50.4 kW**.
4. Add house loads (corridor lighting, elevator, pumps): ≈ 15 kW.
5. Total calculated load ≈ **65.4 kW**.
6. Service current = 65 400 ÷ (208 × √3) ≈ 182 A → **200 A service** [CEC Rule 14-104].

**Result:** a 200 A, 208 V three-phase service for the whole building, with individual suite panels fed and metered downstream.

## Don't forget

- The house/landlord panel is a separate load — size it and include it above.
- EV charging often needs an energy-management system to stay within the service [CEC Rule 8-500].
- Leave spare capacity; retrofitting a bigger service later is expensive.

Start by calculating a single suite in the [Residential Load calculator](/calculators/dwelling-load).

> The demand factors here are illustrative. For reference only — verify against the adopted CEC/OESC edition and have the design reviewed by a licensed professional.`,
  },
  {
    id: "sample-voltage-drop",
    slug: "understanding-cec-voltage-drop-limits",
    title: "Understanding Voltage Drop Limits in the Canadian Electrical Code",
    excerpt: "Why the CEC caps voltage drop at 5%, how the 3% feeder rule fits in, and how to keep your runs compliant.",
    coverImage: null,
    format: "docs",
    tags: ["Voltage Drop", "CEC", "Design"],
    author: "VoltCalc Team",
    status: "published",
    publishedAt: "2026-07-18T10:00:00.000Z",
    body: `Voltage drop is one of the most common things flagged on electrical drawings — and one of the easiest to get right once you understand what the code actually requires.

## What the code says

CEC Rule 8-102 limits the voltage drop from the supply to the point of utilization to **5% of the nominal system voltage**. In practice, designers reserve a portion of that budget for the feeder (commonly 3%) and the remainder for branch circuits.

> The 5% figure is the overall limit. Splitting it — for example 2% feeder and 3% branch — keeps each part of the system within the total.

## How to calculate it

For a single-phase run, voltage drop equals **2 × I × R × L**; for three-phase, use **√3** instead of 2. R is the conductor resistance per unit length and L is the one-way run length.

1. Find the load current.
2. Pick a conductor and its resistance.
3. Compute the drop and divide by system voltage.
4. If over budget, increase the conductor size.

Check any run in seconds with the [Voltage Drop calculator](/calculators/voltage-drop).

> For reference only — verify against the adopted code edition and a licensed professional.`,
  },
  {
    id: "sample-service-size",
    slug: "sizing-a-residential-service-cec-8-200",
    title: "How to Size a Residential Electrical Service (CEC Rule 8-200)",
    excerpt: "A step-by-step walk through the single-dwelling calculated load, from basic living-area load to the minimum service ampacity.",
    coverImage: null,
    format: "standard",
    tags: ["Load Calculation", "Residential", "CEC"],
    author: "VoltCalc Team",
    status: "published",
    publishedAt: "2026-07-12T10:00:00.000Z",
    body: `Every residential service starts with a calculated load. CEC Rule 8-200 lays out exactly how to build it up.

## The basic load

Start with **5000 W for the first 90 m²** of living area, then add **1000 W for each additional 90 m²** (or portion). This covers general lighting and receptacles.

## Add the big loads

- Electric range: 6000 W, plus 40% of any rating above 12 kW.
- Space heating / AC: the larger of the two (they interlock).
- Water heater, EV charger and other fixed loads.

> A dwelling with a floor area of 80 m² or more needs a minimum 100 A service, regardless of the calculated number.

Sum the parts, divide by the service voltage, and round up to a standard service size. Run your own in the [Residential Load calculator](/calculators/dwelling-load).

> For reference only — verify against the adopted code edition and a licensed professional.`,
  },
  {
    id: "sample-cu-vs-al",
    slug: "copper-vs-aluminum-conductors",
    title: "Copper vs Aluminum Conductors: Ampacity and When to Use Each",
    excerpt: "Aluminum saves money on larger feeders, but the ampacity and termination trade-offs matter. Here's how to choose.",
    coverImage: null,
    format: "hero",
    tags: ["Conductors", "Ampacity", "Materials"],
    author: "VoltCalc Team",
    status: "published",
    publishedAt: "2026-07-05T10:00:00.000Z",
    body: `Copper and aluminum both have their place. The right choice depends on ampacity, cost, terminations and where the conductor is installed.

## Ampacity difference

For the same size, aluminum carries **less current than copper** — roughly one to two trade sizes' worth. That's the first thing to account for when swapping materials.

> Aluminum feeders are common above 100 A, where the material savings outweigh the up-sizing.

## Terminations

Use terminations and antioxidant compound rated for aluminum, and always torque to spec. Most conductor ampacity is capped by the **75 °C termination column** regardless of the insulation rating [CEC Rule 4-006].

Compare sizes for your load in the [Cable Size calculator](/calculators/cable-size).

> For reference only — verify against the adopted code edition and a licensed professional.`,
  },
  {
    id: "sample-panel-schedule",
    slug: "reading-and-balancing-a-panel-schedule",
    title: "Reading and Balancing a Panel Schedule",
    excerpt: "Odd-left, even-right numbering, phase balancing and why a lopsided panel causes problems.",
    coverImage: null,
    format: "minimal",
    tags: ["Panel Schedule", "Three Phase", "Basics"],
    author: "VoltCalc Team",
    status: "published",
    publishedAt: "2026-06-28T10:00:00.000Z",
    body: `## How circuits are numbered

Panel circuits run **odd numbers down the left column and even numbers down the right**. Each row corresponds to a phase, cycling A, B, C (or A, B on split-phase).

> A panel loaded heavily on one phase overloads that leg while the others sit idle — balance the connected load across phases.

## Balancing in practice

- Total the connected VA on each phase.
- Move circuits so the phase totals are close.
- Multi-pole breakers spread their load across the phases they span.

Build a balanced schedule automatically with the [Panel Schedule builder](/panel-schedule).`,
  },
];
