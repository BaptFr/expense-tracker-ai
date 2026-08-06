"use client";

import { useMemo } from "react";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency, monthKey } from "@/lib/utils";
import { Expense } from "@/types/expense";
import { StatTile } from "@/components/ui/StatTile";

interface SummaryCardsProps {
  expenses: Expense[];
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonthTotal = expenses
      .filter((e) => monthKey(e.date) === thisMonthKey)
      .reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = expenses
      .filter((e) => monthKey(e.date) === lastMonthKey)
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals = new Map<string, number>();
    for (const e of expenses) {
      categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount);
    }
    let topCategory: string | null = null;
    let topCategoryTotal = 0;
    categoryTotals.forEach((amount, category) => {
      if (amount > topCategoryTotal) {
        topCategory = category;
        topCategoryTotal = amount;
      }
    });

    return {
      total,
      thisMonthTotal,
      lastMonthTotal,
      topCategory,
      topCategoryTotal,
      transactionCount: expenses.length,
    };
  }, [expenses]);

  const monthDeltaPercent =
    stats.lastMonthTotal > 0
      ? ((stats.thisMonthTotal - stats.lastMonthTotal) / stats.lastMonthTotal) * 100
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Total spending" value={formatCurrency(stats.total)} />
      <StatTile
        label="This month"
        value={formatCurrency(stats.thisMonthTotal)}
        delta={
          monthDeltaPercent === null
            ? undefined
            : {
                text: `${Math.abs(monthDeltaPercent).toFixed(0)}% vs last month`,
                direction: monthDeltaPercent > 0 ? "up" : monthDeltaPercent < 0 ? "down" : "flat",
                isGood: monthDeltaPercent <= 0,
              }
        }
      />
      <StatTile
        label="Top category"
        value={stats.topCategory ?? "—"}
        accent={stats.topCategory ? CATEGORY_META[stats.topCategory as keyof typeof CATEGORY_META].color : undefined}
        caption={stats.topCategory ? formatCurrency(stats.topCategoryTotal) : undefined}
      />
      <StatTile label="Transactions" value={String(stats.transactionCount)} />
    </div>
  );
}
