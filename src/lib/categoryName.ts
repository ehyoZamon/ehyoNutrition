// lib/categoryName.ts
"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

// "food/eggs and dairy" -> "eggs-and-dairy", "Soups, broth based" -> "soups-broth-based".
// Совпадает со slug из categories.json, поэтому отдельная таблица name -> slug не нужна.
// Для уже русских названий (кириллица) slug пустой — такие строки показываем как есть.
export function categorySlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^food\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Читаемый английский fallback, если перевода нет: "food/eggs and dairy" -> "Eggs and dairy"
function fallbackName(raw: string): string {
  const s = raw.replace(/^food\//i, "").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : raw;
}

/**
 * Возвращает функцию, переводящую название категории из каталога на язык интерфейса.
 * Переводы лежат в messages/*.json, namespace "Categories", ключ — slug категории.
 */
export function useCategoryName() {
  const t = useTranslations("Categories");

  return useCallback(
    (raw: string): string => {
      const slug = categorySlug(raw);
      if (!slug) return raw; // уже локализованное (например, русское) название

      const has = (t as unknown as { has?: (key: string) => boolean }).has;
      if (typeof has === "function" && !has.call(t, slug)) return fallbackName(raw);

      try {
        const value = t(slug);
        return !value || value === slug || value.endsWith(`.${slug}`)
          ? fallbackName(raw)
          : value;
      } catch {
        return fallbackName(raw);
      }
    },
    [t]
  );
}
