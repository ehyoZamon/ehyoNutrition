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
//   3. getRecommendedMg()   — looks up + parses the recommended amount for a
//      given nutrient slug and DRI context.
//   4. loadVitaminDRI()     — the same lazy, cached dynamic import pattern
//      VitaminDetailSheet.tsx already uses for this file.

export type DRIGroupKey = "Children" | "Male" | "Female";

export type DRIEntry = {
  slug: string;
  title: string;
  category: string;
  DRI: Partial<Record<DRIGroupKey, Record<string, string>>>;
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

export type AgeBracket = { group: DRIGroupKey; ageLabel: string };

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
 * gender-independent (0-13y), adult/teen rows depend on gender. Falls back
 * to a generic adult female bracket when there's no profile yet (e.g.
 * onboarding not completed) so the dashboard still renders real percentages
 * instead of going blank.
 */
export function resolveDRIContext(profile: SimpleUserProfile | null): AgeBracket {
  if (!profile) {
    return { group: "Female", ageLabel: "Adults (19-30 years)" };
  }

  const birth = new Date(profile.birthDate);
  if (Number.isNaN(birth.getTime())) {
    return { group: "Female", ageLabel: "Adults (19-30 years)" };
  }

  const months = monthsBetween(birth, new Date());

  if (months < 12 * 14) {
    const bracket = CHILD_AGE_LABEL_BY_MONTHS.find((b) => months < b.maxMonths);
    return { group: "Children", ageLabel: bracket?.label ?? "School-age (9-13 years)" };
  }

  const years = months / 12;
  const group: DRIGroupKey = profile.gender === "male" ? "Male" : "Female";
  const bracket = ADULT_AGE_LABEL_BY_YEARS.find((b) => years < b.maxYears)!;
  return { group, ageLabel: bracket.label };
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

/**
 * Parses any amount string found in vitaminDRI.json or a product's
 * macro/microNutrients array into milligrams. Returns null for values that
 * carry no usable numeric recommendation ("—", per-kg-bodyweight AIs, etc.)
 * so callers can exclude them rather than silently treat them as zero.
 */
export function parseAmountToMg(
  raw: string | undefined | null,
  assumedDailyCalories: number = ASSUMED_DAILY_CALORIES
): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return null;

  // AMDR ranges, e.g. fats' "20-35% of calories" — resolved against the
  // reference daily calories, using the midpoint of the range, at 9 kcal/g.
  const percentMatch = trimmed.match(PERCENT_OF_CALORIES_RE);
  if (percentMatch) {
    const low = parseFloat(percentMatch[1].replace(/,/g, ""));
    const high = percentMatch[2] ? parseFloat(percentMatch[2].replace(/,/g, "")) : low;
    if (Number.isNaN(low)) return null;
    const midPercent = (low + high) / 2;
    const grams = ((midPercent / 100) * assumedDailyCalories) / 9;
    return grams * 1000;
  }

  // Per-kg-bodyweight AIs (creatine, l-carnitine, ...) aren't tracked by any
  // nutrient this app shows — no bodyweight input exists to resolve them.
  if (/\/\s*kg/i.test(trimmed)) return null;

  const match = trimmed.match(AMOUNT_RE);
  if (!match) return null;

  const [, lowStr, highStr, unitRaw] = match;
  const factor = UNIT_TO_MG[unitRaw.toLowerCase()];
  if (factor === undefined) return null;

  const low = parseFloat(lowStr.replace(/,/g, ""));
  if (Number.isNaN(low)) return null;
  const high = highStr ? parseFloat(highStr.replace(/,/g, "")) : low;
  const value = highStr ? (low + high) / 2 : low;

  return value * factor;
}

/* ------------------------------------------------------------------ */
/* 3. Recommended-amount lookup                                        */
/* ------------------------------------------------------------------ */

export function getRecommendedMg(
  driData: DRIData,
  slug: string,
  ctx: AgeBracket,
  assumedDailyCalories: number = ASSUMED_DAILY_CALORIES
): number | null {
  const entry = driData[slug];
  if (!entry) return null;
  const raw = entry.DRI?.[ctx.group]?.[ctx.ageLabel];
  if (!raw) return null;
  return parseAmountToMg(raw, assumedDailyCalories);
}

/**
 * Returns the recommended-amount string exactly as stored in
 * vitaminDRI.json (e.g. "900 mcg", "20-35% of calories") for a given
 * nutrient slug + DRI context. Unlike getRecommendedMg, this keeps the
 * original unit instead of converting to mg — it's meant for *display*
 * (e.g. "your daily norm is 900 mcg" in NutrientDetailSheet), not for math.
 */
export function getRecommendedAmountRaw(
  driData: DRIData,
  slug: string,
  ctx: AgeBracket
): string | null {
  const entry = driData[slug];
  if (!entry) return null;
  return entry.DRI?.[ctx.group]?.[ctx.ageLabel] ?? null;
}

/* ------------------------------------------------------------------ */
/* 2b. Amount string -> localized display string (unit translation)    */
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
