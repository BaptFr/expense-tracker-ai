import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Expense } from "@/types/expense";

interface ExpenseRowProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export function ExpenseRow({ expense, onEdit, onDelete }: ExpenseRowProps) {
  const meta = CATEGORY_META[expense.category];

  return (
    <div className="flex items-center gap-3 border-b border-[#e1e0d9] px-1 py-3 last:border-b-0 sm:px-2">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{ backgroundColor: meta.bg, color: meta.color }}
        aria-hidden
      >
        {meta.label.slice(0, 1)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#0b0b0b]">{expense.description}</p>
        <p className="mt-0.5 text-xs text-[#898781]">
          {formatDate(expense.date)} · {meta.label}
        </p>
      </div>

      <span className="shrink-0 tabular-nums text-sm font-semibold text-[#0b0b0b]">
        {formatCurrency(expense.amount)}
      </span>

      {(onEdit || onDelete) && (
        <div className="ml-1 flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(expense)}
              aria-label={`Modifier ${expense.description}`}
              className="rounded-md p-1.5 text-[#898781] transition-colors hover:bg-[#f0efec] hover:text-[#2a78d6]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(expense)}
              aria-label={`Supprimer ${expense.description}`}
              className="rounded-md p-1.5 text-[#898781] transition-colors hover:bg-[#fbeceb] hover:text-[#d03b3b]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
