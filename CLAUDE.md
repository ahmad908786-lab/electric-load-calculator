# VoltCalc — project guide for Claude

Subscription platform of **code-compliant electrical calculators** + an **AI code
assistant**, starting with the Canadian Electrical Code (CEC 2021 / OESC).
Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma/Postgres+pgvector.

## Node on this machine
Node 24 LTS is installed at `C:\Users\admin\nodejs` (portable, on USER PATH).
In fresh shells prepend it: `$env:Path = 'C:\Users\admin\nodejs;' + $env:Path`.

## Commands
- `npm run dev` — dev server (port 3000, or auto if taken)
- `npm test` — engine unit tests (vitest); `npx tsc --noEmit` — typecheck

## Architecture rules
- A calculator is a **pure** `(inputs, ctx) => CalcResult` with `steps[]` +
  `citations[]`. Types in `packages/calc-core/`. Never reproduce copyrighted code
  text — cite table/rule **numbers** and paraphrase.
- Add a CEC calculator: new file in `packages/codes/cec/calculators/`, export a
  `CalculatorDef`, register in `packages/codes/cec/index.ts`, add a `CATALOG`
  entry in `packages/registry.ts`. The schema-driven UI renders it automatically.
- Reference data lives in `packages/codes/cec/data/` — **flagged verify-against-code**.
- Tailwind v4: you **cannot `@apply` a custom class inside another** (e.g.
  `@apply btn`). Share a base by listing selectors together. Dark mode is the
  `.dark` class (see `app/globals.css` `@custom-variant`).

## Status
Phase-1 MVP is live and runs offline (calculators, panel schedule, landing).
Auth/Stripe/RAG/admin-data need external credentials — schema (`prisma/schema.prisma`)
and UI shells exist; see `README.md` and `.env.example`.

@AGENTS.md
