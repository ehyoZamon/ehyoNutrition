// lib/mealReminders.ts
// Напоминания о запланированных приёмах пищи (Daily Plan) — локальные уведомления.
//
// Как это работает:
// - Запланированные блюда (diary.status = 'planned') всегда относятся к СЕГОДНЯ и имеют только тип
//   приёма пищи (завтрак/обед/ужин/перекусы), без времени. Поэтому время напоминания пользователь
//   задаёт для каждого типа приёма пищи в настройках.
// - Для каждого типа, у которого на сегодня есть неподтверждённые блюда и время которого ещё не
//   наступило, планируется ОДНО уведомление со списком блюд.
// - Расписание пересобирается при любом изменении дневника (lib/diary.ts), при старте, возврате
//   в приложение и смене настроек: отметили блюдо съеденным или удалили — уведомление исчезает.
//
// Приватность: названия блюд есть только в локальном уведомлении, в аналитику они не уходят.

import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { format } from "date-fns";
import { getDiaryEntriesByDate } from "./diary";
import { isReminderPlatform } from "./waterReminders";

// ---------- Настройки ----------

export const MEAL_KEYS = ["breakfast", "lunch", "dinner", "snacks"] as const;
export type ReminderMeal = (typeof MEAL_KEYS)[number];

export type MealReminderSettings = {
  enabled: boolean;
  /** Время напоминания для каждого приёма пищи, минут от полуночи */
  times: Record<ReminderMeal, number>;
};

export const DEFAULT_MEAL_REMINDER_SETTINGS: MealReminderSettings = {
  enabled: false, // включает только сам пользователь
  times: {
    breakfast: 8 * 60,
    lunch: 13 * 60,
    dinner: 19 * 60,
    snacks: 16 * 60,
  },
};

const STORAGE_KEY = "meal_reminders";

const isMinutes = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 1439;

export function loadMealReminderSettings(): MealReminderSettings {
  const d = DEFAULT_MEAL_REMINDER_SETTINGS;
  if (typeof window === "undefined") return d;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const p = JSON.parse(raw) as Partial<MealReminderSettings>;
    const times = { ...d.times };
    for (const key of MEAL_KEYS) {
      const v = p.times?.[key];
      if (isMinutes(v)) times[key] = v;
    }
    return { enabled: p.enabled === true, times };
  } catch {
    return d;
  }
}

export function saveMealReminderSettings(settings: MealReminderSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* localStorage может быть недоступен */
  }
}

// ---------- Планирование ----------

export type MealReminderTexts = {
  /** "ru" | "en" — по нему выбираются названия продуктов */
  locale: string;
  channelName: string;
  channelDescription: string;
  title: Record<ReminderMeal, string>;
  /** "В плане: Овсянка, Банан" (+ "и ещё N", если блюд больше показанных) */
  body: (names: string[], more: number) => string;
  /** Если названия найти не удалось */
  bodyFallback: string;
};

const CHANNEL_ID = "meal_reminders";
// Свой диапазон id (у воды — 71000–71999): id = ID_BASE + индекс приёма пищи
const ID_BASE = 72000;
const ID_RANGE = 100;
const MIN_LEAD_MS = 20_000;
const MAX_NAMES = 3;

const namesCache = new Map<string, Map<number, string>>();

// Динамический import: тяжёлый JSON с продуктами грузится только когда реально нужен
async function loadProductNames(locale: string): Promise<Map<number, string>> {
  const key = locale === "ru" ? "ru" : "en";
  const cached = namesCache.get(key);
  if (cached) return cached;

  const mod =
    key === "ru" ? await import("@/data/ru/products.json") : await import("@/data/en/products.json");
  const list = ((mod as { default?: unknown }).default ?? mod) as { id: number; name: string }[];
  const map = new Map<number, string>(list.map((p) => [p.id, p.name]));
  namesCache.set(key, map);
  return map;
}

async function cancelOwnNotifications() {
  const { notifications } = await LocalNotifications.getPending();
  const own = notifications.filter((n) => n.id >= ID_BASE && n.id < ID_BASE + ID_RANGE);
  if (own.length > 0) {
    await LocalNotifications.cancel({ notifications: own.map((n) => ({ id: n.id })) });
  }
}

async function doSync(texts: MealReminderTexts) {
  if (!isReminderPlatform()) return;

  const settings = loadMealReminderSettings();

  // Всегда начинаем с чистого листа — так расписание не накапливает дубли
  await cancelOwnNotifications();
  if (!settings.enabled) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") return;

  const today = format(new Date(), "yyyy-MM-dd");
  const rows = await getDiaryEntriesByDate(today);
  const planned = rows.filter((r) => r.status === "planned");
  if (planned.length === 0) return;

  const now = Date.now();
  const names = await loadProductNames(texts.locale);
  const batch: LocalNotificationSchema[] = [];

  MEAL_KEYS.forEach((meal, idx) => {
    const items = planned.filter((r) => r.meal === meal);
    if (items.length === 0) return;

    const minutes = settings.times[meal];
    const at = new Date();
    at.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    if (at.getTime() <= now + MIN_LEAD_MS) return; // время приёма пищи уже прошло

    // Уникальные названия в порядке добавления
    const unique = Array.from(
      new Set(items.map((r) => names.get(r.product_id)).filter((n): n is string => !!n))
    );
    const body =
      unique.length > 0
        ? texts.body(unique.slice(0, MAX_NAMES), Math.max(0, unique.length - MAX_NAMES))
        : texts.bodyFallback;

    batch.push({
      id: ID_BASE + idx,
      title: texts.title[meal],
      body,
      channelId: CHANNEL_ID,
      // Своя иконка (вилка и нож); у воды — капля из capacitor.config. Файл: res/drawable*/ic_stat_meal.png
      smallIcon: "ic_stat_meal",
      schedule: { at, allowWhileIdle: true },
      extra: { kind: "meal", meal },
    });
  });

  if (batch.length === 0) return;

  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: texts.channelName,
    description: texts.channelDescription,
    importance: 3,
    visibility: 1,
    vibration: false,
  });
  await LocalNotifications.schedule({ notifications: batch });
}

// Синхронизации идут строго по очереди: параллельные cancel/schedule дают дубли
let queue: Promise<void> = Promise.resolve();

export function syncMealReminders(texts: MealReminderTexts): Promise<void> {
  queue = queue.then(() => doSync(texts)).catch((e) => console.warn("meal reminders sync:", e));
  return queue;
}