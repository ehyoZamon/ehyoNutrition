import type { UserProfile } from "@/lib/userProfile";

// ---- Types shared by the statistics page and its chart modules ----

export type MealKey = "breakfast" | "lunch" | "dinner" | "snacks" | "uncategorized";

export const MEAL_KEYS: MealKey[] = ["breakfast", "lunch", "dinner", "snacks", "uncategorized"];

export type DayStat = {
  date: string; // yyyy-MM-dd
  label: string; // short axis label ("пн" / "12")
  fullLabel: string; // tooltip title ("12 сентября")
  kcal: number; // only "consumed" entries
  waterMl: number;
  logged: boolean; // at least one consumed entry that day
};

export type Summary = {
  avgKcal: number;
  loggedDays: number;
  avgWaterMl: number;
  waterGoalDays: number;
};

// ---- Aggregation ----

export function summarize(days: DayStat[], waterGoalMl: number | null): Summary {
  const withKcal = days.filter((d) => d.kcal > 0);
  const withWater = days.filter((d) => d.waterMl > 0);

  return {
    avgKcal: withKcal.length
      ? Math.round(withKcal.reduce((sum, d) => sum + d.kcal, 0) / withKcal.length)
      : 0,
    loggedDays: days.filter((d) => d.logged).length,
    avgWaterMl: withWater.length
      ? Math.round(withWater.reduce((sum, d) => sum + d.waterMl, 0) / withWater.length)
      : 0,
    waterGoalDays: waterGoalMl ? days.filter((d) => d.waterMl >= waterGoalMl).length : 0,
  };
}

// Rough reference line for the calories chart: Mifflin–St Jeor BMR × 1.2
// (sedentary). Only an orientation point, not a target — returns null when the
// profile is incomplete or the person is under 18 (formula is meant for adults).
export function estimateDailyKcal(profile: UserProfile | null, now = new Date()): number | null {
  if (!profile) return null;

  const { weightKg, heightCm, birthDate, gender } = profile;
  if (weightKg == null || heightCm == null || !birthDate) return null;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  if (age < 18 || age > 100) return null;

  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === "female" ? -161 : 5);
  return Math.round((bmr * 1.2) / 10) * 10;
}
