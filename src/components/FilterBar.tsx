import { CATEGORY_LIST, CATEGORY_META } from "@/lib/categories";
import { Category } from "@/types/expense";
import { inputClasses } from "@/components/ui/FormField";

export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategories: Set<Category>;
  onToggleCategory: (category: Category) => void;
  onClearCategories: () => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onResetAll: () => void;
  hasActiveFilters: boolean;
}

export function FilterBar({
  search,
  onSearchChange,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  sortBy,
  onSortChange,
  onResetAll,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#898781]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Rechercher dans les descriptions…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${inputClasses} pl-9`}
            aria-label="Rechercher des dépenses par description"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="date-from" className="sr-only">
            Date de début
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className={`${inputClasses} w-[150px]`}
            aria-label="Date de début"
          />
          <span className="text-sm text-[#898781]">à</span>
          <label htmlFor="date-to" className="sr-only">
            Date de fin
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className={`${inputClasses} w-[150px]`}
            aria-label="Date de fin"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className={`${inputClasses} sm:w-[170px]`}
          aria-label="Trier les dépenses"
        >
          <option value="date-desc">Plus récentes</option>
          <option value="date-asc">Plus anciennes</option>
          <option value="amount-desc">Montant : décroissant</option>
          <option value="amount-asc">Montant : croissant</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onClearCategories}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedCategories.size === 0
              ? "bg-[#0b0b0b] text-white"
              : "bg-[#f0efec] text-[#52514e] hover:bg-[#e1e0d9]"
          }`}
        >
          Toutes les catégories
        </button>
        {CATEGORY_LIST.map((category) => {
          const isActive = selectedCategories.has(category);
          const meta = CATEGORY_META[category];
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggleCategory(category)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive ? "" : "bg-[#f0efec] text-[#52514e] hover:bg-[#e1e0d9]"
              }`}
              style={
                isActive
                  ? { backgroundColor: meta.bg, color: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}55` }
                  : undefined
              }
              aria-pressed={isActive}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: meta.color }}
                aria-hidden
              />
              {meta.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className="ml-auto text-xs font-medium text-[#2a78d6] hover:underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
}
