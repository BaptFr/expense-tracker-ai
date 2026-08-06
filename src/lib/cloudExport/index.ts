import { Expense } from "@/types/expense";
import { getTemplate } from "@/lib/cloudExport/templates";
import { writeCsvTable, writeJsonPayload, writePdfTable } from "@/lib/cloudExport/writers";
import { ExportFormat, TemplateId } from "@/lib/cloudExport/types";
import { todayIso } from "@/lib/utils";

export interface RunResult {
  recordCount: number;
  filename: string;
  format: ExportFormat;
}

/** Builds the template's data and triggers a real client-side download. */
export function downloadTemplate(expenses: Expense[], templateId: TemplateId): RunResult {
  const template = getTemplate(templateId);
  const built = template.build(expenses);
  const filename = `${templateId}-${todayIso()}.${template.format}`;

  if (template.format === "csv") {
    const rows = built.footerRow ? [...built.rows, built.footerRow] : built.rows;
    writeCsvTable(built.headers, rows, filename);
  } else if (template.format === "json") {
    writeJsonPayload(built.jsonPayload, filename);
  } else {
    writePdfTable(built.title, built.subtitle, built.headers, built.rows, filename, built.footerRow);
  }

  return { recordCount: built.recordCount, filename, format: template.format };
}

/** Computes what a template would export without writing a file — used for simulated destinations. */
export function previewTemplate(expenses: Expense[], templateId: TemplateId): RunResult {
  const template = getTemplate(templateId);
  const built = template.build(expenses);
  return {
    recordCount: built.recordCount,
    filename: `${templateId}-${todayIso()}.${template.format}`,
    format: template.format,
  };
}

export * from "@/lib/cloudExport/types";
export { EXPORT_TEMPLATES, getTemplate } from "@/lib/cloudExport/templates";
