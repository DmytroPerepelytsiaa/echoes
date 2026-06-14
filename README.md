# Echoes — AI insights for your decisions

Echoes is a small full‑stack app where you record a complex life or work
decision you've **already made**, and an LLM analyses it to surface deeper
insight into its quality: the **decision category**, the **cognitive biases**
likely at play, and the **alternatives you may have missed**.

> Built as a test assignment. Stack: **Next.js 16 (App Router) · TypeScript ·
> Tailwind v4 · Radix UI · Postgres (Neon) · Drizzle ORM · Zod · BetterAuth
> (JWT) · Vercel AI SDK + Groq**.

- **Live demo:** _add your Vercel URL here_
- **Repository:** _this repo_

---

## Features

**Core**

- 🔐 **Real authentication** — email + password via **BetterAuth**, with the
  JWT plugin (JWKS stored in the database) and session cookies. Routes are
  guarded both by a Next.js proxy (edge cookie check) and server‑side session
  validation.
- 📝 **Record a decision** — a form for the *situation*, the *decision made*,
  and optional *reasoning*. On submit the record is saved and analysis is
  kicked off in the background.
- 🤖 **LLM analysis** — the decision is sent to Groq through the Vercel AI SDK.
  The model returns a **structured** result (validated with Zod): category,
  cognitive biases (with severity + rationale), missed alternatives, strengths,
  a quality score and a complexity score.
- 🗂️ **History** — every decision with its original text, generated analysis
  and processing status (`Queued → Analyzing → Ready / Failed`). The list
  **polls live** while anything is still processing.
- 🎛️ **Robust UX states** — loading skeletons, empty states, inline errors and
  one‑click retry everywhere it matters; clear messaging while analysis is
  pending or after a failure.

**Bonus (all included)**

- 📊 **Dashboard** with custom visualisations — decisions per category, most
  frequent biases, a 14‑day activity timeline and KPI cards (avg quality /
  complexity).
- 🔁 **Re‑analysis** — re‑run the LLM on any decision (also used to retry
  failures).
- 🔎 **Filters** — by category, bias type and status.
- ↕️ **Sorting** — by creation time or complexity.
- 🌙 **Dark theme** — the whole app uses the dark navy palette from the brief.

---

## How it works

### Background analysis + status lifecycle

Creating a decision returns immediately with status `pending`. The LLM call runs
**after the response is sent** using Next.js [`after()`](https://nextjs.org/docs/app/api-reference/functions/after),
which keeps the same serverless invocation alive on Vercel — no separate queue
needed. A shared `runAnalysis(id)` owns the full lifecycle:

```
pending ──▶ processing ──▶ completed   (analysis persisted)
                       └──▶ failed      (error message persisted, retryable)
```

The client uses **TanStack Query** with a conditional `refetchInterval` that
polls only while a record is `pending`/`processing`, so the UI updates itself
without manual refreshes. The same `runAnalysis` powers the re‑analyze / retry
endpoint.

### Predictable, chartable output

A fixed [taxonomy](apps/web/lib/taxonomy.ts) of categories and well‑known
cognitive biases is shared by the prompt, the database and the UI. The model is
asked to pick from these lists, which keeps the output consistent enough to
filter and aggregate reliably. Category, complexity and bias types are
denormalised onto columns for fast filtering/sorting.

### Validation everywhere

A single set of [Zod schemas](apps/web/lib/validations.ts) validates the create
form (client + server), the list query params, **and** the LLM's structured
output (via `generateText` + `Output.object`).

---

## Tech stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, serverless route handlers), React 19  |
| Language       | TypeScript                                                    |
| Styling        | Tailwind CSS v4 + design tokens                               |
| UI primitives  | Radix UI (Dialog, Select, Dropdown, Tooltip, Toast, …)        |
| Database       | Postgres on **Neon** (serverless HTTP driver)                 |
| ORM            | Drizzle ORM + drizzle‑kit                                     |
| Auth           | BetterAuth (email/password, JWT plugin, Drizzle adapter)      |
| Validation     | Zod                                                           |
| AI             | Vercel AI SDK (`ai`) + `@ai-sdk/groq`, `generateText` + `Output.object` |
| Data fetching  | TanStack Query                                                |
| Forms          | react‑hook‑form + Zod resolver                                |
| Monorepo       | Turborepo + pnpm                                              |

---

## Why these choices

The stack was largely set by the brief; these notes explain the decisions that
were left open and why I made them the way I did.

- **Drizzle (over Prisma)** — lightweight, no separate engine/codegen step, and a
  first‑class fit for Neon's serverless HTTP driver and BetterAuth's adapter.
- **`after()` for background analysis (over a queue)** — the brief asks for
  *background* processing with visible status. `after()` runs the LLM call after
  the response is sent, in the same serverless invocation, so the create request
  returns instantly with a `pending` record and zero extra infrastructure. The
  work lives in a standalone `runAnalysis(id)` that's already queue‑ready.
- **Polling (over WebSockets/SSE)** — TanStack Query already manages the data; a
  conditional `refetchInterval` (only while something is in flight) gives live
  status with a few lines and no socket infrastructure.
- **Fixed taxonomy + structured output** — constraining the model to known
  categories/biases (via the Zod schema) is what makes filtering and the
  dashboard charts reliable instead of free‑text noise.
- **`gpt-oss-120b` as the default model** — it's on Groq's free tier and supports
  strict `json_schema` structured outputs, which gives the most reliable parse.
  The app auto‑falls back to `json_object` mode for models that don't, so the
  model is freely swappable via `GROQ_MODEL`.
- **Custom CSS/SVG charts (over a chart library)** — avoids a heavy dependency and
  React‑19 compatibility risk, and keeps the dark theme fully under control for
  what are simple bar/timeline visuals.
- **Hand‑written Drizzle auth schema** — mirrors what `@better-auth/cli generate`
  produces, but committed and reviewable, so the schema and migrations are
  explicit in the repo.

---

## Local development

### Prerequisites

- Node.js ≥ 18 and **pnpm** (`npm i -g pnpm`)
- A free **Neon** Postgres database — <https://neon.tech>
- A free **Groq** API key — <https://console.groq.com/keys> (no credit card)

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/web/.env.local`:

| Variable             | How to get it                                                            |
| -------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`       | Neon → your project → **Pooled** connection string (`...-pooler...`).     |
| `BETTER_AUTH_SECRET` | Any 32+ char secret. Generate with `openssl rand -base64 32`.            |
| `BETTER_AUTH_URL`    | `http://localhost:3000` locally.                                         |
| `NEXT_PUBLIC_APP_URL`| `http://localhost:3000` locally.                                        |
| `GROQ_API_KEY`       | console.groq.com/keys → create key.                                      |
| `GROQ_MODEL`         | optional, defaults to `openai/gpt-oss-120b`.                            |

### 3. Create the database schema

```bash
pnpm --filter web db:push      # or: db:generate to emit SQL migrations
```

### 4. Run

```bash
pnpm dev
```

Open <http://localhost:3000>, sign up, and record your first decision.

---

## Scripts

Run from the repo root (Turborepo) or scope with `--filter web`:

| Command                          | Description                              |
| -------------------------------- | ---------------------------------------- |
| `pnpm dev`                       | Start the dev server                     |
| `pnpm build`                     | Production build                         |
| `pnpm lint`                      | ESLint (zero‑warning policy)             |
| `pnpm check-types`               | `next typegen` + `tsc --noEmit`          |
| `pnpm --filter web db:push`      | Push the Drizzle schema to Neon          |
| `pnpm --filter web db:generate`  | Generate SQL migrations                  |
| `pnpm --filter web db:studio`    | Open Drizzle Studio                      |

---

## Deployment (Vercel)

1. Import the repo into Vercel and set the **root directory** to `apps/web`.
2. Add the env vars from the table above (use your Vercel URL for
   `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL`).
3. Run `pnpm --filter web db:push` once against your Neon database (locally or
   in a one‑off job) to create the schema.
4. Deploy. The Neon serverless driver + `after()` work natively on Vercel
   functions.

---

## Project structure

```
apps/web/
├─ app/
│  ├─ (auth)/login, signup        # auth pages
│  ├─ (app)/dashboard             # KPIs + charts
│  ├─ (app)/decisions             # history (filters/sort/polling)
│  ├─ (app)/decisions/new         # create form
│  ├─ (app)/decisions/[id]        # detail + analysis + re-analyze
│  ├─ api/auth/[...all]           # BetterAuth handler
│  ├─ api/decisions[/...]         # CRUD + analyze endpoints
│  └─ api/stats                   # dashboard aggregation
├─ components/{ui,decisions,dashboard,site,auth}
├─ db/                            # Drizzle schema, client, migrations
├─ lib/                           # auth, session, analysis, validations, taxonomy
└─ proxy.ts                       # route protection (Next 16 proxy convention)
```

---

## Trade‑offs & time constraints

This was built under a **2‑day limit**, so I deliberately made some pragmatic
choices that are perfectly fine for a test task / demo but that I would **not**
ship to production as‑is. Calling them out explicitly:

- **Background jobs via `after()`** — fine here, but it's bound to the request's
  function lifetime and has no retries/backoff/observability. *Prod:* a durable
  queue (Inngest / QStash / a worker) with retry, dead‑letter and metrics.
  `runAnalysis(id)` is already isolated to make that swap easy.
- **Status via client polling** — simple but chatty (fixed 2–2.5s interval).
  *Prod:* SSE/WebSockets (or push) and exponential backoff.
- **No rate limiting** on create/analyze — a user could spam the LLM and burn the
  Groq quota. *Prod:* per‑user rate limits + abuse protection.
- **Email verification disabled** (no email provider wired up) — anyone can sign
  up with any address. *Prod:* real verification + password reset via an email
  provider (e.g. Resend).
- **No automated tests** — given the time box I verified the full flow manually
  (auth → create → background analysis → re‑analyze/retry → dashboard) rather
  than writing a suite. *Prod:* unit + integration + e2e tests in CI.
- **Dashboard stats computed in app code** — it loads the user's rows and
  aggregates in JS. Fine at small scale; *prod:* SQL `GROUP BY` / `unnest` (or a
  rollup table) and **pagination** on the history list (currently unpaginated).
- **Migrations applied manually** (`db:push` / one `drizzle-kit migrate`).
  *Prod:* a migration step in CI/CD.
- **LLM error messages surfaced directly** to the client for easy debugging.
  *Prod:* sanitize messages and log details server‑side. There's also no caching
  or output guardrails — *prod:* cache identical inputs and add eval/guardrails.
- **Monorepo kept** from the `create-turbo` starter even though it's a single
  app — harmless, but unnecessary overhead for a project this size.

What *is* production‑shaped already: real auth with DB‑backed sessions + JWT,
end‑to‑end Zod validation, ownership checks on every query, a decoupled analysis
function, indexed/denormalised columns for filtering, and clean loading/error/
retry states.
