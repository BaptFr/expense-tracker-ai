# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server at localhost:3000
npm run build    # production build — also runs the TypeScript + ESLint checks below
npm run lint     # next lint (eslint-config-next: next/core-web-vitals, next/typescript)
npx tsc --noEmit # typecheck only, no emit (fast, use this for iteration)
```

**There is no test framework in this repo** — no Jest/Vitest/Playwright, no `test` script in `package.json`. Treat `npx tsc --noEmit` + `npm run lint` (+ `npm run build` for a final pass) as the correctness gate for any change. If you add real tests, add the runner and a `test` script as part of that change rather than assuming one exists.

## Architecture

**Fully client-side — there is no backend.** Every page is `"use client"`. Data lives entirely in the browser via `localStorage`; there is no API layer, no database, no server actions. Keep this in mind before reaching for `fetch`, route handlers, or server components — none of the existing code uses them, and adding a persistence layer beyond localStorage is a real architectural change, not an incremental one.

### Data flow

`src/context/ExpensesContext.tsx` is the single source of truth. It loads from `src/lib/storage.ts` on mount (`localStorage` key `expense-tracker:expenses`), exposes `{ expenses, isLoading, error, addExpense, updateExpense, deleteExpense }` via `useExpenses()`, and re-persists to `localStorage` on every mutation (catching quota/serialization errors into `error` for the UI to surface). `src/lib/storage.ts` also auto-seeds ~15 sample expenses the very first time the app runs on a fresh browser (guarded by a separate `expense-tracker:seeded` flag, so deleting all expenses later doesn't trigger a reseed).

The convention every page follows: the `page.tsx` calls `useExpenses()` once, guards on `isLoading` with `<PageSpinner />`, and passes the resulting `expenses` array down as a prop to presentational components (`SummaryCards`, `CategoryBreakdownChart`, `FilterBar`, chart components, etc.). Those child components take `expenses`/derived data as props and don't call `useExpenses()` themselves — keep new features consistent with that split (smart page, dumb components) rather than having every component read the context independently.

`src/context/ToastContext.tsx` is the other global: `useToast().showToast(message, variant?)` for transient notifications (`success` | `error` | `info`, auto-dismiss ~3.2s). Both providers wrap the tree in `src/app/layout.tsx` (`ToastProvider > ExpensesProvider > NavBar + page content`).

### Data model

`src/types/expense.ts`: `Expense { id, date: "yyyy-mm-dd", amount: number, category: Category, description: string, createdAt: ISO timestamp }`. `Category` is a **closed union** of exactly six values — `Food | Transportation | Entertainment | Shopping | Bills | Other` — defined once in `src/lib/categories.ts` as `CATEGORY_LIST` (ordered array) and `CATEGORY_META` (per-category `color`, `bg` tint, and `emoji`). There is no vendor/merchant field and no user-configurable budget/limit concept anywhere in the model — if a feature needs either, that's new ground, not something to assume exists (an earlier feature approximated "vendor" from the free-text `description` field for exactly this reason; see `src/lib/insights.ts` if that pattern still exists on the branch you're on).

Dates are stored/compared as plain `yyyy-mm-dd` strings (lexicographic comparison works directly for range filters/sorting). Use `parseIsoDateLocal()` from `src/lib/utils.ts` rather than `new Date(isoString)` when you need a `Date` object — the naive constructor parses as UTC and shifts the displayed day depending on the user's timezone.

### Styling — no theme file, colors are inline hex

`tailwind.config.ts` has an **empty theme extension**. There's no design-token file; every component hardcodes the same small set of hex values directly in `className`/`style`. Match these exactly rather than introducing new near-duplicates:

| Token | Hex | Use |
|---|---|---|
| Primary ink | `#0b0b0b` | headings, primary text |
| Secondary text | `#52514e` | body/secondary text |
| Muted text | `#898781` | captions, placeholders, timestamps |
| Accent | `#2a78d6` | primary buttons, links, focus rings |
| Border/ring | `#c3c2b7` | input borders, secondary-button ring |
| Divider | `#e1e0d9` | hairlines between rows |
| Subtle backgrounds | `#f9f9f7` / `#f0efec` / `#fcfcfb` | hover states, page plane, muted chips |
| Danger | `#d03b3b` (bg wash `#fbeceb`) | delete/error |
| Success | `#0ca30c` / `#006300` | positive deltas, success toast |

The six-color **categorical** palette for categories lives only in `CATEGORY_META` (`src/lib/categories.ts`) — it was chosen/validated using this repo's `dataviz` skill (colorblind-safe checks, etc.). Reuse those exact colors for anything category-related (charts, badges, legends) instead of picking new ones; don't invent a 7th hue for an "other/rest" bucket, use a neutral gray de-emphasis color instead (see `SpendingDonutChart`/`MonthlyInsights` if present on your branch for the pattern).

Charts (`src/components/charts/`) are hand-built from `<div>`/`<svg>` — there is no charting library dependency. Follow the existing hover/tooltip pattern (`activeIndex`/`activeKey` state + `onMouseEnter`/`onFocus` pairs + a small floating tooltip) rather than introducing a new interaction model per chart.

### Routing & components

- `src/app/<route>/page.tsx` — one folder per route (`/`, `/expenses`, plus whatever feature routes exist on the current branch). Add new routes here and register them in `src/components/NavBar.tsx`'s `LINKS` array to make them reachable.
- `src/components/ui/` — generic primitives (`Card`, `Button`, `Modal`, `FormField`, `EmptyState`, `Spinner`/`PageSpinner`, `ConfirmDialog`, `StatTile`). Reuse these; don't build competing one-offs.
- `src/components/` (root) — feature components composed from the primitives above (`ExpenseForm`, `ExpenseRow`, `FilterBar`, `SummaryCards`, `NavBar`).
- `src/components/charts/` — chart components, always taking `expenses` (or pre-aggregated data) as props, never fetching their own data.
- Path alias `@/*` → `./src/*` (see `tsconfig.json`).

### Custom Claude Code commands

This repo has project-level slash commands in `.claude/commands/` (e.g. `code-review`, `document-feature`, `api-test`, `parallel-agents`, `integrate-parallel-work`) — check there before assuming a workflow needs to be improvised from scratch.
