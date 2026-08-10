import { Category } from "@/types/expense";

export interface CategoryMeta {
  label: Category;
  /** Categorical palette slot (validated in light + dark, see dataviz skill) */
  color: string;
  /** Soft background tint for badges, derived to stay a light wash of the hue */
  bg: string;
  emoji: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: { label: "Food", color: "#2a78d6", bg: "#eaf2fc", emoji: "🍔" },
  Transportation: { label: "Transportation", color: "#eb6834", bg: "#fdece3", emoji: "🚗" },
  Entertainment: { label: "Entertainment", color: "#1baf7a", bg: "#e5f6ef", emoji: "🎬" },
  Shopping: { label: "Shopping", color: "#eda100", bg: "#fdf1dc", emoji: "🛍️" },
  Bills: { label: "Bills", color: "#e87ba4", bg: "#fceef3", emoji: "💡" },
  Other: { label: "Other", color: "#008300", bg: "#e2f3e2", emoji: "🗂️" },
};

export const CATEGORY_LIST: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];
