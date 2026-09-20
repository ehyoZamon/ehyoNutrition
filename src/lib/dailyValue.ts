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
  DRIGroupKey,
  getRecommendedAmountRaw,
  getRecommendedMg,
  loadVitaminDRI,
  localizeAmountString,
  parseAmountToMg,
  resolveDRIContext,
  SimpleUserProfile,
} from "@/lib/nutritionDRI";
import { loadProductDetails, ProductDetail } from "@/lib/productDetail";
import { parseAmount } from "@/lib/nutrientFormat";

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
  profile: SimpleUserProfile | null
): Promise<DailyValueModuleProps> {
  if (entries.length === 0) return emptyDailyValueData();

  const ctx = resolveDRIContext(profile);

  const slugByProductId = new Map<number, string>();
  entries.forEach((entry) => {
    const product = productMap.get(entry.productId);
    if (product) slugByProductId.set(entry.productId, productSlugFromLink(product.link));
  });

  // Nutrient math is always done against the EN productDetails files.
  // The RU files translate everything for display — including, in some of
  // them, the unit strings themselves ("г"/"мг"/"мкг"/"ккал" instead of
  // "g"/"mg"/"mcg"/"kcal") — and parseAmountToMg only recognizes Latin unit
  // letters. Rather than teach the parser every language's units (fragile,
  // and would need to grow with every new locale), we compute strictly from
  // the one locale that's guaranteed stable and only localize what's shown
  // to the user, not what's calculated.
  const [driData, detailsBySlug] = await Promise.all([
    loadVitaminDRI(),
    loadProductDetails("en", slugByProductId.values()),
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
      // The per-item map keeps the *raw* percent (so a ring can honestly
      // show "281%" for something like vitamin A in liver), but the section
      // "overall" is an average of each item capped at 100 — one nutrient
      // wildly exceeding its target shouldn't inflate the whole section
      // above 100%. Overall reaches 100% only once every tracked nutrient
      // in the section has individually reached its own 100%.
      map[key] = pct ?? 0;
      if (pct !== null) defined.push(Math.min(pct, 100));
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

/* ============================================================
   Per-nutrient breakdown by product — powers the sheet opened by
   tapping a ring/bar in DailyValueModule ("which foods gave me
   this %").
   ============================================================ */

// Same shape computeDailyValueData/computeNutrientBreakdown need to resolve
// a product's slug from its link, plus the two extra display fields
// (name, image) the breakdown list renders. DiaryProduct already satisfies
// this shape structurally — no explicit cast needed at call sites.
export type ProductDisplayLookup = ProductLinkLookup & { name: string; image: string };

export type NutrientBreakdownRow = {
  productId: number;
  name: string;
  image: string;
  amountLabel: string; // localized, scaled amount string, e.g. "2 g"
  grams: number;
  percent: number; // % of this nutrient's personal DRI contributed by this entry
};

export type NutrientBreakdownResult = {
  overallPercent: number;
  rows: NutrientBreakdownRow[];
  // The user's personal daily norm for this nutrient, already localized for
  // display (e.g. "900 mcg", "900 мкг"). Null when vitaminDRI.json has no
  // entry for this slug/DRI-context combination.
  recommendedLabel: string | null;
  // Which DRI row recommendedLabel came from — lets the UI say *why* this
  // is the number (e.g. "Adults (19-30 years)", "Female").
  driGroup: DRIGroupKey;
  driAgeLabel: string;
};

// Inverse of what buildSection() does above — maps a (section, key) pair
// from DailyValueModule (e.g. "vitamin"+"a", "macro"+"carbs", "mineral"+
// "sodium") back to the canonical slug used by vitaminDRI.json /
// productDetails. Exported so foodDiaryClient can resolve which nutrient to
// break down when a ring/bar is clicked.
export function slugForNutrientKey(
  section: "vitamin" | "macro" | "mineral",
  key: string
): string {
  if (section === "vitamin") return `vitamin-${key}`;
  if (section === "macro") return slugForKey(key);
  return key;
}

// Scales a per-100g amount string (e.g. "8 mg", "1.2g") by `factor` and
// keeps the original unit. Mirrors the identical helper in
// components/food-diary/quantitySheet.tsx (kept local here too, rather than
// pulled into a shared module, to avoid a cross-cutting refactor of that
// component while adding this feature).
function scaleAmountString(value: string, factor: number): string {
  const match = value.trim().match(/^(-?[\d.]+)\s*(.*)$/);
  if (!match) return value;

  const num = parseFloat(match[1]);
  if (Number.isNaN(num)) return value;

  const unit = match[2].trim();
  const scaled = num * factor;
  const rounded = Math.round(scaled * 10) / 10;
  const numStr = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);

  return unit ? `${numStr} ${unit}` : numStr;
}

/**
 * For one nutrient slug (e.g. "vitamin-a", "sodium", "carbohydrates"),
 * breaks down every diary entry's contribution to that nutrient today: how
 * much of it each logged product supplied, and what % of the user's
 * personal DRI that amount represents.
 *
 * Math (mg consumed, %DV) is computed from the EN productDetails files —
 * same reasoning as computeDailyValueData. Display amounts are re-read from
 * the locale's own file purely for the localized unit string, then scaled
 * by the same grams/100 factor.
 */
export async function computeNutrientBreakdown(
  nutrientSlug: string,
  entries: DiaryEntryInput[],
  productMap: Map<number, ProductDisplayLookup>,
  profile: SimpleUserProfile | null,
  locale: "en" | "ru"
): Promise<NutrientBreakdownResult> {
  const ctx = resolveDRIContext(profile);

  // Loaded (and the personal daily norm resolved) unconditionally, even
  // with zero entries today — the user's daily norm doesn't depend on
  // whether they've logged anything yet, so the sheet can show "your norm
  // is X" alongside "no foods logged yet contribute to this nutrient".
  const driData = await loadVitaminDRI();
  const recommendedRaw = getRecommendedAmountRaw(driData, nutrientSlug, ctx);
  const recommendedLabel = recommendedRaw ? localizeAmountString(recommendedRaw, locale) : null;

  if (entries.length === 0) {
    return {
      overallPercent: 0,
      rows: [],
      recommendedLabel,
      driGroup: ctx.group,
      driAgeLabel: ctx.ageLabel,
    };
  }

  const slugByProductId = new Map<number, string>();
  entries.forEach((entry) => {
    const product = productMap.get(entry.productId);
    if (product) slugByProductId.set(entry.productId, productSlugFromLink(product.link));
  });

  const [enDetails, localizedDetails] = await Promise.all([
    loadProductDetails("en", slugByProductId.values()),
    loadProductDetails(locale, slugByProductId.values()),
  ]);

  const recommendedMg = getRecommendedMg(driData, nutrientSlug, ctx, ASSUMED_DAILY_CALORIES);

  let totalMg = 0;
  const rows: NutrientBreakdownRow[] = [];

  for (const entry of entries) {
    const product = productMap.get(entry.productId);
    const slug = slugByProductId.get(entry.productId);
    if (!product || !slug) continue;

    const enDetail = enDetails.get(slug);
    if (!enDetail) continue;

    const nutrient = [...enDetail.macroNutrients, ...enDetail.microNutrients].find(
      (n) => n.slug === nutrientSlug
    );
    if (!nutrient) continue;

    const mgPer100 = parseAmountToMg(nutrient.amount);
    if (mgPer100 === null) continue;

    const factor = entry.grams / 100;
    const consumedMg = mgPer100 * factor;
    if (consumedMg <= 0) continue;

    totalMg += consumedMg;
    const percent = recommendedMg && recommendedMg > 0 ? (consumedMg / recommendedMg) * 100 : 0;

    const localizedDetail = localizedDetails.get(slug) ?? enDetail;
    const localizedNutrient =
      [...localizedDetail.macroNutrients, ...localizedDetail.microNutrients].find(
        (n) => n.slug === nutrientSlug
      ) ?? nutrient;
    const amountLabel = scaleAmountString(parseAmount(localizedNutrient.amount).value, factor);

    rows.push({
      productId: entry.productId,
      name: product.name,
      image: product.image,
      amountLabel,
      grams: entry.grams,
      percent: Math.round(percent),
    });
  }

  // Biggest contributor first — matches how the "which foods gave me this
  // %" sheet is meant to be read.
  rows.sort((a, b) => b.percent - a.percent);

  const overallPercent =
    recommendedMg && recommendedMg > 0 ? Math.min(100, (totalMg / recommendedMg) * 100) : 0;

  return {
    overallPercent,
    rows,
    recommendedLabel,
    driGroup: ctx.group,
    driAgeLabel: ctx.ageLabel,
  };
}