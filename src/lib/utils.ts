import { Expense } from "@/types/expense";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Compact currency for stat tiles: $1,284 / $12.9K / $4.2M */
export function formatCurrencyCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `$${(amount / 1_000).toFixed(1)}K`;
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
  const header = ["Date", "Category", "Description", "Amount"];
  const rows = expenses
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [e.date, e.category, e.description, e.amount.toFixed(2)]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = todayIso();
  link.href = url;
  link.download = `expenses-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
