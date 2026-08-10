import { Category, Expense } from "@/types/expense";

export type ExportFormat = "csv" | "json" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  dateFrom: string;
  dateTo: string;
  categories: Set<Category>;
  filename: string;
}

export interface ExportFormatMeta {
  format: ExportFormat;
  label: string;
  extension: string;
  description: string;
}

export const EXPORT_FORMATS: ExportFormatMeta[] = [
  { format: "csv", label: "CSV", extension: "csv", description: "Spreadsheet-friendly" },
  { format: "json", label: "JSON", extension: "json", description: "Raw structured data" },
  { format: "pdf", label: "PDF", extension: "pdf", description: "Formatted report" },
];

export interface ExportWriter {
  (expenses: Expense[], filename: string): void | Promise<void>;
}
