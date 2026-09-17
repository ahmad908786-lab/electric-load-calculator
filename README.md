# VoltCalc — Code-Compliant Electrical Calculators + AI Code Search

A subscription web platform of electrical engineering calculators where **every
result cites the electrical code**, plus an AI assistant that answers code
questions with references. Starting with the **Canadian Electrical Code
(CEC 2021 / Ontario OESC)**; architected to add NEC and other regions.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind v4**. Calculation
engine is pure, unit-tested TypeScript. Data layer is Prisma + Postgres/pgvector.

---

## Quick start

```bash
# Node.js 20+ is required (this project was built on Node 24 LTS).
npm install
npm run dev            # http://localhost:3000
npm test               # run the calculation-engine unit tests
```

The calculators, panel schedule and UI **run with no configuration**. External
services are optional and each lights up more of the product — see `.env.example`.

---

## What's built (Phase 1 MVP)

| Area | Status | Notes |
|---|---|---|
| Landing page (hero + AI chat, calculator directory, contact/hire, footer) | ✅ Live | `app/page.tsx` |
| **CEC calculation engine** | ✅ Live, tested | `packages/codes/cec/` — pure functions returning `{ result, steps[], citations[] }` |
| Cable/conductor size (ampacity + derating + voltage drop) | ✅ Live | Cu/Al, install methods, termination limits |
| Residential (Rule 8-200) & Commercial/Mixed-use load | ✅ Live | |
| Voltage drop, ampacity, breaker size, kVA→A, kW→A | ✅ Live | |
| **Panel schedule builder** | ✅ Live | auto odd/even numbering, phase balancing, CSV export |
| Schema-driven calculator UI + inline citations | ✅ Live | `components/calc/` |
| PDF + Excel export (results & panel schedule) | ✅ Live | `lib/export/` (jsPDF, exceljs) |
| Region selector, dark/light theme | ✅ Live | |
| Pricing, user dashboard, admin dashboard | ✅ Live | real data when signed in |
| AI code-search chat | ✅ Code-complete | works as stub offline; add `ANTHROPIC_API_KEY` |
| Auth (email/password, sessions) | ✅ Code-complete | activate with `DATABASE_URL` + `AUTH_SECRET` |
| Stripe subscriptions + free-tier metering | ✅ Code-complete | activate with Stripe keys + price ids |
| Code-book ingestion (PDF → pgvector) | ✅ Code-complete | admin upload → `lib/rag.ts`; add `VOYAGE_API_KEY` |

Remaining ~20 calculators (transformer, short-circuit, arc-flash, etc.) are
listed in the directory as "Coming soon" and each drops into
`packages/codes/cec/calculators/` + the registry.

---

## Architecture

```
app/                     Next.js routes (marketing, /calculators/[key], /panel-schedule,
                         /dashboard, /admin, /pricing, /api/chat, /api/contact)
components/              UI: site chrome, calculator runner + result card, panel builder, chat
packages/
  calc-core/             Shared types: CalcResult{ result, steps[], citations[] }, DISCLAIMER
  codes/cec/             CEC engine — data tables + calculators + unit tests
  registry.ts            Standards, categories, calculator catalog (what the UI reads)
lib/                     utils (cn), plans (pricing)
prisma/schema.prisma     Full data model (User, Subscription, Usage, Project, Calculation,
                         PanelSchedule, CodeChunk[vector], ChatMessage, ContactSubmission, *Config)
```

**Design principle:** a calculator is a pure `(inputs, codeContext) => CalcResult`.
Results carry their derating **steps** and **code citations**, so the UI, exports
and admin all render from one source. Switching region = swapping the code module.

---

## ⚠️ Important before public launch

- **Content rights.** The operator has confirmed the code source may be used and
  reproduced freely in this product, so the AI may quote the code directly and
  full text can be displayed. (If distributing publicly, it's still worth
  confirming redistribution rights for your jurisdiction.) The reference data
  tables in `packages/codes/cec/data/` must still be **validated against the
  adopted edition** — that's accuracy/safety, not copyright.
- **Professional liability.** Every result keeps a "verify with a licensed
  professional" disclaimer — that's about safety, independent of content rights.

---

## Enabling the rest (when you have credentials)

1. **AI chat:** set `ANTHROPIC_API_KEY` → `/api/chat` calls Claude with the
   citation system prompt.
2. **Database:** point `DATABASE_URL` at Neon Postgres (with `vector`), then
   `npx prisma migrate dev`. Unlocks auth, saved work, metering, RAG storage.
3. **Auth:** `npx auth secret` + Google OAuth creds → wire Auth.js.
4. **Stripe:** add keys + price IDs; test webhooks with the Stripe CLI.
5. **Code ingestion:** implement `retrieveContext()` (embed with Voyage, query
   `CodeChunk`); add an admin upload that runs PDF extract + OCR → chunk → embed.

See the plan at `.claude/plans/` and `.env.example` for the full checklist.
