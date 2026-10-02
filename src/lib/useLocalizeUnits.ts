// lib/useLocalizeUnits.ts
"use client";

import { useTranslations } from "next-intl";

// Те же единицы и те же ключи (Products.units.<unit>), что уже использует
// ProductDetailSheet. \b-границы: "g" не заденет "g" внутри "mg"/"kg".
const UNIT_KEYS = ["mg", "mcg", "kg", "g", "kcal"] as const;

/**
 * Возвращает функцию, которая заменяет английские единицы в строке
 * ("0.2 mg", "cup (240 g)") на переводы из messages: Products.units.*.
 * Нет перевода для единицы — она остаётся как есть.
 */
export function useLocalizeUnits() {
  const t = useTranslations("Products");

  return (raw: string): string => {
    let result = raw;
    for (const unit of UNIT_KEYS) {
      const key = `units.${unit}`;
      const translated = t.has(key) ? t(key) : unit;
      result = result.replace(new RegExp(`\\b${unit}\\b`, "g"), () => translated);
    }
    return result;
  };
}
