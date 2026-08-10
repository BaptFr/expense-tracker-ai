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
    [1, 42.5, "Food", "Courses"],
    [3, 12.99, "Entertainment", "Abonnement streaming vidéo"],
    [4, 65.0, "Transportation", "Plein d'essence"],
    [6, 89.2, "Shopping", "Nouvelles chaussures de course"],
    [9, 120.0, "Bills", "Facture d'électricité"],
    [12, 8.75, "Food", "Cafés et croissants"],
    [15, 34.6, "Transportation", "VTC aéroport"],
    [20, 55.0, "Entertainment", "Billets de concert"],
    [25, 200.0, "Bills", "Internet et téléphone"],
    [33, 27.4, "Food", "Déjeuner avec des collègues"],
    [40, 150.0, "Shopping", "Manteau d'hiver"],
    [48, 19.99, "Other", "Don"],
    [55, 75.3, "Food", "Courses de la semaine"],
    [62, 45.0, "Transportation", "Rechargement carte de transport"],
    [70, 300.0, "Bills", "Quote-part charges locatives"],
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
