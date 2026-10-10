export type FavoriteCategory = "fruits" | "vegetables" | "snack";

export const FAVORITE_CATEGORY_FILTERS: Record<
  FavoriteCategory,
  { en: string[]; ru: string[] }
> = {
  fruits: {
    en: ["food/fruits"],
    ru: ["Фрукты и ягоды"],
  },
  vegetables: {
    en: ["food/vegetables"],
    ru: ["Овощи"],
  },
  snack: {
    en: [
      "food/seeds and nuts",
      "food/nuts and seeds",
      "food/grains and cereals",
      "food/legumes",
      "food/eggs and dairy",
    ],
    ru: ["Семена и орехи", "Зерновые", "Бобовые", "Яйца и молочные продукты"],
  },
};

export function isFavoriteCategory(
  value: string | null
): value is FavoriteCategory {
  return value === "fruits" || value === "vegetables" || value === "snack";
}