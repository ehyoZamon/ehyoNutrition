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
  OverLimitMap,
  PercentMap,
  VITAMIN_PRIMARY,
  VITAMIN_SECONDARY,
} from "@/components/daily-value/dailyValueModule";
import {
  ASSUMED_DAILY_CALORIES,
  DRIGroupKey,
  formatMgAsUnitOf,
  getRecommendedAmountRaw,
  getRecommendedMg,
  getULAmountRaw,
  getULMg,
  loadVitaminDRI,
  localizeAmountString,
  parseAmountToMg,
  resolveDRIContext,
  SimpleUserProfile,
} from "@/lib/nutritionDRI";
import { loadProductDetails, ProductDetail } from "@/lib/productDetail";
import { parseAmount } from "@/lib/nutrientFormat";

// --- UL mode/note now live directly on vitaminDRI.json ------------------
//
// Not every nutrient's Tolerable Upper Intake Level (UL) means the same
// thing when it's crossed. For some, exceeding the UL is a real risk no
// matter where the nutrient came from ("total" — vitamin A/retinol,
// vitamin D, selenium, copper, manganese, ...). For others, the UL was set
// specifically for synthetic/fortified/supplemental intake
// ("supplement_only" — folate/B9, niacin/B3, vitamin E, calcium, iron,
// magnesium): natural whole-food sources of the same nutrient don't carry
// the same risk, because the body either regulates absorption or the
// toxicity mechanism only applies to the synthetic form.
//
// Rather than a parallel lookup module, each vitaminDRI.json entry that
// needs this carries it inline, next to its own "category"/"title" (see
// e.g. "vitamin-b9" or "calcium") — one nutrient, one file, one source of
// truth. ulNote is a {en, ru} object (it's shown to the user, unlike the
// rest of vitaminDRI.json's fields, which are locale-neutral amounts). A
// slug with no ulMode/ulNote (most of them) simply defaults to "total",
// i.e. today's original, stricter behavior.
//
// IMPORTANT — current limitation: the product catalog today is 100% whole
// foods (no supplement/fortified items, no per-product sourceType field),
// so this does NOT yet filter which grams count toward a "supplement_only"
// nutrient's UL — that requires productDetail entries to carry a
// sourceType, which they don't yet. What it DOES do today is downgrade the
// *severity* of an over-UL flag for "supplement_only" nutrients from a hard
// "danger" warning to a softer "info" one, since a whole-food-only diary
// crossing that UL isn't the medically-risky scenario the limit describes.
//
// TODO(next step, needs data): once productDetail/<slug>.json entries gain
// a sourceType per nutrient row, computeDailyValueData can sum
// "supplement_only" nutrients using only non-whole_food entries before
// comparing to the UL — at that point ulMode becomes load-bearing for the
// number itself, not just for display severity.
type ULMode = "total" | "supplement_only";

function getULMode(driData: unknown, slug: string): ULMode {
  const entry = (driData as Record<string, { ulMode?: string } | undefined>)[slug];
  return entry?.ulMode === "supplement_only" ? "supplement_only" : "total";
}

function getULNote(driData: unknown, slug: string, locale: "en" | "ru"): string | null {
  const entry = (driData as Record<string, { ulNote?: { en?: string; ru?: string } } | undefined>)[
    slug
  ];
  // Falls back EN -> whichever exists, so a note added for only one locale
  // (e.g. mid-translation) still shows something instead of nothing.
  return entry?.ulNote?.[locale] ?? entry?.ulNote?.en ?? entry?.ulNote?.ru ?? null;
}

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

// Development aid: parseAmountToMg now tolerates a non-string `amount`
// (coerces + gives up gracefully) instead of crashing, but the underlying
// productDetails file is still wrong and should get fixed. This logs
// exactly which file + nutrient to go look at, the first time each
// (locale, slug, nutrientSlug) combination is seen — searching the console
// for "[dailyValue:bad-amount]" finds every offender in one pass.
const warnedAmountKeys = new Set<string>();

function warnIfMalformedAmount(
  locale: "en" | "ru",
  slug: string,
  nutrientSlug: string,
  amount: unknown
): void {
  if (typeof amount === "string") return;

  const key = `${locale}:${slug}:${nutrientSlug}`;
  if (warnedAmountKeys.has(key)) return;
  warnedAmountKeys.add(key);

  console.warn(
    `[dailyValue:bad-amount] data/${locale}/productDetails/${slug}.json — ` +
      `nutrient "${nutrientSlug}" has a non-string "amount" (expected e.g. "12 mg"):`,
    amount
  );
}

/** Returns an empty (all-zero) dashboard — used while data is still loading. */
export function emptyDailyValueData(): DailyValueModuleProps {
  return {
    vitaminsOverallPercent: 0,
    vitaminPercents: {},
    vitaminOverLimit: {},
    vitaminOverLimitInfo: {},
    caloriesPercent: 0,
    macrosOverallPercent: 0,
    macroPercents: {},
    macroOverLimit: {},
    macroOverLimitInfo: {},
    mineralsOverallPercent: 0,
    mineralPercents: {},
    mineralOverLimit: {},
    mineralOverLimitInfo: {},
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

    const productSlug = slugByProductId.get(entry.productId) ?? "unknown";
    const factor = entry.grams / 100;

    const caloriesRaw = detail.macroNutrients.find((n) => n.id === "calories")?.amount;
    if (caloriesRaw !== undefined) {
      warnIfMalformedAmount("en", productSlug, "calories", caloriesRaw);
      const kcal = parseFloat(String(caloriesRaw).replace(/[^\d.]/g, ""));
      if (!Number.isNaN(kcal)) consumedCalories += kcal * factor;
    }

    for (const nutrient of [...detail.macroNutrients, ...detail.microNutrients]) {
      if (nutrient.id === "calories") continue;
      // `slug` (not `id`, which is a plain numeric row id like 14, 28, ...)
      // is what matches vitaminDRI.json's keys, e.g. "protein", "vitamin-a".
      if (!nutrient.slug) continue;
      warnIfMalformedAmount("en", productSlug, nutrient.slug, nutrient.amount);
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
  // individually but don't drag the section average down. Also flags, per
  // item, whether today's consumed amount is above that nutrient's upper
  // limit (UL) — independent of the %-of-RDA number, since a nutrient can
  // sit at "281% of RDA" (fine, RDA is just a target) while still being
  // under its UL, or vice versa for a nutrient with a low RDA/UL ratio.
  //
  // Crossing the UL isn't flagged with the same severity for every
  // nutrient: per vitaminDRI.json's per-entry ulMode, some ULs apply to total intake from any
  // source (mode "total" — a real, danger-level flag), while others were
  // set for synthetic/supplemental intake specifically (mode
  // "supplement_only" — folate/B9, niacin/B3, vitamin E, calcium, iron,
  // magnesium). Since the catalog today is whole-food only, a
  // "supplement_only" nutrient crossing its UL isn't the risk scenario the
  // limit describes, so it's routed to the softer `overLimitInfo` map
  // instead of `overLimit`.
  const buildSection = (
    items: readonly { key: string; slug: string }[]
  ): { map: PercentMap; overall: number; overLimit: OverLimitMap; overLimitInfo: OverLimitMap } => {
    const map: PercentMap = {};
    const overLimit: OverLimitMap = {};
    const overLimitInfo: OverLimitMap = {};
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

      const ulMg = getULMg(driData, slug, ctx, ASSUMED_DAILY_CALORIES);
      if (ulMg !== null && ulMg > 0) {
        const consumedMg = consumedMgById.get(slug) ?? 0;
        const isOver = consumedMg > ulMg;
        if (getULMode(driData, slug) === "total") {
          overLimit[key] = isOver;
        } else {
          overLimitInfo[key] = isOver;
        }
      }
    });

    const overall = defined.length
      ? defined.reduce((sum, pct) => sum + pct, 0) / defined.length
      : 0;

    return { map, overall, overLimit, overLimitInfo };
  };

  const vitaminItems = [...VITAMIN_PRIMARY, ...VITAMIN_SECONDARY].map((v) => ({
    key: v.key,
    slug: `vitamin-${v.key}`,
  }));
  const {
    map: vitaminPercents,
    overall: vitaminsOverallPercent,
    overLimit: vitaminOverLimit,
    overLimitInfo: vitaminOverLimitInfo,
  } = buildSection(vitaminItems);

  const macroItems = MACRO_ITEMS.map((m) => ({ key: m.key, slug: slugForKey(m.key) }));
  const {
    map: macroPercents,
    overall: macrosOverallPercent,
    overLimit: macroOverLimit,
    overLimitInfo: macroOverLimitInfo,
  } = buildSection(macroItems);

  const mineralItems = MINERAL_ITEMS.map((m) => ({ key: m.key, slug: m.key }));
  const {
    map: mineralPercents,
    overall: mineralsOverallPercent,
    overLimit: mineralOverLimit,
    overLimitInfo: mineralOverLimitInfo,
  } = buildSection(mineralItems);

  const caloriesPercent = (consumedCalories / ASSUMED_DAILY_CALORIES) * 100;

  return {
    vitaminsOverallPercent,
    vitaminPercents,
    vitaminOverLimit,
    vitaminOverLimitInfo,
    caloriesPercent,
    macrosOverallPercent,
    macroPercents,
    macroOverLimit,
    macroOverLimitInfo,
    mineralsOverallPercent,
    mineralPercents,
    mineralOverLimit,
    mineralOverLimitInfo,
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
  // The upper limit (UL) for this nutrient/DRI context, localized the same
  // way as recommendedLabel. Null when vitaminDRI.json has no UL for this
  // row ("-") or no entry at all.
  ulLabel: string | null;
  // Today's total intake of this nutrient as a % of its UL (e.g. 133 means
  // 33% over the safe upper limit). Null when there's no UL to compare
  // against. Distinct from `overallPercent`, which is % of the RDA/AI
  // target, not the UL — a nutrient can be well past 100% of its RDA
  // while still being under its UL.
  ulPercent: number | null;
  // Today's total intake of this nutrient, localized and in the same unit
  // as ulLabel (e.g. "5 mg" next to a "3 mg" limit) — so a warning can say
  // "limit 3 mg, consumed 5 mg" without mixing units. Null when there's no
  // UL to express it against, or nothing consumed yet.
  consumedLabel: string | null;
  // True once today's intake has actually crossed the UL — the signal the
  // UI uses to show the overdose warning. Kept for backwards compatibility;
  // prefer `ulSeverity` for deciding how loud that warning should be.
  isOverLimit: boolean;
  // Whether this nutrient's UL applies to total intake from any source
  // ("total") or was set specifically for synthetic/supplemental/fortified
  // intake ("supplement_only") — see vitaminDRI.json's per-entry ulMode/ulNote fields. Always "total" when
  // there's no UL to speak of (ulLabel is null).
  ulMode: "total" | "supplement_only";
  // "none" — not over the UL. "danger" — over the UL and it's a real,
  // total-intake risk (ulMode "total"). "info" — over the UL, but only from
  // whole-food sources of a nutrient whose UL was written for supplements
  // (ulMode "supplement_only"); worth a note, not an alarm.
  ulSeverity: "none" | "info" | "danger";
  // Short, user-facing explanation of the nuance above — null when there's
  // no UL or no rule configured for this nutrient. Meant for a tooltip/line
  // under the UL warning in the detail sheet.
  ulNote: string | null;
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
  const ulRaw = getULAmountRaw(driData, nutrientSlug, ctx);
  const ulLabel = ulRaw ? localizeAmountString(ulRaw, locale) : null;

  const ulMode = getULMode(driData, nutrientSlug);
  const ulNote = ulLabel ? getULNote(driData, nutrientSlug, locale) : null;

  if (entries.length === 0) {
    return {
      overallPercent: 0,
      rows: [],
      recommendedLabel,
      ulLabel,
      ulPercent: null,
      consumedLabel: null,
      isOverLimit: false,
      ulMode,
      ulSeverity: "none",
      ulNote,
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
  const ulMg = getULMg(driData, nutrientSlug, ctx, ASSUMED_DAILY_CALORIES);

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

    warnIfMalformedAmount("en", slug, nutrientSlug, nutrient.amount);
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

    let amountLabel = "";
    try {
      warnIfMalformedAmount(locale, slug, nutrientSlug, localizedNutrient.amount);
      amountLabel = scaleAmountString(parseAmount(localizedNutrient.amount).value, factor);
    } catch (err) {
      console.warn(`computeNutrientBreakdown: bad display amount for "${product.name}"`, err);
    }

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

  const ulPercent = ulMg && ulMg > 0 ? (totalMg / ulMg) * 100 : null;
  const isOverLimit = ulPercent !== null && totalMg > (ulMg as number);
  // See the ulMode comment near getULMode() above: "total"-mode nutrients over
  // their UL are a real (any-source) risk — "danger". "supplement_only"
  // nutrients over their UL, sourced only from whole foods (today's only
  // catalog contents), aren't the risk the limit was written for — "info".
  const ulSeverity: "none" | "info" | "danger" = !isOverLimit
    ? "none"
    : ulMode === "total"
      ? "danger"
      : "info";
  // Expressed in the same unit as ulLabel (not always mg) so the two read
  // naturally together, e.g. "limit 3 mg, consumed 5 mg" instead of mixing
  // whatever unit vitaminDRI.json happens to store the limit in.
  const consumedLabel =
    ulRaw && totalMg > 0 ? localizeAmountString(formatMgAsUnitOf(totalMg, ulRaw), locale) : null;

  return {
    overallPercent,
    rows,
    recommendedLabel,
    ulLabel,
    ulPercent,
    consumedLabel,
    isOverLimit,
    ulMode,
    ulSeverity,
    ulNote,
    driGroup: ctx.group,
    driAgeLabel: ctx.ageLabel,
  };
}

/* ============================================================
   Top products for a nutrient — powers the "Foods rich in this
   nutrient" section of NutrientDetailSheet. Unlike
   computeNutrientBreakdown (which only looks at what the user
   logged today), this ranks the *entire* product catalog by how
   much of the nutrient each one carries per 100g, independent of
   the diary.
   ============================================================ */

// The minimal shape of a catalog product (as productsRu/productsEn already
// hand it to foodDiaryClient's `productMap`) that this needs: enough to
// resolve a slug (via `link`) and to display a result row.
export type ProductCatalogEntry = ProductDisplayLookup & { id: number };

export type TopProductForNutrient = {
  productId: number;
  name: string;
  image: string;
  link: string;
  amountLabel: string; // localized amount per 100g, e.g. "12 mg"
};

// Ranking the whole catalog means loading every product's detail file, which
// is wasted work to redo on every click of the same ring — cached per
// (locale, nutrient slug) for the life of the page. The catalog itself
// (`allProducts`) is static per locale, so it's never part of the cache key.
const topProductsCache = new Map<string, Promise<TopProductForNutrient[]>>();

export async function getTopProductsForNutrient(
  nutrientSlug: string,
  allProducts: ProductCatalogEntry[],
  locale: "en" | "ru",
  limit: number = 10
): Promise<TopProductForNutrient[]> {
  const cacheKey = `${locale}:${nutrientSlug}`;
  const cached = topProductsCache.get(cacheKey);
  if (cached) return cached;

  const promise = computeTopProductsForNutrient(nutrientSlug, allProducts, locale, limit).catch(
    (err) => {
      // A transient/partial failure (one bad file, a network blip) should
      // be retried on the next click, not remembered as "this nutrient has
      // no top products" for the rest of the session.
      topProductsCache.delete(cacheKey);
      throw err;
    }
  );

  topProductsCache.set(cacheKey, promise);
  return promise;
}

async function computeTopProductsForNutrient(
  nutrientSlug: string,
  allProducts: ProductCatalogEntry[],
  locale: "en" | "ru",
  limit: number
): Promise<TopProductForNutrient[]> {
  if (allProducts.length === 0) return [];

  const slugs = allProducts.map((p) => productSlugFromLink(p.link));

  // Same split as everywhere else in this file: ranking math always runs
  // on the EN files (stable units), the locale's own files are only
  // consulted for the display string.
  const [enDetails, localizedDetails] = await Promise.all([
    loadProductDetails("en", slugs),
    loadProductDetails(locale, slugs),
  ]);

  const scored: { product: ProductCatalogEntry; slug: string; mgPer100: number }[] = [];

  for (const product of allProducts) {
    try {
      const slug = productSlugFromLink(product.link);
      const enDetail = enDetails.get(slug);
      if (!enDetail) continue;

      const nutrient = [...enDetail.macroNutrients, ...enDetail.microNutrients].find(
        (n) => n.slug === nutrientSlug
      );
      if (!nutrient) continue;

      warnIfMalformedAmount("en", slug, nutrientSlug, nutrient.amount);
      const mgPer100 = parseAmountToMg(nutrient.amount);
      if (mgPer100 === null || mgPer100 <= 0) continue;

      scored.push({ product, slug, mgPer100 });
    } catch (err) {
      // One product with unexpectedly-shaped data (e.g. a malformed
      // `amount` field) shouldn't wipe out the ranking for every other
      // product — skip it and keep going.
      console.warn(`getTopProductsForNutrient: skipping "${product.name}"`, err);
    }
  }

  scored.sort((a, b) => b.mgPer100 - a.mgPer100);

  return scored.slice(0, limit).map(({ product, slug }) => {
    const localizedDetail = localizedDetails.get(slug);
    const localizedNutrient = localizedDetail
      ? [...localizedDetail.macroNutrients, ...localizedDetail.microNutrients].find(
          (n) => n.slug === nutrientSlug
        )
      : undefined;

    let amountLabel = "";
    try {
      if (localizedNutrient) {
        warnIfMalformedAmount(locale, slug, nutrientSlug, localizedNutrient.amount);
        amountLabel = parseAmount(localizedNutrient.amount).value;
      }
    } catch (err) {
      console.warn(`getTopProductsForNutrient: bad display amount for "${product.name}"`, err);
    }

    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      link: product.link,
      amountLabel,
    };
  });
}