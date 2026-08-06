"use client";

import { FormEvent, useState } from "react";
import { CATEGORY_LIST } from "@/lib/categories";
import { todayIso } from "@/lib/utils";
import { Category, Expense, ExpenseFormErrors, ExpenseInput } from "@/types/expense";
import { Button } from "@/components/ui/Button";
import { FormField, inputClasses } from "@/components/ui/FormField";

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSubmit: (input: ExpenseInput) => void;
  onCancel: () => void;
}

function validate(input: ExpenseInput): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  if (!input.date) {
    errors.date = "Date is required.";
  } else if (input.date > todayIso()) {
    errors.date = "Date can't be in the future.";
  }

  if (Number.isNaN(input.amount) || input.amount <= 0) {
    errors.amount = "Enter an amount greater than $0.";
  } else if (input.amount > 1_000_000) {
    errors.amount = "That amount looks too large — double check it.";
  }

  if (!input.category) {
    errors.category = "Choose a category.";
  }

  if (!input.description.trim()) {
    errors.description = "Add a short description.";
  } else if (input.description.trim().length > 120) {
    errors.description = "Keep the description under 120 characters.";
  }

  return errors;
}

export function ExpenseForm({ initialExpense, onSubmit, onCancel }: ExpenseFormProps) {
  const [date, setDate] = useState(initialExpense?.date ?? todayIso());
  const [amount, setAmount] = useState(initialExpense?.amount?.toString() ?? "");
  const [category, setCategory] = useState<Category | "">(initialExpense?.category ?? "");
  const [description, setDescription] = useState(initialExpense?.description ?? "");
  const [errors, setErrors] = useState<ExpenseFormErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const input: ExpenseInput = {
      date,
      amount: parseFloat(amount),
      category: (category || "Other") as Category,
      description: description.trim(),
    };

    const validationErrors = validate(input);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(input);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Date" htmlFor="expense-date" error={errors.date}>
        <input
          id="expense-date"
          type="date"
          value={date}
          max={todayIso()}
          onChange={(e) => setDate(e.target.value)}
          aria-invalid={Boolean(errors.date)}
          className={inputClasses}
        />
      </FormField>

      <FormField label="Amount" htmlFor="expense-amount" error={errors.amount}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#898781]">
            $
          </span>
          <input
            id="expense-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={Boolean(errors.amount)}
            className={`${inputClasses} pl-6`}
          />
        </div>
      </FormField>

      <FormField label="Category" htmlFor="expense-category" error={errors.category}>
        <select
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          aria-invalid={Boolean(errors.category)}
          className={inputClasses}
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORY_LIST.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Description" htmlFor="expense-description" error={errors.description}>
        <input
          id="expense-description"
          type="text"
          placeholder="e.g. Groceries at Whole Foods"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={Boolean(errors.description)}
          className={inputClasses}
          maxLength={120}
        />
      </FormField>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialExpense ? "Save changes" : "Add expense"}
        </Button>
      </div>
    </form>
  );
}
