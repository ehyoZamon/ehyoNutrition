import { getDB, initDB, persistWeb } from "./db";
import { isValidWeight, UserProfile } from "./userProfile";

// Объём одного "стакана" в UI. Все изменения идут кратно ему, поэтому
// заполненность стаканов — это просто amountMl / WATER_GLASS_ML.
export const WATER_GLASS_ML = 250;

// Верхняя страховка на объём за день. Реальный предел задаёт UI: ряды
// стаканов появляются только пока не набрана норма.
export const WATER_MAX_ML = 10000;

// Норма воды: мл на кг веса.
const ML_PER_KG = { male: 35, female: 30 } as const;

// Пока в профиле нет веса (например, до прохождения шагов онбординга).
const FALLBACK_GOAL_ML = 2000;

// Суточная норма в мл, округлённая до 50 мл (70.5 кг мужчина → 2450, а не 2467.5).
export function calcWaterGoalMl(profile: UserProfile | null): number {
  if (!profile || !isValidWeight(profile.weightKg)) return FALLBACK_GOAL_ML;
  const perKg = ML_PER_KG[profile.gender] ?? ML_PER_KG.male;
  return Math.round((profile.weightKg * perKg) / 50) * 50;
}

async function ready() {
  const database = getDB() ?? (await initDB());
  if (!database) throw new Error("[water] БД не инициализирована");
  return database;
}

export async function getWaterByDate(date: string): Promise<number> {
  const database = await ready();
  const res = await database.query(
    `SELECT amount_ml FROM water_log WHERE date = ?`,
    [date]
  );
  const row = (res.values ?? [])[0] as { amount_ml: number } | undefined;
  return row?.amount_ml ?? 0;
}

export async function setWaterByDate(date: string, amountMl: number): Promise<void> {
  const database = await ready();
  await database.run(
    `INSERT OR REPLACE INTO water_log (date, amount_ml) VALUES (?, ?)`,
    [date, amountMl]
  );
  await persistWeb();
}