import { Expense } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";
import { downloadBlob } from "@/lib/export/downloadBlob";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function writeCsv(expenses: Expense[], filename: string): void {
  const header = ["Date", "Catégorie", "Montant", "Description"];
  const rows = expenses.map((e) => [e.date, CATEGORY_META[e.category].label, e.amount.toFixed(2), e.description]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}
