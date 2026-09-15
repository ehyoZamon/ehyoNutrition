// lib/dailyValue.ts
//
// Turns "which products + how many grams the user logged today" into the
// percentages DailyValueModule renders.
//
// Old behaviour: productDetails.json carried a pre-computed %DV per
// nutrient, fixed for a generic 2,000-kcal adult — computeDailyValueData
// just summed those percents.
//
// New behaviour: productDetails/<slug>.json instead carries the *absolute*
// amount of each nutrient per 100g (see almonds.json), and the recommended
// amount now comes from vitaminDRI.json, which is personalized by the
// user's age + gender (see lib/nutritionDRI.ts). So this file now:
//   1. loads the product detail for every distinct product logged today,
//   2. sums each nutrient's consumed amount (scaled by grams/100) in mg,
//   3. divides by that nutrient's recommended mg for the user's DRI bracket.
//
// Because step 1 is now an async import per product, this function is async
// — callers (foodDiaryClient.tsx) hold the result in state instead of a
// synchronous useMemo.

import {
  DailyValueModuleProps,
  MACRO_ITEMS,
  MINERAL_ITEMS,
  PercentMap,
  VITAMIN_PRIMARY,
  VITAMIN_SECONDARY,
} from "@/components/daily-value/dailyValueModule";
import {
  ASSUMED_DAILY_CALORIES,
  getRecommendedMg,
  loadVitaminDRI,
  parseAmountToMg,
  resolveDRIContext,
  SimpleUserProfile,
} from "@/lib/nutritionDRI";
import { loadProductDetails, ProductDetail } from "@/lib/productDetail";

export type DiaryEntryInput = { productId: number; grams: number };

// Only the fields computeDailyValueData actually needs from a DiaryProduct.
export type ProductLinkLookup = { link: string };

// Bridges the *short* keys dailyValueModule.tsx renders with (used for CSS/
// i18n, e.g. "carbs") to the canonical slugs shared by vitaminDRI.json and
// productDetails' nutrient ids (e.g. "carbohydrates"). Every other module key
// (vitamin-*, all minerals) is already identical to its slug, so only macros
// need an explicit table.
const MACRO_KEY_TO_SLUG: Record<string, string> = {
  fat: "fats",
  fiber: "fiber",
  protein: "protein",
  carbs: "carbohydrates",
};

function slugForKey(sectionKey: string): string {
  return MACRO_KEY_TO_SLUG[sectionKey] ?? sectionKey;
}

function productSlugFromLink(link: string): string {
  return link.substring(link.lastIndexOf("/") + 1);
}

/** Returns an empty (all-zero) dashboard — used while data is still loading. */
export function emptyDailyValueData(): DailyValueModuleProps {
  return {
    vitaminsOverallPercent: 0,
    vitaminPercents: {},
    caloriesPercent: 0,
    macrosOverallPercent: 0,
    macroPercents: {},
    mineralsOverallPercent: 0,
    mineralPercents: {},
  };
}

export async function computeDailyValueData(
  entries: DiaryEntryInput[],
  productMap: Map<number, ProductLinkLookup>,
  locale: "en" | "ru",
  profile: SimpleUserProfile | null
): Promise<DailyValueModuleProps> {
  if (entries.length === 0) return emptyDailyValueData();

  const ctx = resolveDRIContext(profile);

  const slugByProductId = new Map<number, string>();
  entries.forEach((entry) => {
    const product = productMap.get(entry.productId);
    if (product) slugByProductId.set(entry.productId, productSlugFromLink(product.link));
  });

  const [driData, detailsBySlug] = await Promise.all([
    loadVitaminDRI(),
    loadProductDetails(locale, slugByProductId.values()),
  ]);

  const detailsByProductId = new Map<number, ProductDetail | null>();
  slugByProductId.forEach((slug, productId) => {
    detailsByProductId.set(productId, detailsBySlug.get(slug) ?? null);
  });

  // consumed amount per nutrient id, in mg, across every logged entry today
  const consumedMgById = new Map<string, number>();
  let consumedCalories = 0;

  for (const entry of entries) {
    const detail = detailsByProductId.get(entry.productId);
    if (!detail) continue;

    const factor = entry.grams / 100;

    const caloriesRaw = detail.macroNutrients.find((n) => n.id === "calories")?.amount;
    if (caloriesRaw) {
      const kcal = parseFloat(caloriesRaw.replace(/[^\d.]/g, ""));
      if (!Number.isNaN(kcal)) consumedCalories += kcal * factor;
    }

    for (const nutrient of [...detail.macroNutrients, ...detail.microNutrients]) {
      if (nutrient.id === "calories") continue;
      // `slug` (not `id`, which is a plain numeric row id like 14, 28, ...)
      // is what matches vitaminDRI.json's keys, e.g. "protein", "vitamin-a".
      if (!nutrient.slug) continue;
      const mg = parseAmountToMg(nutrient.amount);
      if (mg === null) continue;
      consumedMgById.set(nutrient.slug, (consumedMgById.get(nutrient.slug) ?? 0) + mg * factor);
    }
  }

  const percentForSlug = (slug: string): number | null => {
    const recommendedMg = getRecommendedMg(driData, slug, ctx, ASSUMED_DAILY_CALORIES);
    if (recommendedMg === null || recommendedMg <= 0) return null;
    const consumedMg = consumedMgById.get(slug) ?? 0;
    return (consumedMg / recommendedMg) * 100;
  };

  // Builds a PercentMap for a section (keyed by dailyValueModule's short
  // "key", e.g. "a" or "carbs") plus its "overall" percent — the average of
  // every item that has a defined DRI. Items with no DRI data render as 0%
  // individually but don't drag the section average down.
  const buildSection = (
    items: readonly { key: string; slug: string }[]
  ): { map: PercentMap; overall: number } => {
    const map: PercentMap = {};
    const defined: number[] = [];

    items.forEach(({ key, slug }) => {
      const pct = percentForSlug(slug);
      map[key] = pct ?? 0;
      if (pct !== null) defined.push(pct);
    });

    const overall = defined.length
      ? defined.reduce((sum, pct) => sum + pct, 0) / defined.length
      : 0;

    return { map, overall };
  };

  const vitaminItems = [...VITAMIN_PRIMARY, ...VITAMIN_SECONDARY].map((v) => ({
    key: v.key,
    slug: `vitamin-${v.key}`,
  }));
  const { map: vitaminPercents, overall: vitaminsOverallPercent } = buildSection(vitaminItems);

  const macroItems = MACRO_ITEMS.map((m) => ({ key: m.key, slug: slugForKey(m.key) }));
  const { map: macroPercents, overall: macrosOverallPercent } = buildSection(macroItems);

  const mineralItems = MINERAL_ITEMS.map((m) => ({ key: m.key, slug: m.key }));
  const { map: mineralPercents, overall: mineralsOverallPercent } = buildSection(mineralItems);

  const caloriesPercent = (consumedCalories / ASSUMED_DAILY_CALORIES) * 100;

  return {
    vitaminsOverallPercent,
    vitaminPercents,
    caloriesPercent,
    macrosOverallPercent,
    macroPercents,
    mineralsOverallPercent,
    mineralPercents,
  };
}
