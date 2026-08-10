"use client";

import { useMemo } from "react";
import { useExpenses } from "@/context/ExpensesContext";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/utils";
import { Category, Expense } from "@/types/expense";

const MAX_VENDORS = 15;

interface VendorSummary {
  key: string;
  name: string;
  total: number;
  count: number;
  topCategory: Category;
}

/**
 * The Expense data model has no dedicated "vendor" or "merchant" field, so
 * this page treats each expense's free-text `description` as the vendor
 * name. Descriptions are normalized (trimmed + lowercased) purely for
 * grouping — the displayed name keeps the original casing from the first
 * expense seen in each group.
 */
function summarizeVendors(expenses: Expense[]): VendorSummary[] {
  const groups = new Map<
    string,
    { name: string; total: number; count: number; categoryCounts: Map<Category, number> }
  >();

  for (const expense of expenses) {
    const normalized = expense.description.trim().toLowerCase();
    if (!normalized) continue;

    let group = groups.get(normalized);
    if (!group) {
      group = {
        name: expense.description.trim(),
        total: 0,
        count: 0,
        categoryCounts: new Map(),
      };
      groups.set(normalized, group);
    }

    group.total += expense.amount;
    group.count += 1;
    group.categoryCounts.set(
      expense.category,
      (group.categoryCounts.get(expense.category) ?? 0) + 1
    );
  }

  const summaries: VendorSummary[] = [];
  groups.forEach((group, key) => {
    let topCategory: Category = "Other";
    let topCategoryCount = -1;
    group.categoryCounts.forEach((count, category) => {
      if (count > topCategoryCount) {
        topCategory = category;
        topCategoryCount = count;
      }
    });
    summaries.push({
      key,
      name: group.name,
      total: group.total,
      count: group.count,
      topCategory,
    });
  });

  return summaries.sort((a, b) => b.total - a.total);
}

export default function TopVendorsPage() {
  const { expenses, isLoading } = useExpenses();

  const vendors = useMemo(() => summarizeVendors(expenses), [expenses]);
  const overallTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  if (isLoading) return <PageSpinner />;

  const topVendors = vendors.slice(0, MAX_VENDORS);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[#0b0b0b]">Top dépenses</h1>
        <p className="mt-0.5 text-sm text-[#52514e]">
          Où va votre argent ? Le top dépenses classées par montant et pourcentage sur les dépenses totales. rettouvez les codes couleurs des catégories de dépenses.
        </p>
      </div>

      <Card
        title={`Top ${topVendors.length} dépense${topVendors.length === 1 ? "" : "s"}`}
        subtitle={expenses.length > 0 ? `Sur ${vendors.length} dépense${vendors.length === 1 ? "" : "s"} au total` : undefined}
      >
        {topVendors.length === 0 ? (
          <EmptyState
            title="Aucune dépense pour le moment"
            description="Ajoutez des dépenses pour voir lesquelles sont les plus coûteuse ainsi que leurs catégories."
          />
        ) : (
          <ul className="divide-y divide-[#f0efec]">
            {topVendors.map((vendor, index) => {
              const share = overallTotal > 0 ? (vendor.total / overallTotal) * 100 : 0;
              const meta = CATEGORY_META[vendor.topCategory];
              return (
                <li key={vendor.key} className="flex items-center gap-4 py-3">
                  <span className="w-6 shrink-0 text-right text-sm font-medium text-[#898781]">
                    {index + 1}
                  </span>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                    title={meta.label}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#0b0b0b]">{vendor.name}</p>
                    <p className="mt-0.5 text-xs text-[#898781]">
                      {vendor.count} transaction{vendor.count === 1 ? "" : "s"} &middot;{" "}
                      {meta.label}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-[#0b0b0b]">
                      {formatCurrency(vendor.total)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#898781]">{share.toFixed(1)}% du total</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
