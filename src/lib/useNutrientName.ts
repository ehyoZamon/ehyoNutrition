// lib/useNutrientName.ts
"use client";

import { useTranslations } from "next-intl";

type NutrientLike = { id: string | number; slug?: string; name: string };

/**
 * Возвращает функцию, которая переводит название нутриента через
 * messages/<locale>.json, пространство имён "Nutrients", ключ = slug
 * ("vitamin-a", "protein", "calcium"...). У строки калорий slug пустой,
 * поэтому для неё ключом служит id ("calories").
 *
 * Если перевода в messages нет — показываем исходное (английское) name из
 * productDetails, так что приложение не ломается, пока вы дописываете ключи.
 */
export function useNutrientName() {
  const t = useTranslations("Nutrients");

  return (nutrient: NutrientLike): string => {
    const key = nutrient.slug || String(nutrient.id);
    return t.has(key) ? t(key) : nutrient.name;
  };
}
