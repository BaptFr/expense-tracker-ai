"use client";

import { useMemo } from "react";
import { Category, Expense } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";
import { CategorySlice, computeBudgetStreak, computeTopCategorySlices } from "@/lib/insights";
import { formatCurrency, formatMonth, monthKey, todayIso } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SpendingDonutChart } from "@/components/charts/SpendingDonutChart";

const OTHER_SLICE_COLOR = "#898781";
const STREAK_MILESTONE_DAYS = 30;

function isRealCategory(category: CategorySlice["category"]): category is Category {
  return category !== "Other categories";
}

function sliceLabel(category: CategorySlice["category"]): string {
  return isRealCategory(category) ? CATEGORY_META[category].label : "Autres catégories";
}

interface MonthlyInsightsProps {
  expenses: Expense[];
}

export function MonthlyInsights({ expenses }: MonthlyInsightsProps) {
  const thisMonthKey = monthKey(todayIso());

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === thisMonthKey),
    [expenses, thisMonthKey]
  );

  const slices = useMemo(() => computeTopCategorySlices(monthExpenses), [monthExpenses]);
  const streak = useMemo(() => computeBudgetStreak(expenses), [expenses]);

  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const streakProgress = Math.min(100, (streak.days / STREAK_MILESTONE_DAYS) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[#0b0b0b]">Aperçu mensuel</h1>
        <p className="mt-0.5 text-sm text-[#52514e]">{formatMonth(todayIso())} en un coup d&apos;œil.</p>
      </div>

      <Card title="Répartition des dépenses" subtitle={formatMonth(todayIso())}>
        {slices.length === 0 ? (
          <EmptyState
            title="Aucune dépense ce mois-ci"
            description="Dès que vous enregistrerez une dépense ce mois-ci, sa répartition apparaîtra ici."
          />
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
            <SpendingDonutChart
              segments={slices.map((slice) => ({
                key: slice.key,
                label: sliceLabel(slice.category),
                value: slice.total,
                color: isRealCategory(slice.category) ? CATEGORY_META[slice.category].color : OTHER_SLICE_COLOR,
              }))}
              centerLabel="Dépenses"
            />

            <ul className="flex w-full max-w-xs flex-col gap-3">
              {slices.map((slice) => {
                const meta = isRealCategory(slice.category) ? CATEGORY_META[slice.category] : null;
                return (
                  <li key={slice.key} className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                      style={{ backgroundColor: meta ? meta.bg : "#f0efec" }}
                      aria-hidden
                    >
                      {meta ? meta.emoji : "➕"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0b0b0b]">{sliceLabel(slice.category)}</p>
                      <p className="text-xs text-[#898781]">{slice.percent.toFixed(0)}% du mois</p>
                    </div>
                    <span className="shrink-0 tabular-nums text-sm font-semibold text-[#0b0b0b]">
                      {formatCurrency(slice.total)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Card>

      <div className="rounded-xl border-2 border-dashed border-[#c3c2b7] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[#0b0b0b]">Série budget</h2>
            <p className="mt-0.5 max-w-xs text-xs text-[#898781]">
              Jours consécutifs de dépenses à ou sous votre moyenne quotidienne récente
              {streak.averageDailySpend > 0 ? ` de ${formatCurrency(streak.averageDailySpend)}` : ""}.
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-semibold text-[#0ca30c]">{streak.days}</span>
            <span className="ml-1.5 text-sm font-medium text-[#52514e]">
              jour{streak.days === 1 ? "" : "s"} !
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e2f3e2]">
            <div
              className="h-full rounded-full bg-[#0ca30c] transition-[width] duration-300"
              style={{ width: `${Math.max(streakProgress, streak.days > 0 ? 3 : 0)}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs text-[#898781]">
            {streak.days} / {STREAK_MILESTONE_DAYS} jours pour un mois parfait
          </p>
        </div>
      </div>

      {monthTotal > 0 && (
        <p className="text-center text-xs text-[#898781]">
          Total dépensé en {formatMonth(todayIso())} : {formatCurrency(monthTotal)}
        </p>
      )}
    </div>
  );
}
