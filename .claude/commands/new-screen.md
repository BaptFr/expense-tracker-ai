Scaffold a new page/screen in this expense tracker: $ARGUMENTS

This is a client-only Next.js 14 App Router app — no backend, no API routes, no
server components. All data comes from `useExpenses()` (see
`src/context/ExpensesContext.tsx`). Follow the conventions in `CLAUDE.md`
exactly; don't improvise a different pattern.

## Process

1. **Read `CLAUDE.md`** (root of repo) first, specifically the "Data flow",
   "Data model", and "Styling" sections — the color table and the
   smart-page/dumb-component split are not optional style preferences, they're
   what every existing page does.
2. **Decide the route.** kebab-case, one folder under `src/app/<route>/`, e.g.
   `src/app/top-vendors/`.
3. **Create `src/app/<route>/page.tsx`** — thin wrapper only:
   ```tsx
   "use client";
   import { useExpenses } from "@/context/ExpensesContext";
   import { PageSpinner } from "@/components/ui/Spinner";
   import { YourComponent } from "@/components/YourComponent";

   export default function YourRoutePage() {
     const { expenses, isLoading } = useExpenses();
     if (isLoading) return <PageSpinner />;
     return <YourComponent expenses={expenses} />;
   }
   ```
   Don't call `useExpenses()` anywhere else on this screen — everything else
   receives `expenses` (or data derived from it) as a prop.
4. **Build the screen as a presentational component** in `src/components/`
   (or `src/components/charts/` if it's primarily a chart). It takes
   `expenses: Expense[]` as a prop and derives whatever it needs internally
   (typically with `useMemo`). Compute, don't fetch — there is nothing to
   fetch.
5. **Reuse existing primitives**, don't build new ones: `Card`, `Button`,
   `EmptyState`, `Spinner`/`PageSpinner`, `Modal`, `FormField`, `ConfirmDialog`,
   `StatTile` (all in `src/components/ui/`). If the screen needs a chart, check
   `src/components/charts/` for an existing one to extend before writing a new
   one from scratch — and see the `/new-chart` command if you do need a new one.
6. **Match the palette exactly** (see `CLAUDE.md`'s color table) — primary
   ink `#0b0b0b`, secondary `#52514e`, muted `#898781`, accent `#2a78d6`,
   border `#c3c2b7`, divider `#e1e0d9`. If the screen shows per-category data,
   pull colors from `CATEGORY_META` (`src/lib/categories.ts`) — never invent
   a new hue for a category, and never invent a 7th categorical color for an
   "other/rest" bucket (use a neutral gray de-emphasis color instead).
7. **Handle the empty-data case explicitly** with `<EmptyState>` — every
   existing screen does, and a fresh/cleared localStorage is a completely
   normal state, not an edge case.
8. **Register the route** in `src/components/NavBar.tsx`'s `LINKS` array so
   it's actually reachable.
9. **Verify** — there is no test suite in this repo. Run, in order:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
   All three must be clean. Then use the `run` skill (or start the dev server
   yourself and drive it with Playwright) to actually load the new route,
   check it renders with real seeded data and with an empty dataset, and
   confirm there are no console errors. Don't report the screen as done on
   the strength of the type-check alone — screenshot it.
