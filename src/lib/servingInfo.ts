// lib/servingInfo.ts

export type ServingInfo = {
  mode: "count" | "weight";
  unit: string;
  baseAmount: number;
  gramsPerUnit?: number;
};

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
export function formatAmountLabel(grams: number, servingInfo: ServingInfo): string {
  if (servingInfo.mode === "count" && servingInfo.gramsPerUnit) {
    const count = +(grams / servingInfo.gramsPerUnit).toFixed(2);
    return `${count} ${servingInfo.unit} (${Math.round(grams)} g)`;
  }
  return `${grams}${servingInfo.unit}`;
}