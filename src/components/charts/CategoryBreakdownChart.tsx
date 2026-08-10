"use client";

import { useMemo, useState } from "react";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";
import { Category, Expense } from "@/types/expense";
import { EmptyState } from "@/components/ui/EmptyState";

interface CategoryBreakdownChartProps {
  expenses: Expense[];
}

interface Row {
  category: Category;
  total: number;
  percent: number;
}

export function CategoryBreakdownChart({ expenses }: CategoryBreakdownChartProps) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const rows: Row[] = useMemo(() => {
    const totals = new Map<Category, number>();
    for (const e of expenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    return Array.from(totals.entries())
      .map(([category, total]) => ({
        category,
        total,
        percent: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const maxTotal = rows[0]?.total ?? 0;

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Aucune dépense pour le moment"
        description="Ajoutez une dépense pour voir la répartition de vos dépenses par catégorie."
      />
    );
  }

  return (
    <div role="img" aria-label="Diagramme en barres des dépenses totales par catégorie" className="flex flex-col gap-3">
      {rows.map((row) => {
        const meta = CATEGORY_META[row.category];
        const widthPercent = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0;
        const isActive = activeCategory === row.category;
        // Value fits inside the bar once it's wide enough for the text + padding.
        const labelFitsInside = widthPercent > 32;

        return (
          <div
            key={row.category}
            className="group relative"
            tabIndex={0}
            role="group"
            aria-label={`${meta.label} : ${formatCurrency(row.total)}, ${row.percent.toFixed(0)} pourcent du total`}
            onMouseEnter={() => setActiveCategory(row.category)}
            onMouseLeave={() => setActiveCategory(null)}
            onFocus={() => setActiveCategory(row.category)}
            onBlur={() => setActiveCategory(null)}
          >
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-[#0b0b0b]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden
                />
                {meta.label}
              </span>
              {!labelFitsInside && (
                <span className="tabular-nums text-[#52514e]">{formatCurrency(row.total)}</span>
              )}
            </div>
            <div
              className="relative h-5 rounded-r-md bg-[#f0efec]"
              style={{ height: 20 }}
            >
              <div
                className="absolute inset-y-0 left-0 flex items-center justify-end rounded-r-[4px] pr-2 transition-[width,filter] duration-150"
                style={{
                  width: `${Math.max(widthPercent, 2)}%`,
                  backgroundColor: meta.color,
                  filter: isActive ? "brightness(1.08)" : undefined,
                }}
              >
                {labelFitsInside && (
                  <span className="tabular-nums text-xs font-semibold text-white">
                    {formatCurrency(row.total)}
                  </span>
                )}
              </div>
            </div>

            {isActive && (
              <div
                role="tooltip"
                className="absolute -top-2 left-4 z-10 -translate-y-full whitespace-nowrap rounded-md bg-[#0b0b0b] px-2.5 py-1.5 text-xs text-white shadow-lg"
              >
                <span className="font-semibold">{formatCurrency(row.total)}</span>
                <span className="ml-1.5 text-white/70">
                  · {meta.label} · {row.percent.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
