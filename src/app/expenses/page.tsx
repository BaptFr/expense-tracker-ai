"use client";

import { useMemo, useState } from "react";
import { useExpenses } from "@/context/ExpensesContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseRow } from "@/components/ExpenseRow";
import { FilterBar, SortOption } from "@/components/FilterBar";
import { exportExpensesToCsv, formatCurrency } from "@/lib/utils";
import { Category, Expense, ExpenseInput } from "@/types/expense";

export default function ExpensesPage() {
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  function toggleCategory(category: Category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const hasActiveFilters =
    search.trim() !== "" || selectedCategories.size > 0 || dateFrom !== "" || dateTo !== "";

  function resetAll() {
    setSearch("");
    setSelectedCategories(new Set());
    setDateFrom("");
    setDateTo("");
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = expenses.filter((e) => {
      if (term && !e.description.toLowerCase().includes(term)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(e.category)) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });

    result = result.slice().sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "date-desc":
        default:
          return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      }
    });

    return result;
  }, [expenses, search, selectedCategories, dateFrom, dateTo, sortBy]);

  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  function handleAdd(input: ExpenseInput) {
    addExpense(input);
    setShowAddModal(false);
    showToast("Dépense ajoutée.");
  }

  function handleUpdate(input: ExpenseInput) {
    if (!editingExpense) return;
    updateExpense(editingExpense.id, input);
    setEditingExpense(null);
    showToast("Dépense mise à jour.");
  }

  function handleDelete() {
    if (!deletingExpense) return;
    deleteExpense(deletingExpense.id);
    setDeletingExpense(null);
    showToast("Dépense supprimée.", "info");
  }

  function handleExport() {
    if (filtered.length === 0) {
      showToast("Aucune dépense à exporter.", "error");
      return;
    }
    exportExpensesToCsv(filtered);
    showToast(`${filtered.length} dépense${filtered.length === 1 ? "" : "s"} exportée${filtered.length === 1 ? "" : "s"} en CSV.`);
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#0b0b0b]">Dépenses</h1>
          <p className="mt-0.5 text-sm text-[#52514e]">
            {expenses.length} dépense{expenses.length === 1 ? "" : "s"} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exporter en CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Ajouter une dépense
          </Button>
        </div>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onClearCategories={() => setSelectedCategories(new Set())}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetAll={resetAll}
        hasActiveFilters={hasActiveFilters}
      />

      <Card
        title={`${filtered.length} résultat${filtered.length === 1 ? "" : "s"}`}
        subtitle={filtered.length > 0 ? `Total : ${formatCurrency(filteredTotal)}` : undefined}
      >
        {filtered.length === 0 ? (
          expenses.length === 0 ? (
            <EmptyState
              title="Aucune dépense pour le moment"
              description="Commencez le suivi en ajoutant votre première dépense."
              action={<Button onClick={() => setShowAddModal(true)}>Ajouter une dépense</Button>}
            />
          ) : (
            <EmptyState
              title="Aucun résultat"
              description="Aucune dépense ne correspond à vos filtres actuels. Essayez de les ajuster ou de les réinitialiser."
              action={
                <Button variant="secondary" onClick={resetAll}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          )
        ) : (
          <div>
            {filtered.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onEdit={setEditingExpense}
                onDelete={setDeletingExpense}
              />
            ))}
          </div>
        )}
      </Card>

      {showAddModal && (
        <Modal title="Ajouter une dépense" onClose={() => setShowAddModal(false)}>
          <ExpenseForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
        </Modal>
      )}

      {editingExpense && (
        <Modal title="Modifier la dépense" onClose={() => setEditingExpense(null)}>
          <ExpenseForm
            initialExpense={editingExpense}
            onSubmit={handleUpdate}
            onCancel={() => setEditingExpense(null)}
          />
        </Modal>
      )}

      {deletingExpense && (
        <ConfirmDialog
          title="Supprimer la dépense ?"
          message={`Cette action supprimera définitivement « ${deletingExpense.description} » (${formatCurrency(deletingExpense.amount)}). C'est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingExpense(null)}
        />
      )}
    </div>
  );
}
