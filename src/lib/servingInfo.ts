// lib/servingInfo.ts

export type ServingInfo = {
  mode: "count" | "weight";
  unit: string;
  baseAmount: number;
  gramsPerUnit?: number;
};

// Локализованные подписи единиц. Реальные значения приходят из
// messages/*.json (FoodDiary.gramUnit / mlUnit / pieceUnit) через
// useServingUnitLabels(); DEFAULT_UNIT_LABELS — английский fallback.
export type UnitLabels = {
  g: string;
  ml: string;
  pieces: string;
};

export const DEFAULT_UNIT_LABELS: UnitLabels = {
  g: "g",
  ml: "ml",
  pieces: "pieces",
};

// Приводит любую "сырую" единицу (g / г / ml / мл / pieces / pcs / шт) к
// подписи активного языка. Неизвестные единицы возвращаются как есть.
export function localizeServingUnit(
  unit: string,
  labels: UnitLabels = DEFAULT_UNIT_LABELS
): string {
  const u = unit.trim().toLowerCase().replace(/\.$/, "");
  if (u === "g" || u === "г") return labels.g;
  if (u === "ml" || u === "мл") return labels.ml;
  if (u === "piece" || u === "pieces" || u === "pc" || u === "pcs" || u === "шт") {
    return labels.pieces;
  }
  return unit;
}

// Пытаемся вытащить единицу измерения из macroTitle, например:
// "Macro Nutrients (per 100g)" -> вес, 100 г
// "Macro Nutrients (per 2 pieces / 100g)" -> штуки, 2 шт = 100г (50г/шт)
export function parseServingInfo(macroTitle: string | undefined): ServingInfo {
  const title = macroTitle || "";

  // На случай если в будущем в данные добавят штучные продукты
  const compoundMatch = title.match(
    /(?:per|на)\s+([\d.]+)\s*(pieces?|pcs|шт\.?)\s*[/(]?\s*([\d.]+)\s*(g|г|ml|мл)/i
  );
  if (compoundMatch) {
    const count = parseFloat(compoundMatch[1]);
    const totalGrams = parseFloat(compoundMatch[3]);
    return {
      mode: "count",
      unit: compoundMatch[2].toLowerCase().startsWith("шт") ? "шт" : "pieces",
      baseAmount: count,
      gramsPerUnit: count > 0 ? totalGrams / count : totalGrams,
    };
  }

  const simpleMatch = title.match(/(?:per|на)\s+([\d.]+)\s*(g|г|ml|мл)/i);
  if (simpleMatch) {
    const unitRaw = simpleMatch[2].toLowerCase();
    const isRussian = unitRaw === "г" || unitRaw === "мл";
    const isMl = unitRaw === "ml" || unitRaw === "мл";
    return {
      mode: "weight",
      unit: isMl ? (isRussian ? "мл" : "ml") : (isRussian ? "г" : "g"),
      baseAmount: parseFloat(simpleMatch[1]),
    };
  }

  return { mode: "weight", unit: "g", baseAmount: 100 };
}

// Обратное преобразование: граммы из БД -> человекочитаемая строка
// на языке интерфейса (единицы берутся из `labels`, а не из macroTitle).
export function formatAmountLabel(
  grams: number,
  servingInfo: ServingInfo,
  labels: UnitLabels = DEFAULT_UNIT_LABELS
): string {
  const unit = localizeServingUnit(servingInfo.unit, labels);

  if (servingInfo.mode === "count" && servingInfo.gramsPerUnit) {
    const count = +(grams / servingInfo.gramsPerUnit).toFixed(2);
    return `${count} ${unit} (${Math.round(grams)} ${labels.g})`;
  }
  return `${grams} ${unit}`;
}