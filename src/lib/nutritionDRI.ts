// lib/nutritionDRI.ts
//
// Everything needed to turn "who is the user" + "how much of a nutrient did
// they eat" into a %DRI number:
//   1. resolveDRIContext()  — birthDate + gender -> which DRI group/age row
//      of vitaminDRI.json applies to this person.
//   2. parseAmountToMg()    — turns any amount string found in vitaminDRI.json
//      or a product's macro/microNutrients array ("0.90 mg", "1,000 mg",
//      "44 mcg DFE", "20-35% of calories", "—") into a single comparable
//      number of milligrams.
//   3. getRecommendedMg()/getULMg() — look up + parse the recommended amount
//      (RDA/AI/AMDR) and the upper limit (UL) for a given nutrient slug and
//      DRI context.
//   4. loadVitaminDRI()     — the same lazy, cached dynamic import pattern
//      VitaminDetailSheet.tsx already uses for this file.

export type DRIGroupKey = "Children" | "Male" | "Female";

// vitaminDRI.json now stores each age row as an object of up to these keys
// instead of a single string — e.g. { "EAR": "0.625 mg", "RDA": "0.90 mg",
// "UL": "3.00 mg" }, or { "AI": "31 g", "UL": "-" }, or { "AMDR": "25-35%
// of calories", "UL": "-" }. A missing/"-" value means "no data for this
// row", same as the old single-string "—".
export type DRIAmountKey = "AI" | "EAR" | "RDA" | "UL" | "AMDR";
export type DRIAmounts = Partial<Record<DRIAmountKey, string>>;

export type DRIEntry = {
  slug: string;
  title: string;
  category: string;
  DRI: Partial<Record<DRIGroupKey, Record<string, DRIAmounts>>>;
};

export type DRIData = Record<string, DRIEntry>;

export type SimpleUserProfile = {
  gender: "male" | "female";
  birthDate: string; // yyyy-MM-dd
};

// Reference diet used (a) as the denominator for the "Calories" ring and
// (b) to turn AMDR ranges like "20-35% of calories" (currently only "fats")
// into grams — the same 2,000 kcal reference the FDA's %DV is built on, so
// behaviour for those two cases matches what the app showed before.
export const ASSUMED_DAILY_CALORIES = 2000;

/* ------------------------------------------------------------------ */
/* 1. Age / gender -> DRI group + age-bracket label                    */
/* ------------------------------------------------------------------ */

// `gender` here is always the user's *actual* gender (never a stand-in for
// the DRI group), because the Children group is gender-independent as a
// group/age-label pair but some of its rows still carry a girl/boy split
// inside a single string (see resolveGenderedAmount below) — we need the
// real gender to resolve those even though `group` itself stays "Children".
export type AgeBracket = { group: DRIGroupKey; ageLabel: string; gender: "male" | "female" };

const CHILD_AGE_LABEL_BY_MONTHS: { maxMonths: number; label: string }[] = [
  { maxMonths: 6, label: "Infants (0-6 months)" },
  { maxMonths: 12, label: "Infants (7-12 months)" },
  { maxMonths: 12 * 4, label: "Young (1-3 years)" },
  { maxMonths: 12 * 9, label: "Preschool (4-8 years)" },
  { maxMonths: 12 * 14, label: "School-age (9-13 years)" },
];

const ADULT_AGE_LABEL_BY_YEARS: { maxYears: number; label: string }[] = [
  { maxYears: 19, label: "Teens (14-18 years)" },
  { maxYears: 31, label: "Adults (19-30 years)" },
  { maxYears: 51, label: "Middle-aged (31-50 years)" },
  { maxYears: 71, label: "Older Adults (51-70 years)" },
  { maxYears: Infinity, label: "The Elderly (71+ years)" },
];

function monthsBetween(birthDate: Date, now: Date): number {
  let months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());
  if (now.getDate() < birthDate.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Maps a user profile onto one row of vitaminDRI.json. Children's rows are
 * gender-independent as a group/age pair (0-13y), adult/teen rows depend on
 * gender via the group itself. Falls back to a generic adult female bracket
 * when there's no profile yet (e.g. onboarding not completed) so the
 * dashboard still renders real percentages instead of going blank.
 */
export function resolveDRIContext(profile: SimpleUserProfile | null): AgeBracket {
  if (!profile) {
    return { group: "Female", ageLabel: "Adults (19-30 years)", gender: "female" };
  }

  const birth = new Date(profile.birthDate);
  if (Number.isNaN(birth.getTime())) {
    return { group: "Female", ageLabel: "Adults (19-30 years)", gender: "female" };
  }

  const months = monthsBetween(birth, new Date());

  if (months < 12 * 14) {
    const bracket = CHILD_AGE_LABEL_BY_MONTHS.find((b) => months < b.maxMonths);
    return {
      group: "Children",
      ageLabel: bracket?.label ?? "School-age (9-13 years)",
      gender: profile.gender,
    };
  }

  const years = months / 12;
  const group: DRIGroupKey = profile.gender === "male" ? "Male" : "Female";
  const bracket = ADULT_AGE_LABEL_BY_YEARS.find((b) => years < b.maxYears)!;
  return { group, ageLabel: bracket.label, gender: profile.gender };
}

/* ------------------------------------------------------------------ */
/* 2. Amount string -> milligrams                                      */
/* ------------------------------------------------------------------ */

const UNIT_TO_MG: Record<string, number> = {
  mcg: 0.001,
  mg: 1,
  g: 1000,
  kg: 1_000_000,
};

// "<number>[-<number>] <unit>[ QUALIFIER]" — QUALIFIER covers suffixes like
// "RAE" / "DFE" that appear on product amounts ("44 mcg DFE") but not on
// vitaminDRI.json values, so both sides still normalize to the same unit.
const AMOUNT_RE = /^([\d.,]+)(?:\s*-\s*([\d.,]+))?\s*([a-zA-Z]+)(?:\s+[A-Z]+)?/;

const PERCENT_OF_CALORIES_RE =
  /^([\d.,]+)\s*(?:-\s*([\d.,]+)\s*)?%\s*of calories/i;

// Extracts the trailing unit word from a raw DRI string ("3.00 mg" -> "mg").
const TRAILING_UNIT_RE = /([a-zA-Z]+)\s*$/;

/**
 * Converts a plain mg amount (as produced by parseAmountToMg) back into a
 * display string using whatever unit `unitSourceRaw` is expressed in — e.g.
 * formatMgAsUnitOf(5000, "3.00 mg") -> "5 mg". Meant for showing "you
 * consumed X" next to a DRI amount ("the limit is Y") in the same unit, so
 * the two read naturally together instead of one being in mg and the other
 * in whatever unit vitaminDRI.json happens to store. Falls back to plain mg
 * if the source string has no recognizable unit.
 */
export function formatMgAsUnitOf(mg: number, unitSourceRaw: string): string {
  const match = unitSourceRaw.trim().match(TRAILING_UNIT_RE);
  const unit = match ? match[1].toLowerCase() : "mg";
  const factor = UNIT_TO_MG[unit] ?? 1;
  const value = mg / factor;
  // Up to 2 decimals, trimmed — "5" not "5.00", "1.25" stays "1.25".
  const rounded = Math.round(value * 100) / 100;
  const numStr = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${numStr} ${unit}`;
}

// How to resolve a "<low>-<high> <unit>" range into one number:
//  - "average": the two numbers describe one range for everyone (e.g. an
//    AMDR like "20-35% of calories") — use the midpoint, as before.
//  - "low"/"high": the two numbers are a girl/boy split for a single
//    Children age row (vitaminDRI.json's new format lists girls first,
//    boys second, e.g. "10-12 g" = 10 g for girls, 12 g for boys) — pick
//    the one matching the user's actual gender instead of averaging them.
export type RangeSelect = "average" | "low" | "high";

/**
 * Parses any amount string found in vitaminDRI.json or a product's
 * macro/microNutrients array into milligrams. Returns null for values that
 * carry no usable numeric recommendation ("—", per-kg-bodyweight AIs, etc.)
 * so callers can exclude them rather than silently treat them as zero.
 */
export function parseAmountToMg(
  raw: string | number | undefined | null,
  assumedDailyCalories: number = ASSUMED_DAILY_CALORIES,
  rangeSelect: RangeSelect = "average"
): number | null {
  if (raw === undefined || raw === null) return null;

  // Most amounts in vitaminDRI.json / productDetails are authored as
  // "<number> <unit>" strings, but some product files have this field as a
  // bare number (an authoring inconsistency, not a real unit-less amount —
  // there's no way to tell mg from mcg from a number alone). Coercing to a
  // string here means AMOUNT_RE below simply fails to find a unit and
  // returns null (treated the same as "no usable data"), instead of every
  // caller that scans many products at once (e.g.
  // computeTopProductsForNutrient) crashing on the first bad entry.
  const raw_str = typeof raw === "string" ? raw : String(raw);
  const trimmed = raw_str.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return null;

  // AMDR ranges, e.g. fats' "20-35% of calories" — always a genuine range
  // (not a girl/boy split, both numbers apply to everyone in the row), so
  // this keeps resolving to the midpoint regardless of rangeSelect.
  const percentMatch = trimmed.match(PERCENT_OF_CALORIES_RE);
  if (percentMatch) {
    const low = parseFloat(percentMatch[1].replace(/,/g, ""));
    const high = percentMatch[2] ? parseFloat(percentMatch[2].replace(/,/g, "")) : low;
    if (Number.isNaN(low)) return null;
    const midPercent = (low + high) / 2;
    const grams = ((midPercent / 100) * assumedDailyCalories) / 9;
    return grams * 1000;
  }

  // Per-kg-bodyweight AIs/EARs/RDAs (amino acids, creatine, l-carnitine,
  // ...) aren't tracked by any nutrient this app shows — no bodyweight
  // input exists to resolve them. This also correctly skips the "mg/kg/day"
  // girl/boy ranges vitaminDRI.json carries for some amino acids, since
  // there's nothing useful to do with either number without a bodyweight.
  if (/\/\s*kg/i.test(trimmed)) return null;

  const match = trimmed.match(AMOUNT_RE);
  if (!match) return null;

  const [, lowStr, highStr, unitRaw] = match;
  const factor = UNIT_TO_MG[unitRaw.toLowerCase()];
  if (factor === undefined) return null;

  const low = parseFloat(lowStr.replace(/,/g, ""));
  if (Number.isNaN(low)) return null;
  const high = highStr ? parseFloat(highStr.replace(/,/g, "")) : low;

  let value: number;
  if (!highStr) {
    value = low;
  } else if (rangeSelect === "low") {
    value = low;
  } else if (rangeSelect === "high") {
    value = high;
  } else {
    value = (low + high) / 2;
  }

  return value * factor;
}

/* ------------------------------------------------------------------ */
/* 2b. Gendered-range display string                                   */
/* ------------------------------------------------------------------ */

// Matches only the plain "<low>-<high> <unit>" shape used for the
// Children girl/boy split (e.g. "10-12 g", "2,300-2,500 mg"). AMDR
// ("20-35% of calories") and per-kg-bodyweight ranges ("12-13 mg/kg/day")
// never match this — they're genuine ranges, not a gender split, and stay
// displayed as-is.
const SIMPLE_GENDERED_RANGE_RE = /^([\d.,]+)\s*-\s*([\d.,]+)\s*([a-zA-Z]+)$/;

/**
 * For a Children-group row whose raw string is a girl/boy split ("10-12 g"
 * = 10 g girls, 12 g boys), resolves it down to the single number matching
 * `gender`. Every other row (non-Children, or a Children row that isn't a
 * simple gendered range) is returned unchanged.
 */
export function resolveGenderedAmount(
  raw: string,
  group: DRIGroupKey,
  gender: "male" | "female"
): string {
  if (group !== "Children") return raw;
  const match = raw.trim().match(SIMPLE_GENDERED_RANGE_RE);
  if (!match) return raw;
  const [, low, high, unit] = match;
  return `${gender === "male" ? high : low} ${unit}`;
}

/* ------------------------------------------------------------------ */
/* 3. Recommended-amount / upper-limit lookup                          */
/* ------------------------------------------------------------------ */

// Which key counts as "the" recommended daily amount, in priority order —
// most rows have RDA, infants/AI-only nutrients (fiber, potassium, vitamin D
// infants, ...) fall back to AI, and AMDR-only rows (fats, an AMDR range
// like "20-35% of calories") fall back to that.
const RECOMMENDED_KEY_PRIORITY: DRIAmountKey[] = ["RDA", "AI", "AMDR"];

function isUsableAmount(value: string | undefined): value is string {
  return !!value && value !== "-" && value !== "—";
}

function pickRecommendedRaw(amounts: DRIAmounts | undefined): string | null {
  if (!amounts) return null;
  for (const key of RECOMMENDED_KEY_PRIORITY) {
    if (isUsableAmount(amounts[key])) return amounts[key] as string;
  }
  return null;
}

function pickULRaw(amounts: DRIAmounts | undefined): string | null {
  return isUsableAmount(amounts?.UL) ? (amounts!.UL as string) : null;
}

// Children rows resolve their girl/boy split from the user's actual
// gender; Male/Female rows never carry that kind of range, so they always
// average (a no-op there since they don't have gendered ranges).
function rangeSelectFor(ctx: AgeBracket): RangeSelect {
  if (ctx.group !== "Children") return "average";
  return ctx.gender === "male" ? "high" : "low";
}

export function getRecommendedMg(
  driData: DRIData,
  slug: string,
  ctx: AgeBracket,
  assumedDailyCalories: number = ASSUMED_DAILY_CALORIES
): number | null {
  const entry = driData[slug];
  if (!entry) return null;
  const raw = pickRecommendedRaw(entry.DRI?.[ctx.group]?.[ctx.ageLabel]);
  if (!raw) return null;
  return parseAmountToMg(raw, assumedDailyCalories, rangeSelectFor(ctx));
}

/**
 * Same lookup as getRecommendedMg, but for the upper limit (UL) instead of
 * the recommended amount — used to flag/display how close today's intake
 * is to a nutrient's safe ceiling.
 */
export function getULMg(
  driData: DRIData,
  slug: string,
  ctx: AgeBracket,
  assumedDailyCalories: number = ASSUMED_DAILY_CALORIES
): number | null {
  const entry = driData[slug];
  if (!entry) return null;
  const raw = pickULRaw(entry.DRI?.[ctx.group]?.[ctx.ageLabel]);
  if (!raw) return null;
  return parseAmountToMg(raw, assumedDailyCalories, rangeSelectFor(ctx));
}

/**
 * Returns the recommended-amount string (RDA, falling back to AI, then
 * AMDR) for a given nutrient slug + DRI context, resolved for display —
 * e.g. "900 mcg", "20-35% of calories", or, for a Children row that's
 * stored as a girl/boy split, just that user's own number ("10 g" rather
 * than "10-12 g"). Unlike getRecommendedMg, this keeps the original unit
 * instead of converting to mg — it's meant for *display* (e.g. "your daily
 * norm is 900 mcg" in NutrientDetailSheet), not for math.
 */
export function getRecommendedAmountRaw(
  driData: DRIData,
  slug: string,
  ctx: AgeBracket
): string | null {
  const entry = driData[slug];
  if (!entry) return null;
  const raw = pickRecommendedRaw(entry.DRI?.[ctx.group]?.[ctx.ageLabel]);
  if (!raw) return null;
  return resolveGenderedAmount(raw, ctx.group, ctx.gender);
}

/**
 * Same as getRecommendedAmountRaw, but for the upper limit (UL) — the raw
 * "don't go above this" string for display (e.g. "3.00 mg"), gender-resolved
 * the same way for Children rows stored as a split. Returns null when this
 * nutrient/DRI context has no UL data ("-").
 */
export function getULAmountRaw(
  driData: DRIData,
  slug: string,
  ctx: AgeBracket
): string | null {
  const entry = driData[slug];
  if (!entry) return null;
  const raw = pickULRaw(entry.DRI?.[ctx.group]?.[ctx.ageLabel]);
  if (!raw) return null;
  return resolveGenderedAmount(raw, ctx.group, ctx.gender);
}

/* ------------------------------------------------------------------ */
/* 2c. Amount string -> localized display string (unit translation)    */
/* ------------------------------------------------------------------ */

// Mirrors the unit vocabulary productDetails' RU files already use for the
// same kind of values ("г"/"мг"/"мкг"/"ккал" — see the comment in
// dailyValue.ts about why the *math* always runs on the EN files instead).
// This is purely cosmetic: it turns a DRI amount that's always stored in
// English ("900 mcg", "20-35% of calories") into the matching RU-facing
// string so it can be shown to the user without touching the underlying
// vitaminDRI.json data.
const UNIT_LABEL_BY_LOCALE: Record<string, Record<string, string>> = {
  ru: { mcg: "мкг", mg: "мг", g: "г", kg: "кг", kcal: "ккал" },
};

export function localizeAmountString(raw: string, locale: "en" | "ru"): string {
  if (locale === "en") return raw;
  const unitMap = UNIT_LABEL_BY_LOCALE[locale];
  if (!unitMap) return raw;

  return raw
    .replace(/\b(mcg|mg|kg|g|kcal)\b/gi, (unit) => unitMap[unit.toLowerCase()] ?? unit)
    .replace(/%\s*of calories/i, "% от калорий");
}

/* ------------------------------------------------------------------ */
/* 4. Loader — one shared dynamic import, cached across the whole app  */
/* ------------------------------------------------------------------ */

let driPromise: Promise<DRIData> | null = null;

/**
 * vitaminDRI.json is one locale-independent file (see VitaminDetailSheet.tsx)
 * — only group/age labels are translated via the "Vitamins.dri" messages
 * namespace, so a single cached import covers every locale.
 */
export function loadVitaminDRI(): Promise<DRIData> {
  if (!driPromise) {
    driPromise = import("@/data/en/vitaminDRI.json").then(
      (mod) => (mod.default ?? mod) as unknown as DRIData
    );
  }
  return driPromise;
}