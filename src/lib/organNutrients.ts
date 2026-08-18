import { OrganKey } from "@/data/organs";

// Вес важности нутриента для органа: 1 — небольшой вклад, 3 — ключевой нутриент.
// Ключи — это те же slug'и, что и в productDetails.json (n.slug).
// Список можно расширять по мере появления новых нутриентов в данных.
export const ORGAN_NUTRIENT_WEIGHTS: Record<OrganKey, Record<string, number>> = {
  eyes: {
    "vitamin-a": 3,
    "beta-carotene": 3,
    lutein: 3,
    zeaxanthin: 3,
    "vitamin-c": 1,
    "vitamin-e": 2,
    zinc: 2,
    "alpha-linolenic-acid": 1,
    "vitamin-b2": 1,
    selenium: 1,
  },
  brain: {
    "alpha-linolenic-acid": 3,
    dha: 3,
    epa: 2,
    "vitamin-b6": 2,
    "vitamin-b9": 2,
    "vitamin-b12": 2,
    choline: 3,
    magnesium: 2,
    zinc: 1,
    iron: 1,
    "vitamin-e": 1,
    iodine: 2,
    "vitamin-d": 1,
  },
  heart: {
    "alpha-linolenic-acid": 3,
    potassium: 2,
    magnesium: 2,
    fiber: 2,
    "vitamin-b6": 1,
    "vitamin-b9": 1,
    "vitamin-e": 1,
    quercetin: 2,
    coq10: 2,
    arginine: 2,
    "vitamin-b3": 1,
  },
  blood: {
    iron: 3,
    "vitamin-b12": 3,
    "vitamin-b9": 3,
    "vitamin-c": 1,
    copper: 2,
    "vitamin-k": 2,
    "vitamin-b6": 1,
  },
  bones: {
    calcium: 3,
    "vitamin-d": 3,
    "vitamin-k": 2,
    magnesium: 2,
    phosphorus: 2,
    manganese: 1,
    zinc: 1,
    protein: 1,
  },
  joints: {
    "alpha-linolenic-acid": 2,
    "vitamin-c": 2,
    manganese: 2,
    copper: 2,
    collagen: 3,
    glucosamine: 3,
    chondroitin: 3,
    "vitamin-d": 1,
    sulfur: 1,
  },
  muscles: {
    protein: 3,
    leucine: 3,
    valine: 2,
    isoleucine: 2,
    potassium: 2,
    magnesium: 2,
    "vitamin-d": 1,
    iron: 1,
    arginine: 1,
  },
  skin: {
    "vitamin-c": 3,
    "vitamin-e": 2,
    "vitamin-a": 2,
    zinc: 2,
    biotin: 2,
    collagen: 3,
    "alpha-linolenic-acid": 1,
    copper: 1,
    selenium: 1,
  },
  immune: {
    "vitamin-c": 3,
    "vitamin-d": 3,
    zinc: 3,
    selenium: 2,
    "vitamin-a": 2,
    "vitamin-b6": 1,
    iron: 1,
    protein: 1,
    quercetin: 1,
  },
  digestion: {
    fiber: 3,
    probiotics: 3,
    inulin: 2,
    magnesium: 1,
    zinc: 1,
    "vitamin-b1": 1,
  },
  liver: {
    choline: 3,
    "vitamin-e": 2,
    selenium: 2,
    "vitamin-c": 1,
    taurine: 2,
    sulfur: 1,
    "vitamin-b12": 1,
    "vitamin-b9": 1,
  },
  thyroid: {
    iodine: 3,
    selenium: 3,
    zinc: 2,
    iron: 1,
    tyrosine: 2,
    "vitamin-d": 1,
  },
  metabolism: {
    "vitamin-b1": 2,
    "vitamin-b2": 2,
    "vitamin-b3": 2,
    "vitamin-b5": 1,
    "vitamin-b6": 2,
    "vitamin-b12": 2,
    iodine: 2,
    chromium: 2,
    magnesium: 1,
    iron: 1,
    protein: 1,
  },
};

// Достаёт число перед "%" из строки вида "3.4 мг / 148% СН"
export const extractPercent = (amount: string): number => {
  const match = amount.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!match) return 0;
  return parseFloat(match[1].replace(",", "."));
};

// Вклад нутриента в очки органа. Если % СН не указан (как у quercetin: "15 мг"),
// даём небольшой фиксированный бонус — сам факт наличия нутриента тоже что-то значит.
const nutrientContribution = (amount: string, weight: number): number => {
  const percent = extractPercent(amount);
  if (percent > 0) return percent * weight;
  return 4 * weight;
};

export interface NutrientMapEntry {
  name: string;
  amount: string;
  numericAmount: number;
}

export const scoreProductForOrgan = (
  nutrientsMap: Record<string, NutrientMapEntry>,
  organKey: OrganKey
): { score: number; topNutrient: { name: string; amount: string } | null } => {
  const weights = ORGAN_NUTRIENT_WEIGHTS[organKey];
  let score = 0;
  let topNutrient: { name: string; amount: string } | null = null;
  let topContribution = 0;

  for (const slug in weights) {
    const nutrient = nutrientsMap[slug];
    if (!nutrient) continue;

    const contribution = nutrientContribution(nutrient.amount, weights[slug]);
    if (contribution <= 0) continue;

    score += contribution;
    if (contribution > topContribution) {
      topContribution = contribution;
      topNutrient = { name: nutrient.name, amount: nutrient.amount };
    }
  }

  return { score, topNutrient };
};