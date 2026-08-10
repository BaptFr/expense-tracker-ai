import { Category, Expense } from "@/types/expense";
import { CATEGORY_LIST } from "@/lib/categories";

export interface CategoryTotal {
  category: Category;
  count: number;
  total: number;
  percent: number;
}

export function aggregateByCategory(expenses: Expense[]): CategoryTotal[] {
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  const totals = CATEGORY_LIST.map((category) => {
    const matches = expenses.filter((e) => e.category === category);
    const total = matches.reduce((sum, e) => sum + e.amount, 0);
    return {
      category,
      count: matches.length,
      total,
      percent: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    };
  }).filter((row) => row.count > 0);

  return totals.sort((a, b) => b.total - a.total);
}
