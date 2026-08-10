"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Expense, ExpenseInput } from "@/types/expense";
import { generateId, loadExpenses, saveExpenses } from "@/lib/storage";

interface ExpensesContextValue {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setExpenses(loadExpenses());
    } catch {
      setError("Impossible de charger les dépenses enregistrées dans ce navigateur.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((next: Expense[]) => {
    setExpenses(next);
    try {
      saveExpenses(next);
      setError(null);
    } catch {
      setError("Impossible d'enregistrer les modifications — le stockage de votre navigateur est peut-être plein.");
    }
  }, []);

  const addExpense = useCallback(
    (input: ExpenseInput) => {
      const expense: Expense = {
        ...input,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      persist([expense, ...expenses]);
    },
    [expenses, persist]
  );

  const updateExpense = useCallback(
    (id: string, input: ExpenseInput) => {
      persist(expenses.map((e) => (e.id === id ? { ...e, ...input } : e)));
    },
    [expenses, persist]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((e) => e.id !== id));
    },
    [expenses, persist]
  );

  const value = useMemo(
    () => ({ expenses, isLoading, error, addExpense, updateExpense, deleteExpense }),
    [expenses, isLoading, error, addExpense, updateExpense, deleteExpense]
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpensesProvider");
  return ctx;
}
