import { Category, Expense } from "@/types/expense";

export interface ExpenseFilter {
  dateFrom: string;
  dateTo: string;
  categories: Set<Category>;
}

export function filterExpensesForExport(expenses: Expense[], filter: ExpenseFilter): Expense[] {
  const { dateFrom, dateTo, categories } = filter;

  return expenses
    .filter((expense) => {
      if (dateFrom && expense.date < dateFrom) return false;
      if (dateTo && expense.date > dateTo) return false;
      if (categories.size > 0 && !categories.has(expense.category)) return false;
      return true;
    })
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
}
