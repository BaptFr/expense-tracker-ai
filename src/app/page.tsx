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
    showToast("Dépense ajoutée.");
  }

  function handleExported(count: number, format: string) {
    setShowExportDrawer(false);
    showToast(`${count} ligne${count === 1 ? "" : "s"} exportée${count === 1 ? "" : "s"} au format ${format.toUpperCase()}.`);
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
          <h1 className="text-xl font-semibold text-[#0b0b0b]">Tableau de bord</h1>
          <p className="mt-0.5 text-sm text-[#52514e]">Un aperçu de vos dépenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowExportDrawer(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exporter les données
          </Button>
          <Link
            href="/export"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0b0b0b] ring-1 ring-inset ring-[#c3c2b7] transition-colors hover:bg-[#f9f9f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a78d6]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M7 18a4 4 0 1 1 .7-7.94A5 5 0 0 1 17 12h.5a3.5 3.5 0 0 1 0 7H7Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Centre d&apos;export
          </Link>
          <Button onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Ajouter une dépense
          </Button>
        </div>
      </div>

      <SummaryCards expenses={expenses} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Dépenses par catégorie" subtitle="Totaux depuis le début">
          <CategoryBreakdownChart expenses={expenses} />
        </Card>
        <Card title="Tendance mensuelle" subtitle="6 derniers mois">
          <MonthlyTrendChart expenses={expenses} />
        </Card>
      </div>

      <Card
        title="Dépenses récentes"
        action={
          <Link href="/expenses" className="text-sm font-medium text-[#2a78d6] hover:underline">
            Tout voir
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            title="Aucune dépense pour le moment"
            description="Commencez le suivi en ajoutant votre première dépense."
            action={<Button onClick={() => setShowAddModal(true)}>Ajouter une dépense</Button>}
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
        <Modal title="Ajouter une dépense" onClose={() => setShowAddModal(false)}>
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
