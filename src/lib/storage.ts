import { Expense } from "@/types/expense";

const STORAGE_KEY = "expense-tracker:expenses";
const SEED_FLAG_KEY = "expense-tracker:seeded";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function buildSampleExpenses(): Expense[] {
  const samples: Array<[number, number, Expense["category"], string]> = [
    [1, 42.5, "Food", "Groceries at Trader Joe's"],
    [3, 12.99, "Entertainment", "Movie streaming subscription"],
    [4, 65.0, "Transportation", "Gas fill-up"],
    [6, 89.2, "Shopping", "New running shoes"],
    [9, 120.0, "Bills", "Electricity bill"],
    [12, 8.75, "Food", "Coffee and bagel"],
    [15, 34.6, "Transportation", "Rideshare to airport"],
    [20, 55.0, "Entertainment", "Concert tickets"],
    [25, 200.0, "Bills", "Internet & phone"],
    [33, 27.4, "Food", "Lunch with coworkers"],
    [40, 150.0, "Shopping", "Winter jacket"],
    [48, 19.99, "Other", "Donation"],
    [55, 75.3, "Food", "Weekly groceries"],
    [62, 45.0, "Transportation", "Metro card top-up"],
    [70, 300.0, "Bills", "Rent utilities share"],
  ];

  return samples.map(([daysAgo, amount, category, description]) => ({
    id: generateId(),
    date: isoDaysAgo(daysAgo),
    amount,
    category,
    description,
    createdAt: new Date().toISOString(),
  }));
}

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Expense[];
      return [];
    }

    const alreadySeeded = window.localStorage.getItem(SEED_FLAG_KEY);
    if (!alreadySeeded) {
      const seeded = buildSampleExpenses();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      window.localStorage.setItem(SEED_FLAG_KEY, "true");
      return seeded;
    }

    return [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export { generateId };
