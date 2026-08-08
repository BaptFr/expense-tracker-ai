"use client";

import { useMemo } from "react";
import { useExpenses } from "@/context/ExpensesContext";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";
import { Category } from "@/types/expense";

interface CategoryRank {
  category: Category;
  total: number;
  count: number;
  percent: number;
}

export default function TopCategoriesPage() {
  const { expenses, isLoading } = useExpenses();

  const ranked: CategoryRank[] = useMemo(() => {
    const totals = new Map<Category, { total: number; count: number }>();
    for (const e of expenses) {
      const entry = totals.get(e.category) ?? { total: 0, count: 0 };
      entry.total += e.amount;
      entry.count += 1;
      totals.set(e.category, entry);
    }
    const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    return Array.from(totals.entries())
      .map(([category, { total, count }]) => ({
        category,
        total,
        count,
        percent: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[#0b0b0b]">Top Categories</h1>
        <p className="mt-0.5 text-sm text-[#52514e]">
          Your spending categories, ranked by total amount.
        </p>
      </div>

      <Card
        title={`${ranked.length} categor${ranked.length === 1 ? "y" : "ies"}`}
        subtitle={ranked.length > 0 ? "All-time totals" : undefined}
      >
        {ranked.length === 0 ? (
          <EmptyState
            title="No spending yet"
            description="Add an expense to see which categories you spend the most on."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-[#f0efec]">
            {ranked.map((row, index) => {
              const meta = CATEGORY_META[row.category];
              return (
                <li key={row.category} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="w-5 shrink-0 text-center text-sm font-semibold text-[#898781]">
                    {index + 1}
                  </span>

                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-[#0b0b0b]">
                        {row.category}
                      </span>
                      <span className="shrink-0 tabular-nums text-sm font-semibold text-[#0b0b0b]">
                        {formatCurrency(row.total)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0efec]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(row.percent, 2)}%`, backgroundColor: meta.color }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-[#898781]">
                      <span>
                        {row.count} transaction{row.count === 1 ? "" : "s"}
                      </span>
                      <span>{row.percent.toFixed(1)}% of total</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
