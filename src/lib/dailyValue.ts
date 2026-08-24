// lib/dailyValue.ts

export type DailyValueData = {
  vitaminsOverallPercent: number;
  vitaminPercents: Record<string, number>;
  caloriesPercent: number;
  macrosOverallPercent: number;
  macroPercents: Record<string, number>;
  mineralsOverallPercent: number;
  mineralPercents: Record<string, number>;
};

const VITAMIN_KEYS = ["a", "c", "d", "k", "e", "b1", "b2", "b3", "b5", "b6", "b7", "b9", "b12"];
const MACRO_KEYS = ["fat", "fiber", "protein", "carbs"];
const MINERAL_KEYS = ["sodium", "potassium", "calcium", "iron", "magnesium", "phosphorus", "zinc", "copper"];

type Category = "vitamin" | "macro" | "mineral";

// Карта соответствий slug'ов из productDetails.json -> канонические ключи.
// Если в реальных данных встретятся другие варианты написания — дополнить здесь.
const NUTRIENT_SLUG_MAP: Record<string, { category: Category; key: string }> = {
  "vitamin-a": { category: "vitamin", key: "a" },
  "vitamin-c": { category: "vitamin", key: "c" },
  "vitamin-d": { category: "vitamin", key: "d" },
  "vitamin-k": { category: "vitamin", key: "k" },
  "vitamin-e": { category: "vitamin", key: "e" },
  "vitamin-b1": { category: "vitamin", key: "b1" },
  "thiamin": { category: "vitamin", key: "b1" },
  "vitamin-b2": { category: "vitamin", key: "b2" },
  "riboflavin": { category: "vitamin", key: "b2" },
  "vitamin-b3": { category: "vitamin", key: "b3" },
  "niacin": { category: "vitamin", key: "b3" },
  "vitamin-b5": { category: "vitamin", key: "b5" },
  "pantothenic-acid": { category: "vitamin", key: "b5" },
  "vitamin-b6": { category: "vitamin", key: "b6" },
  "vitamin-b7": { category: "vitamin", key: "b7" },
  "biotin": { category: "vitamin", key: "b7" },
  "vitamin-b9": { category: "vitamin", key: "b9" },
  "folate": { category: "vitamin", key: "b9" },
  "folic-acid": { category: "vitamin", key: "b9" },
  "vitamin-b12": { category: "vitamin", key: "b12" },

  "fats": { category: "macro", key: "fat" },
  "fat": { category: "macro", key: "fat" },
  "fiber": { category: "macro", key: "fiber" },
  "dietary-fiber": { category: "macro", key: "fiber" },
  "protein": { category: "macro", key: "protein" },
  "carbohydrates": { category: "macro", key: "carbs" },
  "carbs": { category: "macro", key: "carbs" },

  "sodium": { category: "mineral", key: "sodium" },
  "potassium": { category: "mineral", key: "potassium" },
  "calcium": { category: "mineral", key: "calcium" },
  "iron": { category: "mineral", key: "iron" },
  "magnesium": { category: "mineral", key: "magnesium" },
  "phosphorus": { category: "mineral", key: "phosphorus" },
  "zinc": { category: "mineral", key: "zinc" },
  "copper": { category: "mineral", key: "copper" },
  "chloride": { category: "mineral", key: "chloride" },
  "manganese": { category: "mineral", key: "manganese" },
  "selenium": { category: "mineral", key: "selenium" },
};

function extractDVPercent(amount: string | undefined): number | null {
  if (!amount) return null;
  const match = amount.match(/([\d.]+)\s*%\s*(?:DV|СН)/i);
  return match ? parseFloat(match[1]) : null;
}

// Базовый вес порции, для которой в JSON указаны %DV, в граммах.
// Для "per 100g" -> 100. Для "per 2 pieces / 100g" -> тоже 100
// (суммарный вес базовой порции, вне зависимости от того, что она в штуках).
function getBaseGrams(macroTitle: string | undefined): number {
  const title = macroTitle || "";

  const match = title.match(/(?:per|на)\s+([\d.]+)\s*(g|г|ml|мл)/i);
  if (match) return parseFloat(match[1]);

  return 100; // фолбэк
}


type DiaryEntryInput = {
  productId: number;
  grams: number;
};

type ProductLike = {
  id: number;
  link: string;
};

export function computeDailyValueData(
  entries: DiaryEntryInput[],
  productMap: Map<number, ProductLike>,
  productDetailsData: Record<string, any>
): DailyValueData {
  const vitaminSums: Record<string, number> = Object.fromEntries(VITAMIN_KEYS.map((k) => [k, 0]));
  const macroSums: Record<string, number> = Object.fromEntries(MACRO_KEYS.map((k) => [k, 0]));
  const mineralSums: Record<string, number> = Object.fromEntries(MINERAL_KEYS.map((k) => [k, 0]));
  let caloriesSum = 0;

  for (const entry of entries) {
    const product = productMap.get(entry.productId);
    if (!product) continue;

    const slug = product.link.substring(product.link.lastIndexOf("/") + 1);
    const detail = productDetailsData[slug];
    if (!detail) continue;

    const baseGrams = getBaseGrams(detail.macroTitle);
    const scale = baseGrams > 0 ? entry.grams / baseGrams : 0;

    const nutrients = [...(detail.macroNutrients || []), ...(detail.microNutrients || [])];

    for (const n of nutrients) {
      const dv = extractDVPercent(n.amount);
      if (dv === null) continue;

      // Калории — особый случай: id === "calories", slug пустой
      if (n.id === "calories") {
        caloriesSum += dv * scale;
        continue;
      }

      const nutrientSlug = n.slug || n.id;
      const mapping = NUTRIENT_SLUG_MAP[nutrientSlug];
      if (!mapping) continue;

      const scaled = dv * scale;
      if (mapping.category === "vitamin") vitaminSums[mapping.key] += scaled;
      else if (mapping.category === "macro") macroSums[mapping.key] += scaled;
      else if (mapping.category === "mineral") mineralSums[mapping.key] += scaled;
    }
  }

  const round = (n: number) => Math.round(n * 10) / 10;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const vitaminPercents = Object.fromEntries(
    VITAMIN_KEYS.map((k) => [k, round(clamp(vitaminSums[k]))])
  );
  const macroPercents = Object.fromEntries(
    MACRO_KEYS.map((k) => [k, round(clamp(macroSums[k]))])
  );
  const mineralPercents = Object.fromEntries(
    MINERAL_KEYS.map((k) => [k, round(clamp(mineralSums[k]))])
  );

  const average = (values: number[]) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  return {
    vitaminsOverallPercent: round(average(Object.values(vitaminPercents))),
    vitaminPercents,
    caloriesPercent: round(clamp(caloriesSum)),
    macrosOverallPercent: round(average(Object.values(macroPercents))),
    macroPercents,
    mineralsOverallPercent: round(average(Object.values(mineralPercents))),
    mineralPercents,
  };
}