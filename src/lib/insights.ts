import { Category, Expense } from "@/types/expense";
import { todayIso } from "@/lib/utils";

export interface CategorySlice {
  key: string;
  category: Category | "Other categories";
  total: number;
  percent: number;
}

const TOP_CATEGORY_LIMIT = 3;

/**
 * Ranks categories by total spend and folds everything past the top 3 into a
 * single "Other categories" rollup, so the chart and legend always agree on
 * exactly what's shown (never more slices than legend rows).
 */
export function computeTopCategorySlices(expenses: Expense[]): CategorySlice[] {
  const totals = new Map<Category, number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }

  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const ranked = Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const top = ranked.slice(0, TOP_CATEGORY_LIMIT);
  const rest = ranked.slice(TOP_CATEGORY_LIMIT);
  const restTotal = rest.reduce((sum, r) => sum + r.total, 0);

  const slices: CategorySlice[] = top.map((row) => ({
    key: row.category,
    category: row.category,
    total: row.total,
    percent: grandTotal > 0 ? (row.total / grandTotal) * 100 : 0,
  }));

  if (restTotal > 0) {
    slices.push({
      key: "__other__",
      category: "Other categories",
      total: restTotal,
      percent: grandTotal > 0 ? (restTotal / grandTotal) * 100 : 0,
    });
  }

  return slices;
}

export interface BudgetStreak {
  /** Consecutive days, counting back from today, spent at or under the daily average. */
  days: number;
  /** The rolling window the streak and average are computed over. */
  windowDays: number;
  averageDailySpend: number;
}

/**
 * There's no user-defined budget in this app, so "budget" here means the
 * user's own trailing daily average — a streak is how many days in a row
 * (most recent first, capped at the window) they've spent at or below their
 * own recent normal. Days with zero spend count as under budget.
 */
export function computeBudgetStreak(expenses: Expense[], windowDays = 30): BudgetStreak {
  if (expenses.length === 0) {
    return { days: 0, windowDays, averageDailySpend: 0 };
  }

  const dailyTotals = new Map<string, number>();
  for (const e of expenses) {
    dailyTotals.set(e.date, (dailyTotals.get(e.date) ?? 0) + e.amount);
  }

  const today = todayIso();
  const windowDates: string[] = [];
  const cursor = new Date();
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - i);
    windowDates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  const windowTotal = windowDates.reduce((sum, date) => sum + (dailyTotals.get(date) ?? 0), 0);
  const averageDailySpend = windowTotal / windowDays;

  let streak = 0;
  for (const date of windowDates) {
    const spend = dailyTotals.get(date) ?? 0;
    if (spend <= averageDailySpend) {
      streak += 1;
    } else {
      break;
    }
  }

  // A streak can't run past the first day anything was ever logged.
  const earliestDate = expenses.reduce((min, e) => (e.date < min ? e.date : min), today);
  const daysSinceEarliest =
    Math.floor((new Date(today).getTime() - new Date(earliestDate).getTime()) / 86_400_000) + 1;

  return {
    days: Math.min(streak, Math.max(daysSinceEarliest, 0)),
    windowDays,
    averageDailySpend,
  };
}
