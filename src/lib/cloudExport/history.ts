import { ExportHistoryEntry } from "@/lib/cloudExport/types";
import { readJson, writeJson } from "@/lib/cloudExport/storage";
import { generateId } from "@/lib/storage";

const HISTORY_KEY = "expense-tracker:export-history";
const HISTORY_LIMIT = 25;

export function loadExportHistory(): ExportHistoryEntry[] {
  return readJson<ExportHistoryEntry[]>(HISTORY_KEY, []);
}

export function recordExport(entry: Omit<ExportHistoryEntry, "id" | "timestamp">): ExportHistoryEntry[] {
  const full: ExportHistoryEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  const next = [full, ...loadExportHistory()].slice(0, HISTORY_LIMIT);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function clearExportHistory(): ExportHistoryEntry[] {
  writeJson(HISTORY_KEY, []);
  return [];
}
