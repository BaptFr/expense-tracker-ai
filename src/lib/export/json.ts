import { Expense } from "@/types/expense";
import { downloadBlob } from "@/lib/export/downloadBlob";

export function writeJson(expenses: Expense[], filename: string): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    count: expenses.length,
    expenses: expenses.map(({ date, category, amount, description }) => ({
      date,
      category,
      amount,
      description,
    })),
  };

  const json = JSON.stringify(payload, null, 2);
  downloadBlob(new Blob([json], { type: "application/json;charset=utf-8;" }), filename);
}
