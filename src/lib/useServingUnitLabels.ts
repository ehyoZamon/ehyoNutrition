// lib/useServingUnitLabels.ts
"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { UnitLabels } from "@/lib/servingInfo";

// Подписи единиц (г / мл / шт) на языке интерфейса. Если ключа ещё нет в
// messages/*.json — откатывается на английский, как tt() в остальных файлах.
export function useServingUnitLabels(): UnitLabels {
  const t = useTranslations("FoodDiary");

  const read = (key: string, fallback: string) => {
    try {
      const value = t(key);
      return !value || value === key || value.endsWith(`.${key}`) ? fallback : value;
    } catch {
      return fallback;
    }
  };

  const g = read("gramUnit", "g");
  const ml = read("mlUnit", "ml");
  const pieces = read("pieceUnit", "pieces");

  return useMemo(() => ({ g, ml, pieces }), [g, ml, pieces]);
}
