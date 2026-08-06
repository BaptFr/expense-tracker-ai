export const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  date: string; // ISO date, yyyy-mm-dd
  amount: number;
  category: Category;
  description: string;
  createdAt: string; // ISO timestamp, for stable sort/id purposes
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt">;

export interface ExpenseFormErrors {
  date?: string;
  amount?: string;
  category?: string;
  description?: string;
}
