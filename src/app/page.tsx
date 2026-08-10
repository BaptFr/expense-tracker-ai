"use client";

import { useState } from "react";
import Link from "next/link";
import { useExpenses } from "@/context/ExpensesContext";
import { useToast } from "@/context/ToastContext";
import { SummaryCards } from "@/components/SummaryCards";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseRow } from "@/components/ExpenseRow";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { ExportDrawer } from "@/components/export/ExportDrawer";
import { ExpenseInput } from "@/types/expense";

export default function DashboardPage() {
  const { expenses, isLoading, addExpense } = useExpenses();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportDrawer, setShowExportDrawer] = useState(false);

  function handleAdd(input: ExpenseInput) {
    addExpense(input);
    setShowAddModal(false);
    showToast("Expense added.");
  }

  function handleExported(count: number, format: string) {
    setShowExportDrawer(false);
    showToast(`Exported ${count} record${count === 1 ? "" : "s"} as ${format.toUpperCase()}.`);
  }

  if (isLoading) return <PageSpinner />;

  const recent = expenses
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#0b0b0b]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#52514e]">A snapshot of your spending.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowExportDrawer(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export data
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add expense
          </Button>
        </div>
      </div>

      <SummaryCards expenses={expenses} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Spending by category" subtitle="All-time totals">
          <CategoryBreakdownChart expenses={expenses} />
        </Card>
        <Card title="Monthly trend" subtitle="Last 6 months">
          <MonthlyTrendChart expenses={expenses} />
        </Card>
      </div>

      <Card
        title="Recent expenses"
        action={
          <Link href="/expenses" className="text-sm font-medium text-[#2a78d6] hover:underline">
            View all
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            description="Start tracking by adding your first expense."
            action={<Button onClick={() => setShowAddModal(true)}>Add expense</Button>}
          />
        ) : (
          <div>
            {recent.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </Card>

      {showAddModal && (
        <Modal title="Add expense" onClose={() => setShowAddModal(false)}>
          <ExpenseForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
        </Modal>
      )}

      {showExportDrawer && (
        <ExportDrawer
          expenses={expenses}
          onClose={() => setShowExportDrawer(false)}
          onExported={handleExported}
        />
      )}
    </div>
  );
}
