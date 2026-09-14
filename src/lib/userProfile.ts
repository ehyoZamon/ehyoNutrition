import { Preferences } from "@capacitor/preferences";

// Единое хранилище персональных данных пользователя (имя/пол/дата рождения),
// заполняется на онбординге (см. onboardingInfoClient.tsx) и переиспользуется
// на странице /settings.

export type Gender = "male" | "female";

export type UserProfile = {
  name: string;
  gender: Gender;
  birthDate: string; // yyyy-MM-dd
};

const PROFILE_KEY = "userProfile";
const PERSONAL_INFO_COMPLETED_KEY = "personalInfoCompleted";

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
  await Preferences.set({
    key: PERSONAL_INFO_COMPLETED_KEY,
    value: "true",
  });
}

export async function hasCompletedPersonalInfo(): Promise<boolean> {
  const { value } = await Preferences.get({
    key: PERSONAL_INFO_COMPLETED_KEY,
  });
  return value === "true";
}
