import { Expense } from "@/types/expense";
import { TemplateId, ExportFormat } from "@/lib/cloudExport/types";
import { aggregateByCategory } from "@/lib/cloudExport/aggregate";
import { CATEGORY_META } from "@/lib/categories";
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
    .map((e) => [formatDate(e.date), CATEGORY_META[e.category].label, formatCurrency(e.amount), e.description]);
}

export const EXPORT_TEMPLATES: TemplateDefinition[] = [
  {
    id: "tax-report",
    label: "Rapport fiscal",
    description: "Chaque dépense détaillée pour l'année civile en cours, prête pour votre comptable.",
    format: "pdf",
    icon: "receipt",
    build: (expenses) => {
      const [from, to] = currentYearRange();
      const inRange = expenses.filter((e) => e.date >= from && e.date <= to);
      const total = inRange.reduce((sum, e) => sum + e.amount, 0);
      const year = new Date().getFullYear();
      return {
        title: `Rapport fiscal — ${year}`,
        subtitle: `Dépenses détaillées du 1er janvier au 31 décembre ${year} · Généré le ${new Date().toLocaleDateString("fr-FR")}`,
        headers: ["Date", "Catégorie", "Montant", "Description"],
        rows: itemizedRows(inRange),
        footerRow: ["", "", formatCurrency(total), "Total"],
        jsonPayload: { year, total, count: inRange.length, expenses: inRange },
        recordCount: inRange.length,
      };
    },
  },
  {
    id: "monthly-summary",
    label: "Résumé mensuel",
    description: "Une répartition catégorie par catégorie des dépenses de ce mois-ci.",
    format: "pdf",
    icon: "calendar",
    build: (expenses) => {
      const key = monthKey(todayIso());
      const inMonth = expenses.filter((e) => monthKey(e.date) === key);
      const breakdown = aggregateByCategory(inMonth);
      const total = inMonth.reduce((sum, e) => sum + e.amount, 0);
      const label = formatMonth(todayIso());
      return {
        title: `Résumé mensuel — ${label}`,
        subtitle: `Répartition par catégorie pour ${label} · Généré le ${new Date().toLocaleDateString("fr-FR")}`,
        headers: ["Catégorie", "Transactions", "Total", "Part"],
        rows: breakdown.map((row) => [CATEGORY_META[row.category].label, row.count, formatCurrency(row.total), `${row.percent.toFixed(1)}%`]),
        footerRow: ["", inMonth.length, formatCurrency(total), "100%"],
        jsonPayload: { month: label, total, count: inMonth.length, breakdown },
        recordCount: inMonth.length,
      };
    },
  },
  {
    id: "category-analysis",
    label: "Analyse par catégorie",
    description: "Totaux et part de dépenses par catégorie depuis le début, triés du plus élevé au plus faible.",
    format: "csv",
    icon: "chart",
    build: (expenses) => {
      const breakdown = aggregateByCategory(expenses);
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        title: "Analyse par catégorie",
        subtitle: "Dépenses par catégorie depuis le début",
        headers: ["Catégorie", "Transactions", "Total", "Part des dépenses"],
        rows: breakdown.map((row) => [CATEGORY_META[row.category].label, row.count, row.total.toFixed(2), `${row.percent.toFixed(1)}%`]),
        footerRow: ["", expenses.length, total.toFixed(2), "100%"],
        jsonPayload: { total, count: expenses.length, breakdown },
        recordCount: breakdown.length,
      };
    },
  },
  {
    id: "full-backup",
    label: "Sauvegarde complète",
    description: "Un export complet et structuré de toutes vos dépenses enregistrées.",
    format: "json",
    icon: "archive",
    build: (expenses) => ({
      title: "Sauvegarde complète",
      subtitle: "Export brut complet",
      headers: ["Date", "Catégorie", "Montant", "Description"],
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
