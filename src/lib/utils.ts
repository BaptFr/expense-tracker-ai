import { Expense } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "numeric",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Compact currency for stat tiles: 1 284 € / 12,9 k€ / 4,2 M€ */
export function formatCurrencyCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(".", ",")} M€`;
  if (abs >= 10_000) return `${(amount / 1_000).toFixed(1).replace(".", ",")} k€`;
  return currencyFormatter.format(amount);
}

export function formatDate(iso: string): string {
  const parsed = parseIsoDateLocal(iso);
  return dateFormatter.format(parsed);
}

export function formatMonth(iso: string): string {
  const parsed = parseIsoDateLocal(iso);
  return monthFormatter.format(parsed);
}

/** Parses a yyyy-mm-dd string as a local date, avoiding UTC off-by-one shifts. */
export function parseIsoDateLocal(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function todayIso(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // yyyy-mm
}

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportExpensesToCsv(expenses: Expense[]): void {
  const header = ["Date", "Catégorie", "Montant", "Description"];
  const rows = expenses
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [e.date, CATEGORY_META[e.category].label, e.amount.toFixed(2), e.description]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = todayIso();
  link.href = url;
  link.download = `depenses-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
