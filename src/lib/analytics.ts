// lib/analytics.ts
// Единая обёртка над аналитикой. Страницы и компоненты вызывают только track()/trackScreen(),
// поэтому провайдера (Firebase -> AppMetrica и т.д.) можно заменить правкой одного файла.
//
// Приватность: НИКОГДА не передавайте сюда вес, рост, дату рождения, имя,
// содержимое дневника и точные значения. Только факт действия и категорию.

import { Capacitor } from "@capacitor/core";

export type AnalyticsParams = Record<string, string | number | boolean>;

/** Список событий в одном месте, чтобы имена не расползались (до 40 символов, snake_case). */
export const AnalyticsEvent = {
  ScreenView: "screen_view",
  AppForeground: "app_foreground",
  AppBackground: "app_background",

  // Каталог продуктов
  SearchProducts: "search_products",
  CategoryChipSelect: "category_chip_select",
  ProductSheetOpen: "product_sheet_open",
  ProductInfoOpen: "product_info_open",
  ProductInfoNotFound: "product_info_not_found",

  // Страницы витаминов и минералов
  VitaminInfoOpen: "vitamin_info_open",
  VitaminInfoNotFound: "vitamin_info_not_found",
  VitaminInfoTabSelect: "vitamin_info_tab_select",
  FavoriteToggle: "favorite_toggle",

  // Дневник
  AddFoodOpen: "add_food_open",
  FoodAdded: "food_added",
  FoodEdited: "food_edited",
  FoodRemoved: "food_removed",
  PlanConfirmed: "plan_confirmed",
  MealTabSelect: "meal_tab_select",
  CalendarOpen: "calendar_open",
  DiaryDateSelect: "diary_date_select",
  NutrientDetailOpen: "nutrient_detail_open",
  WaterAdded: "water_added",
  WaterRemoved: "water_removed",

  // Прочее
  OnboardingStarted: "onboarding_started",
  OnboardingStepComplete: "onboarding_step_complete",
  OnboardingBack: "onboarding_back",
  OnboardingCompleted: "onboarding_completed",
  LanguageChanged: "language_changed",
  BackupExport: "backup_export",
  BackupImport: "backup_import",
  BackupExportFailed: "backup_export_failed",
  BackupImportFailed: "backup_import_failed",
  ProfileUpdated: "profile_updated",
  AnalyticsEnabled: "analytics_enabled",

  // Статистика
  StatsView: "stats_view",
  StatsRangeSelect: "stats_range_select",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

const STORAGE_KEY = "analytics_enabled";

/** По умолчанию включено; пользователь может выключить в настройках. */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

type FirebaseModule = typeof import("@capacitor-firebase/analytics");
let firebasePromise: Promise<FirebaseModule> | null = null;

// Динамический import: плагин не попадает в веб-сборку и не ломает SSR/статический экспорт.
const getFirebase = () => {
  if (!firebasePromise) firebasePromise = import("@capacitor-firebase/analytics");
  return firebasePromise;
};

const canSend = () =>
  typeof window !== "undefined" && Capacitor.isNativePlatform() && isAnalyticsEnabled();

/** Включить/выключить аналитику (вызывать из переключателя в /settings и из онбординга). */
export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseAnalytics } = await getFirebase();
    await FirebaseAnalytics.setEnabled({ enabled });
  } catch (e) {
    console.warn("analytics setEnabled:", e);
  }
}

/** Синхронизировать состояние SDK с сохранённым согласием (вызывается один раз при старте). */
export async function initAnalytics(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseAnalytics } = await getFirebase();
    await FirebaseAnalytics.setEnabled({ enabled: isAnalyticsEnabled() });
  } catch (e) {
    console.warn("analytics init:", e);
  }
}

export async function track(name: AnalyticsEventName | string, params?: AnalyticsParams): Promise<void> {
  if (!canSend()) return;
  try {
    const { FirebaseAnalytics } = await getFirebase();
    await FirebaseAnalytics.logEvent({ name, params });
  } catch (e) {
    console.warn("analytics track:", e);
  }
}

export async function trackScreen(screenName: string): Promise<void> {
  if (!canSend()) return;
  try {
    const { FirebaseAnalytics } = await getFirebase();
    await FirebaseAnalytics.setCurrentScreen({ screenName, screenClassOverride: screenName });
  } catch (e) {
    console.warn("analytics screen:", e);
  }
}