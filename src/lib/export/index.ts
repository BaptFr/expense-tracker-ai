import { Expense } from "@/types/expense";
import { ExportFormat, ExportOptions } from "@/lib/export/types";
import { filterExpensesForExport } from "@/lib/export/filterExpenses";
import { writeCsv } from "@/lib/export/csv";
import { writeJson } from "@/lib/export/json";
import { writePdf } from "@/lib/export/pdf";

const WRITERS: Record<ExportFormat, (expenses: Expense[], filename: string) => void> = {
  csv: writeCsv,
  json: writeJson,
  pdf: writePdf,
};

const EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  json: "json",
  pdf: "pdf",
};

export function buildExportFilename(base: string, format: ExportFormat): string {
  const trimmed = base.trim() || "depenses";
  const sanitized = trimmed.replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-");
  const extension = EXTENSIONS[format];
  return sanitized.toLowerCase().endsWith(`.${extension}`) ? sanitized : `${sanitized}.${extension}`;
}

/** Filters expenses per the given options and triggers a client-side download. */
export async function runExport(expenses: Expense[], options: ExportOptions): Promise<number> {
  const filtered = filterExpensesForExport(expenses, options);
  const filename = buildExportFilename(options.filename, options.format);

  // Yield to the browser so the loading state paints before the (potentially
  // heavy, synchronous) PDF layout work blocks the main thread.
  await new Promise((resolve) => requestAnimationFrame(resolve));

  WRITERS[options.format](filtered, filename);
  return filtered.length;
}

export { filterExpensesForExport } from "@/lib/export/filterExpenses";
export * from "@/lib/export/types";
