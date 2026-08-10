import { useCallback, useMemo, useState } from "react";
import { Category, Expense } from "@/types/expense";
import { ExportFormat } from "@/lib/export/types";
import { filterExpensesForExport } from "@/lib/export/filterExpenses";
import { runExport } from "@/lib/export";
import { todayIso } from "@/lib/utils";

const PREVIEW_LIMIT = 8;

export function useExportBuilder(expenses: Expense[]) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categories, setCategories] = useState<Set<Category>>(new Set());
  const [filename, setFilename] = useState(`expenses-${todayIso()}`);
  const [isExporting, setIsExporting] = useState(false);

  const toggleCategory = useCallback((category: Category) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const clearCategories = useCallback(() => setCategories(new Set()), []);

  const filtered = useMemo(
    () => filterExpensesForExport(expenses, { dateFrom, dateTo, categories }),
    [expenses, dateFrom, dateTo, categories]
  );

  const total = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered]);
  const preview = useMemo(() => filtered.slice(0, PREVIEW_LIMIT), [filtered]);
  const hiddenCount = Math.max(0, filtered.length - preview.length);

  const hasActiveFilters = Boolean(dateFrom || dateTo || categories.size > 0);

  const resetFilters = useCallback(() => {
    setDateFrom("");
    setDateTo("");
    setCategories(new Set());
  }, []);

  const doExport = useCallback(async () => {
    setIsExporting(true);
    try {
      return await runExport(expenses, { format, dateFrom, dateTo, categories, filename });
    } finally {
      setIsExporting(false);
    }
  }, [expenses, format, dateFrom, dateTo, categories, filename]);

  return {
    format,
    setFormat,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    categories,
    toggleCategory,
    clearCategories,
    filename,
    setFilename,
    isExporting,
    filtered,
    total,
    preview,
    hiddenCount,
    hasActiveFilters,
    resetFilters,
    doExport,
  };
}
