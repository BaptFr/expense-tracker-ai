"use client";

import { Expense } from "@/types/expense";
import { CATEGORY_LIST, CATEGORY_META } from "@/lib/categories";
import { EXPORT_FORMATS } from "@/lib/export/types";
import { formatCurrency } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/Spinner";
import { useExportBuilder } from "@/components/export/useExportBuilder";

interface ExportDrawerProps {
  expenses: Expense[];
  onClose: () => void;
  onExported: (count: number, format: string) => void;
}

export function ExportDrawer({ expenses, onClose, onExported }: ExportDrawerProps) {
  const {
    format,
    setFormat,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    categories,
    toggleCategory,
    clearCategories,
    filename,
    setFilename,
    isExporting,
    filtered,
    total,
    preview,
    hiddenCount,
    hasActiveFilters,
    resetFilters,
    doExport,
  } = useExportBuilder(expenses);

  async function handleExport() {
    const count = await doExport();
    onExported(count, format);
  }

  return (
    <Drawer
      title="Exporter les dépenses"
      subtitle="Choisissez un format, affinez les données, puis téléchargez."
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#52514e]">
            {filtered.length === 0
              ? "Aucune ligne ne correspond à ces filtres."
              : `${filtered.length} ligne${filtered.length === 1 ? "" : "s"} · ${formatCurrency(total)}`}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isExporting}>
              Annuler
            </Button>
            <Button type="button" onClick={handleExport} disabled={filtered.length === 0 || isExporting}>
              {isExporting && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
              {isExporting ? "Export en cours…" : `Exporter ${filtered.length || ""}`.trim()}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <h3 className="mb-2 text-sm font-medium text-[#0b0b0b]">Format</h3>
          <div className="grid grid-cols-3 gap-2">
            {EXPORT_FORMATS.map((meta) => {
              const isActive = format === meta.format;
              return (
                <button
                  key={meta.format}
                  type="button"
                  onClick={() => setFormat(meta.format)}
                  aria-pressed={isActive}
                  className={`flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "border-[#2a78d6] bg-[#eaf2fc] ring-1 ring-inset ring-[#2a78d6]"
                      : "border-[#e1e0d9] bg-white hover:bg-[#f9f9f7]"
                  }`}
                >
                  <span className="text-sm font-semibold text-[#0b0b0b]">{meta.label}</span>
                  <span className="text-xs text-[#898781]">{meta.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#0b0b0b]">Filtres</h3>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="text-xs font-medium text-[#2a78d6] hover:underline">
                Réinitialiser les filtres
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Du" htmlFor="export-date-from">
                <input
                  id="export-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Au" htmlFor="export-date-to">
                <input
                  id="export-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className={inputClasses}
                />
              </FormField>
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-[#0b0b0b]">Catégories</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={clearCategories}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    categories.size === 0
                      ? "bg-[#0b0b0b] text-white"
                      : "bg-[#f0efec] text-[#52514e] hover:bg-[#e1e0d9]"
                  }`}
                >
                  Toutes les catégories
                </button>
                {CATEGORY_LIST.map((category) => {
                  const isActive = categories.has(category);
                  const meta = CATEGORY_META[category];
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      aria-pressed={isActive}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        isActive ? "" : "bg-[#f0efec] text-[#52514e] hover:bg-[#e1e0d9]"
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: meta.bg, color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}55` }
                          : undefined
                      }
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <FormField label="Nom du fichier" htmlFor="export-filename">
            <div className="flex items-center gap-2">
              <input
                id="export-filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="depenses"
                className={inputClasses}
              />
              <span className="whitespace-nowrap text-sm text-[#898781]">.{format}</span>
            </div>
          </FormField>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#0b0b0b]">Aperçu</h3>
            <span className="text-xs text-[#898781]">
              {filtered.length} ligne{filtered.length === 1 ? "" : "s"} · {formatCurrency(total)} au total
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#e1e0d9] px-4 py-6 text-center text-sm text-[#898781]">
              Aucune dépense ne correspond aux filtres actuels.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[#e1e0d9]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f9f9f7] text-xs uppercase tracking-wide text-[#898781]">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Catégorie</th>
                    <th className="px-3 py-2 font-medium text-right">Montant</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece9e2]">
                  {preview.map((expense) => (
                    <tr key={expense.id}>
                      <td className="whitespace-nowrap px-3 py-2 text-[#52514e]">{expense.date}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-[#52514e]">{CATEGORY_META[expense.category].label}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-[#0b0b0b]">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-2 text-[#52514e]" title={expense.description}>
                        {expense.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hiddenCount > 0 && (
                <div className="border-t border-[#ece9e2] bg-[#f9f9f7] px-3 py-2 text-center text-xs text-[#898781]">
                  + {hiddenCount} ligne{hiddenCount === 1 ? "" : "s"} supplémentaire{hiddenCount === 1 ? "" : "s"} non affichée{hiddenCount === 1 ? "" : "s"}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </Drawer>
  );
}
