import { Preferences } from "@capacitor/preferences";

// Единое хранилище персональных данных пользователя (имя/пол/дата рождения/
// вес/рост), заполняется на онбординге (см. onboardingInfoClient.tsx) и
// переиспользуется на странице /settings и в расчёте нормы воды (lib/water.ts).

export type Gender = "male" | "female";

export type UserProfile = {
  name: string;
  gender: Gender;
  birthDate: string; // yyyy-MM-dd
  // Добавлены позже первых версий приложения: профили, сохранённые раньше,
  // этих полей не содержат — поэтому на уровне типа они необязательные.
  weightKg?: number;
  heightCm?: number;
};

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const HEIGHT_MIN_CM = 80;
export const HEIGHT_MAX_CM = 250;

export const isValidWeight = (v: unknown): v is number =>
  typeof v === "number" &&
  Number.isFinite(v) &&
  v >= WEIGHT_MIN_KG &&
  v <= WEIGHT_MAX_KG;

export const isValidHeight = (v: unknown): v is number =>
  typeof v === "number" &&
  Number.isFinite(v) &&
  v >= HEIGHT_MIN_CM &&
  v <= HEIGHT_MAX_CM;

// Вес: до 3 цифр целой части и одна цифра после точки ("72.5").
// Запятая (как на русской клавиатуре) превращается в точку.
export function sanitizeWeightInput(raw: string): string {
  const cleaned = raw.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const [int = "", ...rest] = cleaned.split(".");
  const head = int.slice(0, 3);
  if (rest.length === 0) return head;
  return `${head}.${rest.join("").slice(0, 1)}`;
}

// Рост: только целые сантиметры, до 3 цифр.
export function sanitizeHeightInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 3);
}

const PROFILE_KEY = "userProfile";

export async function getUserProfile(): Promise<UserProfile | null> {
  const { value } = await Preferences.get({ key: PROFILE_KEY });
  if (!value) return null;

  try {
    return JSON.parse(value) as UserProfile;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await Preferences.set({
    key: PROFILE_KEY,
    value: JSON.stringify(profile),
  });
}

// Онбординг считается пройденным только если есть вес и рост. Раньше здесь
// был отдельный флаг "personalInfoCompleted" — но у тех, кто прошёл онбординг
// в старой версии, он уже true, а веса/роста в профиле нет. Поэтому теперь
// проверяем сами данные: такие пользователи один раз увидят шаги 4–5.
export async function hasCompletedPersonalInfo(): Promise<boolean> {
  const profile = await getUserProfile();
  return !!profile && isValidWeight(profile.weightKg) && isValidHeight(profile.heightCm);
}