import { Expense } from "@/types/expense";
import { TemplateId, ExportFormat } from "@/lib/cloudExport/types";
import { aggregateByCategory } from "@/lib/cloudExport/aggregate";
import { formatCurrency, formatDate, formatMonth, monthKey, todayIso } from "@/lib/utils";
import type { Cell } from "@/lib/cloudExport/writers";

export interface TemplateBuild {
  title: string;
  subtitle: string;
  headers: string[];
  rows: Cell[][];
  footerRow?: Cell[];
  jsonPayload: unknown;
  recordCount: number;
}

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  format: ExportFormat;
  icon: "receipt" | "calendar" | "chart" | "archive";
  build: (expenses: Expense[]) => TemplateBuild;
}

function currentYearRange(): [string, string] {
  const year = new Date().getFullYear();
  return [`${year}-01-01`, `${year}-12-31`];
}

function itemizedRows(expenses: Expense[]): Cell[][] {
  return expenses
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [formatDate(e.date), e.category, formatCurrency(e.amount), e.description]);
}

export const EXPORT_TEMPLATES: TemplateDefinition[] = [
  {
    id: "tax-report",
    label: "Tax Report",
    description: "Every itemized expense for the current calendar year, ready for your accountant.",
    format: "pdf",
    icon: "receipt",
    build: (expenses) => {
      const [from, to] = currentYearRange();
      const inRange = expenses.filter((e) => e.date >= from && e.date <= to);
      const total = inRange.reduce((sum, e) => sum + e.amount, 0);
      const year = new Date().getFullYear();
      return {
        title: `Tax Report — ${year}`,
        subtitle: `Itemized expenses from Jan 1 to Dec 31, ${year} · Generated ${new Date().toLocaleDateString("en-US")}`,
        headers: ["Date", "Category", "Amount", "Description"],
        rows: itemizedRows(inRange),
        footerRow: ["", "", formatCurrency(total), "Total"],
        jsonPayload: { year, total, count: inRange.length, expenses: inRange },
        recordCount: inRange.length,
      };
    },
  },
  {
    id: "monthly-summary",
    label: "Monthly Summary",
    description: "A category-by-category breakdown of this month's spending.",
    format: "pdf",
    icon: "calendar",
    build: (expenses) => {
      const key = monthKey(todayIso());
      const inMonth = expenses.filter((e) => monthKey(e.date) === key);
      const breakdown = aggregateByCategory(inMonth);
      const total = inMonth.reduce((sum, e) => sum + e.amount, 0);
      const label = formatMonth(todayIso());
      return {
        title: `Monthly Summary — ${label}`,
        subtitle: `Category breakdown for ${label} · Generated ${new Date().toLocaleDateString("en-US")}`,
        headers: ["Category", "Transactions", "Total", "Share"],
        rows: breakdown.map((row) => [row.category, row.count, formatCurrency(row.total), `${row.percent.toFixed(1)}%`]),
        footerRow: ["", inMonth.length, formatCurrency(total), "100%"],
        jsonPayload: { month: label, total, count: inMonth.length, breakdown },
        recordCount: inMonth.length,
      };
    },
  },
  {
    id: "category-analysis",
    label: "Category Analysis",
    description: "All-time spending totals and share per category, sorted highest first.",
    format: "csv",
    icon: "chart",
    build: (expenses) => {
      const breakdown = aggregateByCategory(expenses);
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        title: "Category Analysis",
        subtitle: "All-time spending by category",
        headers: ["Category", "Transactions", "Total", "Share of spend"],
        rows: breakdown.map((row) => [row.category, row.count, row.total.toFixed(2), `${row.percent.toFixed(1)}%`]),
        footerRow: ["", expenses.length, total.toFixed(2), "100%"],
        jsonPayload: { total, count: expenses.length, breakdown },
        recordCount: breakdown.length,
      };
    },
  },
  {
    id: "full-backup",
    label: "Full Data Backup",
    description: "A complete, structured export of every expense record you have.",
    format: "json",
    icon: "archive",
    build: (expenses) => ({
      title: "Full Data Backup",
      subtitle: "Complete raw export",
      headers: ["Date", "Category", "Amount", "Description"],
      rows: itemizedRows(expenses),
      jsonPayload: { exportedAt: new Date().toISOString(), count: expenses.length, expenses },
      recordCount: expenses.length,
    }),
  },
];

export function getTemplate(id: TemplateId): TemplateDefinition {
  const template = EXPORT_TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`Unknown export template: ${id}`);
  return template;
}
