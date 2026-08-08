# Data Export Implementations — Code Analysis

Comparing three independent implementations of expense export functionality, each on its own branch off `master` (`e19a447`):

| Branch | Feature commit | Files touched | Net LOC | New dependencies |
|---|---|---|---|---|
| `feature-data-export-v1` | `cfeaf66` | 2 | +14 / −8 | none |
| `feature-data-export-v2` | `0b4113e` | 14 (incl. `package.json`/lockfile) | +837 / −13 | `jspdf`, `jspdf-autotable` |
| `feature-data-export-v3` | `2c8b833` | 25 (incl. `package.json`/lockfile) | +2065 / −20 | `jspdf`, `jspdf-autotable`, `qrcode`, `@types/qrcode` |

All three start from the same baseline: a Next.js 14 (App Router) + React 18 + TypeScript + Tailwind app, expenses persisted client-side in `localStorage` via `ExpensesContext`, no backend of any kind.

> **Note**: the `feature-data-export-v3` branch tip also carries one extra commit (`e042b67`, "separated branches for features") that isn't part of the export feature — a 1-line addition of `tsconfig.tsbuildinfo` (a local TypeScript build artifact). It's excluded from the figures above and from this analysis.

---

## Version 1 — Single-button CSV export

**Files created/modified**
- `src/lib/utils.ts` — reordered the columns of a pre-existing (but previously unused) `exportExpensesToCsv()` function from `Date, Category, Description, Amount` to `Date, Category, Amount, Description`.
- `src/app/page.tsx` — added a "Export Data" secondary button next to "Add expense" that calls `exportExpensesToCsv(expenses)` directly.

**Architecture**
None to speak of — this is intentionally a single pure function plus one call site. No new files, no new components, no new abstractions.

```
Button onClick → exportExpensesToCsv(expenses) → Blob → <a download> → click() → cleanup
```

**Key components and responsibilities**
- `exportExpensesToCsv(expenses: Expense[]): void` — the entire feature. Sorts by date, maps each `Expense` to a 4-column row, escapes fields, joins into a CSV string, wraps in a `Blob`, and triggers a download via a synthetically-clicked `<a>` tag with `URL.createObjectURL`/`revokeObjectURL`.

**Libraries/dependencies**
None beyond what the app already had. Uses only standard browser APIs (`Blob`, `URL.createObjectURL`, DOM `<a download>`).

**Implementation patterns**
Straight-line imperative function. No hooks, no state, no async — the whole operation is synchronous from click to download.

**Code complexity**
Minimal — cyclomatic complexity of 1 in the export function itself (a single `if` inside the escape helper). Easiest of the three to read in full in under a minute.

**Error handling**
None. No try/catch anywhere in the new code. Failure modes:
- Empty `expenses` array → produces a header-only CSV, no crash, arguably correct behavior anyway.
- `Blob`/`URL.createObjectURL` are universally supported in evergreen browsers, so this is a low-risk omission in practice, but there's no fallback or user feedback if it ever did fail (e.g., a popup/download blocked by browser policy in an embedded webview).

**Security considerations**
- **CSV formula injection**: `csvEscape` only escapes quotes/commas/newlines — it does not neutralize leading `=`, `+`, `-`, or `@` characters. A `description` field of `=cmd|'/c calc'!A1` (or similar) would be written verbatim and could be interpreted as a formula by Excel/Sheets on open. This is a real, unaddressed gap, and it's present in some form in **all three** versions since v2/v3 inherit the same `csvEscape` logic.
- No XSS surface — output is a file download, not rendered HTML.

**Performance**
O(n log n) for the sort, O(n) for row building — trivial for any realistic personal-finance dataset size. No memoization needed or present because there's no re-render loop involved (the function runs once per click).

**Extensibility/maintainability**
Low by design. Adding a second format means either branching inside `exportExpensesToCsv` or duplicating it — there's no format abstraction. That's a reasonable trade for "v1, keep it simple," but it's a real ceiling if the button were extended incrementally rather than being one of three parallel explorations.

---

## Version 2 — Multi-format export with filtering (drawer UI)

**Files created/modified**
```
src/lib/export/
  types.ts            — ExportFormat, ExportOptions, EXPORT_FORMATS metadata
  filterExpenses.ts   — pure date-range + category filter
  downloadBlob.ts      — shared <a download> trigger helper
  csv.ts / json.ts / pdf.ts  — one writer per format
  index.ts            — runExport() orchestrator + buildExportFilename()
src/components/export/
  useExportBuilder.ts — stateful hook (format, filters, filename, isExporting)
  ExportDrawer.tsx     — the UI (238 lines)
src/components/ui/Drawer.tsx  — new slide-over panel primitive (sibling to the existing Modal)
src/app/page.tsx        — swapped the plain button for one that opens the drawer
src/app/globals.css      — added a `drawer-in` slide/fade keyframe
package.json / package-lock.json — added jspdf, jspdf-autotable
```

**Architecture overview**
A clean three-layer split:
1. **Pure data layer** (`src/lib/export/`) — no React, no DOM assumptions beyond the final `downloadBlob` call. `filterExpensesForExport` is a pure function; `writeCsv`/`writeJson`/`writePdf` each take `(expenses, filename)` and produce a download.
2. **State layer** (`useExportBuilder` hook) — owns all form state (`format`, `dateFrom`, `dateTo`, `categories: Set<Category>`, `filename`, `isExporting`) and derives `filtered`/`total`/`preview`/`hiddenCount` via `useMemo`.
3. **Presentation layer** (`ExportDrawer.tsx`) — a "dumb" component that destructures everything from the hook and renders it; contains no business logic of its own beyond a bit of local state in the parent `page.tsx` for open/close.

```
Button → showExportDrawer=true
  → <ExportDrawer expenses onClose onExported>
      useExportBuilder(expenses)
        ├─ filterExpensesForExport (useMemo, recomputed on every keystroke)
        ├─ preview = filtered.slice(0, 8)
        └─ doExport() → runExport() → WRITERS[format](filtered, filename)
```

**Key components and responsibilities**
- `Drawer` (ui primitive) — right-side slide-over shell: Esc-to-close, backdrop click, body-scroll lock, header/body/footer slots. Structurally parallel to the existing `Modal` but a distinct interaction pattern (edge panel vs. centered dialog).
- `useExportBuilder(expenses)` — the single source of truth for the drawer's form state and the derived preview/summary numbers.
- `runExport(expenses, options)` (`lib/export/index.ts`) — looks up the right writer by format in a `Record<ExportFormat, Writer>` map, builds the filename via `buildExportFilename` (sanitizes to `[a-z0-9-_ ]`, lowercases, appends the correct extension), yields one animation frame (`requestAnimationFrame`) before calling the writer so the "Exporting…" spinner actually paints before any synchronous PDF-layout work blocks the main thread.
- `writePdf` (`lib/export/pdf.ts`) — builds a formatted report via `jsPDF` + `jspdf-autotable`: title, generated-at subtitle, a table with a bold total-row footer, and a "Page X of Y" footer drawn on every page via `didDrawPage`.

**Libraries and dependencies**
- `jspdf` + `jspdf-autotable` (new) — only real new dependency surface. `autoTable(doc, options)` function-call form (v5 API), not the `doc.autoTable()` method form from older majors.
- Everything else is existing app infrastructure (`Button`, `FormField`, `Spinner`, `CATEGORY_LIST`/`CATEGORY_META`).

**Implementation patterns**
- Filtering is **client-side, in-memory, recomputed reactively** — every date/category change triggers a new `useMemo` pass over the full `expenses` array. There's no debounce; for the dataset sizes this app targets (personal expense tracking, likely hundreds to low-thousands of rows) that's a non-issue, but it would not scale to a shared/multi-tenant dataset.
- The `WRITERS` lookup table (`Record<ExportFormat, Writer>`) is the extensibility seam: adding a fourth format means writing one function with the `(expenses, filename) => void` signature and registering it — no other file needs to change except the format-picker metadata in `types.ts`.

**Code complexity**
Moderate. The most complex single unit is `ExportDrawer.tsx` (238 lines) purely from UI surface area (format picker, two date inputs, category chip multi-select, filename field, live preview table, footer summary) — but each piece is simple in isolation; there's no deep nesting or complex control flow anywhere in the library code.

**Error handling**
- `doExport()` in `useExportBuilder` wraps the call in `try { ... } finally { setIsExporting(false) }` — **no `catch`**. If a writer throws (e.g., `jsPDF` internals failing on unexpected input), the promise rejection propagates out of the `onClick` handler unhandled; React logs it to the console but the user sees no error toast, and the drawer stays open in a now-idle (not stuck) state because the `finally` still runs. This is a real, if narrow, gap — the UI doesn't visibly break, but a failed export currently looks identical to nothing happening.
- `Export` button is `disabled` when `filtered.length === 0`, which prevents the more common "nothing to export" case from ever reaching the writers at all — a reasonable proactive guard rather than reactive error handling.
- Filename input has no validation UI; `buildExportFilename` silently sanitizes bad characters rather than rejecting them, which is user-friendly but means there's no feedback when input was mangled.

**Security considerations**
- Same CSV-formula-injection gap as v1 (shared `csvEscape` logic, reimplemented not shared as a module — see "Extensibility" below).
- JSON export includes only `date/category/amount/description` (not `id`/`createdAt`), a reasonable minimal-surface default.
- No new external network calls — `jspdf`/`jspdf-autotable` run entirely client-side; nothing leaves the browser.

**Performance**
- PDF generation via `jspdf-autotable` is synchronous and CPU-bound on the main thread once it starts. The one-frame `requestAnimationFrame` yield before calling the writer means the loading spinner reliably paints first, but for a very large export the actual generation would still visibly block the UI for its duration — there's no chunking or Web Worker offload.
- CSV/JSON writers are effectively instant at any realistic scale (string join + Blob).

**Extensibility/maintainability**
- High. The writer-registry pattern is the strongest architectural asset here: format-specific code is fully isolated per file, and the filter/preview/summary logic is independent of format entirely.
- Minor duplication smell: `csvEscape` and the `<a download>` trigger pattern (`downloadBlob.ts`) are reimplemented from scratch rather than importing v1's existing `exportExpensesToCsv`/helpers — expected here since each branch is an independent exploration, but would need deduplication if v1 and v2 were ever merged into one codebase.

---

## Version 3 — Cloud-integrated "Export Center" (dedicated page)

**Files created/modified**
```
src/lib/cloudExport/
  types.ts        — all shared types: ExportFormat, TemplateId, CloudServiceId,
                     DestinationId, ConnectionState, ScheduleConfig, ExportHistoryEntry, ShareLink
  aggregate.ts     — aggregateByCategory() rollup helper
  templates.ts     — 4 TemplateDefinition objects (Tax Report, Monthly Summary,
                     Category Analysis, Full Data Backup), each owning its own
                     date-range logic and row shape
  writers.ts       — generic writeCsvTable/writeJsonPayload/writePdfTable (format-agnostic,
                     operate on headers/rows rather than Expense[] directly)
  storage.ts       — readJson/writeJson localStorage helpers (generic, no try/catch on write)
  history.ts       — export-history CRUD (capped at 25 entries)
  connections.ts   — simulated OAuth connect/disconnect/sync for 3 cloud services
  schedule.ts       — recurring-backup config + computeNextRunLabel()
  share.ts          — fake share-link + QR code (via `qrcode`) generator
  index.ts          — downloadTemplate() / previewTemplate() orchestration + re-exports
src/components/cloud-export/
  useCloudExport.ts       — top-level hook composing all of the above (181 lines)
  TemplateGrid.tsx, PreviewPanel.tsx, EmailExportCard.tsx, ShareLinkCard.tsx,
  CloudConnectionsGrid.tsx, BackupScheduleCard.tsx, ExportHistoryTable.tsx,
  icons.tsx                — 8 presentational components, one per page section
src/app/export/page.tsx    — new route, composes the section components
src/components/NavBar.tsx  — added "Export" nav link
src/app/page.tsx           — dashboard button now links to /export instead of opening a drawer
package.json / package-lock.json — added jspdf, jspdf-autotable, qrcode, @types/qrcode
```

**Architecture overview**
The deepest layering of the three, organized around a page rather than a widget:
1. **Template layer** — each of 4 templates is a self-contained `TemplateDefinition` with its own `build(expenses)` function returning `{ title, subtitle, headers, rows, footerRow?, jsonPayload, recordCount }`. Two templates (`monthly-summary`, `category-analysis`) produce **aggregated** rows via `aggregateByCategory`; two (`tax-report`, `full-backup`) produce **itemized** rows. This is a genuine structural difference from v2, where every export shares one row shape.
2. **Generic writer layer** (`writers.ts`) — unlike v2's writers, which take `Expense[]` directly, these take arbitrary `headers`/`rows`/`footerRow`, decoupling the writers entirely from the `Expense` type so they can serve both itemized and aggregated templates.
3. **Simulated-state layer** — `connections.ts`, `history.ts`, `schedule.ts`, `share.ts` each own one `localStorage` key and expose a small CRUD API; `connections.ts`/`share.ts` additionally simulate async latency (`setTimeout`/`await` delays of ~700–1400ms) to make the "connecting"/"syncing" UI states feel real.
4. **Composition hook** (`useCloudExport`) — the single place that wires template selection, all four pieces of persisted state, and six user-facing actions (`download`, `sendEmail`, `connect`, `disconnect`, `sync`, `generateLink`, `updateSchedule`, `clearHistory`) together, tracking a single `pendingAction: string | null` (e.g. `"download:tax-report"`, `"connect:dropbox"`) that every section component reads to know whether *it* is the one currently loading.
5. **Page** (`src/app/export/page.tsx`) — thin composition root; each section is a `<SectionHeading>` plus one imported component, with two small async handlers (`handleDownload`, `handleSendEmail`, `handleSync`) that call into the hook and then fire a toast.

```
/export page
  useCloudExport(expenses)
    ├─ selectedTemplate.build(expenses) → preview  (recomputed via useMemo)
    ├─ download(id)   → downloadTemplate() → writers.ts → real file download → recordExport()
    ├─ sendEmail(...)  → previewTemplate() [no file written] → simulatedDelay() → recordExport()
    ├─ connect(id)     → connectService()  → simulated delay → localStorage
    ├─ sync(id, tId)   → previewTemplate() + markSynced()    → recordExport()
    ├─ generateLink()  → QRCode.toDataURL(fakeUrl)           → ShareLink
    └─ updateSchedule()→ saveSchedule() (pure persistence, no timer)
```

**Key components and responsibilities**
- `TemplateDefinition.build()` — the only place that knows how to turn `Expense[]` into a specific report shape; everything downstream (writers, preview, history) is generic over its output.
- `previewTemplate()` vs `downloadTemplate()` — an important, easy-to-miss split: `downloadTemplate` calls the writer (real file); `previewTemplate` calls `template.build()` **without** writing a file, used by `sendEmail`/`sync` purely to get an accurate `recordCount`/`filename` for the history entry and toast, since those destinations don't actually produce a browser download.
- `useCloudExport`'s `pendingAction` string convention (`"download:<id>"`, `"connect:<id>"`, `"sync:<id>"`, `"email"`) is a lightweight way to support N independent loading states without N booleans; every consumer does a simple string-equality check.

**Libraries and dependencies**
- `jspdf`/`jspdf-autotable` — same as v2, reimplemented independently in `writers.ts` (this branch never saw v2's code, since each version started from a fresh checkout of `master`).
- `qrcode` (+ `@types/qrcode`) — new, used once in `share.ts` via `QRCode.toDataURL(url, { margin, width, color })`, entirely client-side (no network call — the "URL" it encodes is a fabricated, unhosted string).

**Implementation patterns**
- **Explicit simulation boundaries**: every non-local destination (email, the 3 cloud services, the share link) is implemented as `await new Promise(resolve => setTimeout(resolve, 700–1400ms))` and is accompanied by literal "Demo mode" copy in the rendered UI (`EmailExportCard`, `ShareLinkCard`, `CloudConnectionsGrid`'s absence of real OAuth, `BackupScheduleCard`). This was a deliberate choice to keep the feature honest about what's real (downloads, PDF/CSV/JSON generation, QR code images — all genuinely functional) vs. illustrative (nothing is actually sent/synced/scheduled anywhere).
- **localStorage as the only persistence** — connections, schedule, and history all survive a refresh via the same `readJson`/`writeJson` pair, mirroring the app's existing `ExpensesContext` pattern but without its try/catch-and-surface-an-error behavior (see below).
- Date/time formatting explicitly pins `"en-US"` everywhere (`toLocaleDateString("en-US", …)`), matching the app's existing `utils.ts` convention — this was in fact a bug caught and fixed during testing (an earlier pass used `toLocaleDateString(undefined, …)`, which rendered dates in the host machine's locale rather than the app's chosen one).

**Code complexity**
The highest of the three, but distributed rather than concentrated: no single file exceeds ~180 lines, and the largest (`useCloudExport.ts`) is a flat sequence of similarly-shaped `useCallback`s rather than deeply nested logic. Complexity here is primarily *surface area* (11 lib files, 9 components) rather than per-function complexity.

**Error handling**
- Same pattern as v2: every async action (`download`, `sendEmail`, `connect`, `sync`, `generateLink`) wraps its body in `try { … } finally { setPendingAction(null) }` with **no `catch`** — a thrown error (e.g., `QRCode.toDataURL` rejecting, `jsPDF` failing) resets the loading state via `finally` but is not surfaced to the user as an error toast; it becomes an unhandled promise rejection in the console.
- `lib/cloudExport/storage.ts`'s `writeJson` has **no try/catch** around `localStorage.setItem` — unlike the app's original `src/lib/storage.ts`, whose `saveExpenses` is called from a `persist()` wrapper in `ExpensesContext` that *does* catch and set a user-visible error message on quota-exceeded. A quota error while recording export history would throw synchronously inside `recordExport`, propagating the same way as above. Low real-world likelihood (history is capped at 25 entries), but it's an inconsistency with the app's own established pattern for the same class of operation.
- `readJson` *does* catch parse errors and falls back to a safe default, so corrupted localStorage state degrades gracefully on read.

**Security considerations**
- Same CSV-injection caveat as v1/v2 (`writers.ts`'s `csvEscape`, a third independent reimplementation).
- **No real credentials are ever requested.** The "Connect" flows for Google Sheets/Dropbox/OneDrive are simple button-triggered timers with no login form, no OAuth redirect, and no branded-logo impersonation of the real services' consent screens — a deliberate choice to avoid anything resembling a credential-harvesting or phishing-adjacent pattern, at some cost to "realism."
- The generated share link (`https://expensely.app/share/<token>`) is a fabricated, non-resolving URL. The UI explicitly discloses this ("this link isn't actually hosted anywhere") rather than letting a user believe they've shared real data externally — relevant given the underlying data is personal financial information.
- No new external network calls anywhere in this feature; `jspdf`, `jspdf-autotable`, and `qrcode` all execute purely client-side.

**Performance**
- Same PDF-blocking caveat as v2 (synchronous `jspdf-autotable` layout work after one yielded frame).
- `TemplateGrid` calls `template.build(expenses)` **once per template per render** just to display each card's record count — i.e., up to 4x the aggregation work of computing a single preview, on every render of the page. Fine at personal-finance scale (the four `build()` calls are each O(n)), but it's the one place in v3 doing more redundant computation than necessary; memoizing per-template counts would be the natural follow-up if this dataset ever grew large.
- `ExportHistoryTable` and `CloudConnectionsGrid` are simple list renders with no virtualization, capped implicitly by the 25-entry history limit and the fixed 3-service list — non-issues at this scale.

**Extensibility/maintainability**
- Highest of the three. Adding a 5th template means adding one object to `EXPORT_TEMPLATES`; adding a 4th cloud service means adding one entry to `CLOUD_SERVICES` (icons/colors are already parameterized per-service). The generic `headers/rows` writer contract means new templates don't need new writer code even if their row shape differs from existing ones.
- The explicit `previewTemplate`/`downloadTemplate` split is a good seam for a real backend integration later: swapping the simulated `setTimeout` delays for real API calls in `connections.ts`/`share.ts` would not require touching `templates.ts`, `writers.ts`, or any component.
- Trade-off: this is meaningfully more code to maintain (2,046 net lines vs. v2's 837 and v1's 14) for a feature set that is, by the task's own framing, partly aspirational/simulated rather than fully load-bearing.

---

## Technical Deep Dive

### How does the export functionality work, technically?

All three ultimately funnel down to the same browser primitive: build a `Blob`, create an object URL, assign it to a hidden `<a download>`, `.click()` it, then revoke the URL. There is no server round-trip anywhere in any version — "export" always means "generate a file in-memory and hand it to the browser's download machinery."

- **v1**: one function does all of this inline.
- **v2**: the same steps are pulled into `downloadBlob.ts` and shared by `csv.ts`/`json.ts`; `pdf.ts` instead calls `jsPDF#save()`, which performs the equivalent blob/link dance internally.
- **v3**: identical shape to v2 (`writers.ts`'s `downloadBlob` helper + `jsPDF#save()`), but the writers operate on already-shaped `headers/rows` rather than raw `Expense[]`, so the `Expense → tabular data` transformation happens one level up, in each `TemplateDefinition.build()`.

### What file generation approach is used?

| Format | v1 | v2 | v3 |
|---|---|---|---|
| CSV | Manual string join + custom `csvEscape` | Same pattern, separate file | Same pattern again, generic over `headers/rows` |
| JSON | — | `JSON.stringify(payload, null, 2)` wrapped in a `{ exportedAt, count, expenses }` envelope | Same `JSON.stringify` approach; envelope shape varies per template (`jsonPayload` is template-defined) |
| PDF | — | `jsPDF` + `jspdf-autotable`, one report layout | Same libraries, but `writePdfTable` is a generic title/subtitle/table/footer-row renderer reused by two different templates |

No format uses a Web Worker or streams — all generation is synchronous once triggered (v2/v3 each add a single `requestAnimationFrame` yield beforehand purely so a loading spinner has a chance to paint).

### How is user interaction handled?

- **v1**: one `onClick`, fully synchronous, no loading state (none needed — the operation is effectively instant).
- **v2**: a slide-over `Drawer` opened/closed via boolean state in the parent page; all form state lives in `useExportBuilder`, and a single `isExporting` boolean drives the button's spinner/disabled state.
- **v3**: a full page navigation (`/export`); interaction is spread across 7 independent section components, each reading a slice of state from one shared `useCloudExport()` hook call, with a single `pendingAction: string | null` discriminated by string prefix (`"download:"`, `"connect:"`, `"sync:"`, `"email"`) standing in for what would otherwise be 5+ separate boolean flags.

### What state management patterns are used?

All three stay within vanilla React state/hooks — no Redux/Zustand/Context beyond what the app already had (`ExpensesContext`, `ToastContext`). The progression across versions is a progression in *how much* state needs coordinating, not in *what kind* of state management is used:
- v1: none.
- v2: one custom hook (`useExportBuilder`) owning ~6 pieces of local `useState`, with `useMemo`-derived values (`filtered`, `total`, `preview`).
- v3: one custom hook (`useCloudExport`) coordinating local `useState` *plus* four independent `localStorage`-backed stores (history, connections, schedule; share links are ephemeral/in-memory only), synced in on mount via a single `useEffect`.

### How are edge cases handled?

- **Empty dataset**: all three degrade gracefully — v1 produces a header-only CSV; v2 disables its Export button when the filtered set is empty and shows explanatory copy; v3's `TemplateGrid` shows "0 records" per card and `PreviewPanel` shows an explicit "No data matches this template yet" empty state.
- **Bad/absent filename input**: v2/v3 both sanitize rather than reject (strip disallowed characters, fall back to a default base name if the field is empty after trimming).
- **Concurrent/duplicate submissions**: v2's Export button and v3's per-action buttons are all `disabled` while their corresponding action is pending, preventing double-submission races.
- **Failed async operations**: as noted above, this is the one edge case **not** well handled in v2 or v3 — a thrown error resets the loading state (via `finally`) but is never surfaced to the user as an error message, unlike the app's pre-existing `ExpensesContext`, which does catch storage failures and expose `error` for the UI to render.

---

## Summary

| Dimension | v1 | v2 | v3 |
|---|---|---|---|
| Net new code | ~14 lines | ~840 lines | ~2050 lines |
| New dependencies | 0 | 2 | 4 |
| Formats | CSV | CSV, JSON, PDF | CSV, JSON, PDF (via 4 curated templates) |
| Filtering | none | date range + category | none (templates encode their own fixed ranges) |
| UI pattern | button | slide-over drawer | dedicated page |
| Real vs. simulated | 100% real | 100% real | Downloads/generation real; email, cloud sync, share link, and scheduling are explicitly simulated |
| Error surfacing on failure | n/a (sync, unlikely to fail) | swallowed (console only) | swallowed (console only) |
| Extensibility (new format/template) | rewrite the function | add one writer + registry entry | add one `TemplateDefinition` object |
| Best fit | Quick, always-correct baseline | Users who want control over what gets exported and to which format, still fully self-contained | Demonstrating/prototyping where the feature could go with a real backend; heavier to maintain today |

**Shared gap across all three**: none of the CSV writers guard against formula injection (leading `=`/`+`/`-`/`@` in a `description` field). If any version's CSV export ships to production, prefixing such fields with a `'` (or similar Excel/Sheets-recognized escape) in `csvEscape` would be a cheap, worthwhile fix.

**Shared gap across v2/v3**: async export/action failures are caught only well enough to reset loading state (`try/finally`, no `catch`), not well enough to inform the user. Adding a `catch` that calls the existing `useToast()`'s error variant would close this gap in both without much code.
