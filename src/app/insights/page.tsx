"use client";

import { useExpenses } from "@/context/ExpensesContext";
import { PageSpinner } from "@/components/ui/Spinner";
import { MonthlyInsights } from "@/components/MonthlyInsights";

export default function InsightsPage() {
  const { expenses, isLoading } = useExpenses();

  if (isLoading) return <PageSpinner />;

  return <MonthlyInsights expenses={expenses} />;
}
