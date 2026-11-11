// lib/waterReminders.ts
// Напоминания о воде через локальные уведомления (работают офлайн, без сервера).
//
// Принцип: уведомления планируются на несколько дней вперёд и ПЕРЕПЛАНИРУЮТСЯ
// при каждом открытии приложения, добавлении воды или смене настроек.
// - если пользователь не открывает приложение HORIZON_DAYS дней, напоминания
//   сами прекращаются (защита от спама для "забытого" приложения);
// - на сегодня учитывается прогресс: цель выполнена — остаток дня без напоминаний,
//   пользователь опережает график — лишние напоминания пропускаются.
//
// Приватность: в аналитику уходит только факт действия (см. lib/analytics.ts).

import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { format } from "date-fns";
import { getUserProfile } from "./userProfile";
import { calcWaterGoalMl, getWaterByDate } from "./water";

// ---------- Настройки ----------

export const INTERVAL_OPTIONS_MIN = [90, 120, 180] as const;
export type ReminderInterval = (typeof INTERVAL_OPTIONS_MIN)[number];

export type WaterReminderSettings = {
  enabled: boolean;
  intervalMin: ReminderInterval;
  /** Начало окна напоминаний, минут от полуночи */
  startMin: number;
  /** Конец окна напоминаний, минут от полуночи */
  endMin: number;
};

export const DEFAULT_WATER_REMINDER_SETTINGS: WaterReminderSettings = {
  enabled: false, // по умолчанию выключено: включает только сам пользователь
  intervalMin: 120,
  startMin: 9 * 60,
  endMin: 21 * 60,
};

/** Минимальная ширина окна, чтобы в нём помещалось хотя бы одно напоминание */
export const MIN_WINDOW_MIN = 60;

const STORAGE_KEY = "water_reminders";

const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

export function loadWaterReminderSettings(): WaterReminderSettings {
  const d = DEFAULT_WATER_REMINDER_SETTINGS;
  if (typeof window === "undefined") return d;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const p = JSON.parse(raw) as Partial<WaterReminderSettings>;

    const intervalMin = INTERVAL_OPTIONS_MIN.includes(p.intervalMin as ReminderInterval)
      ? (p.intervalMin as ReminderInterval)
      : d.intervalMin;
    const startMin = isInt(p.startMin, 0, 1439) ? p.startMin : d.startMin;
    const endMin = isInt(p.endMin, 0, 1439) ? p.endMin : d.endMin;
    const windowOk = endMin - startMin >= MIN_WINDOW_MIN;

    return {
      enabled: p.enabled === true,
      intervalMin,
      startMin: windowOk ? startMin : d.startMin,
      endMin: windowOk ? endMin : d.endMin,
    };
  } catch {
    return d;
  }
}

export function saveWaterReminderSettings(settings: WaterReminderSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* localStorage может быть недоступен */
  }
}

// ---------- Платформа и события ----------

export const isReminderPlatform = () =>
  typeof window !== "undefined" && Capacitor.isNativePlatform();

export const SYNC_EVENT = "water-reminders:sync";

/**
 * Попросить перепланировать напоминания. Можно вызывать откуда угодно
 * (после изменения воды, веса, настроек) — слушает WaterReminderSync.
 */
export function requestWaterReminderSync(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SYNC_EVENT));
}

// ---------- Разрешения ----------

export async function ensureNotificationPermission(): Promise<"granted" | "denied"> {
  if (!isReminderPlatform()) return "denied";
  try {
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") return "granted";
    // Android 13+: после двух отказов системный диалог больше не показывается —
    // тогда request вернёт "denied" сразу, и пользователю нужно включить вручную.
    const result = await LocalNotifications.requestPermissions();
    return result.display === "granted" ? "granted" : "denied";
  } catch (e) {
    console.warn("water reminders permission:", e);
    return "denied";
  }
}

// ---------- Планирование ----------

export type ReminderTexts = {
  channelName: string;
  channelDescription: string;
  title: string;
  /** Текст на сегодня: с прогрессом ("Выпито 1,2 из 2,1 л") */
  progress: (drunkMl: number, goalMl: number) => string;
  /** Тексты для следующих дней (прогресс ещё неизвестен); чередуются */
  generic: string[];
};

const CHANNEL_ID = "water_reminders";
// Своё диапазон id, чтобы отменять только свои уведомления:
// id = ID_BASE + dayOffset * 100 + slotIndex
const ID_BASE = 71000;
const ID_RANGE = 1000;
const HORIZON_DAYS = 3;
// Не планируем то, что наступит прямо сейчас
const MIN_LEAD_MS = 20_000;

export function buildSlots(s: Pick<WaterReminderSettings, "startMin" | "endMin" | "intervalMin">): number[] {
  const slots: number[] = [];
  for (let m = s.startMin; m <= s.endMin; m += s.intervalMin) slots.push(m);
  return slots;
}

async function cancelOwnNotifications() {
  const { notifications } = await LocalNotifications.getPending();
  const own = notifications.filter((n) => n.id >= ID_BASE && n.id < ID_BASE + ID_RANGE);
  if (own.length > 0) {
    await LocalNotifications.cancel({ notifications: own.map((n) => ({ id: n.id })) });
  }
}

async function doSync(texts: ReminderTexts) {
  if (!isReminderPlatform()) return;

  const settings = loadWaterReminderSettings();

  // Всегда начинаем с чистого листа — так расписание не накапливает дубли
  await cancelOwnNotifications();
  if (!settings.enabled) return;

  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") return;

  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: texts.channelName,
    description: texts.channelDescription,
    importance: 3, // обычная важность: без всплывающего баннера и звука-сирены
    visibility: 1,
    vibration: false,
  });

  const profile = await getUserProfile();
  const goalMl = calcWaterGoalMl(profile);
  const amountMl = await getWaterByDate(format(new Date(), "yyyy-MM-dd"));

  const slots = buildSlots(settings);
  const windowLen = settings.endMin - settings.startMin;
  const now = Date.now();
  const batch: LocalNotificationSchema[] = [];

  for (let day = 0; day < HORIZON_DAYS; day++) {
    // Норма на сегодня выполнена — остаток дня без напоминаний
    if (day === 0 && goalMl > 0 && amountMl >= goalMl) continue;

    slots.forEach((slot, idx) => {
      const at = new Date();
      at.setHours(0, 0, 0, 0);
      at.setDate(at.getDate() + day);
      at.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
      if (at.getTime() <= now + MIN_LEAD_MS) return;

      if (day === 0 && goalMl > 0) {
        // Пользователь опережает график к этому часу — напоминание лишнее.
        // Более поздние слоты ждут больше воды, так что сработают, если он отстанет.
        const expectedMl = (goalMl * (slot - settings.startMin)) / windowLen;
        if (amountMl > expectedMl) return;
      }

      const body =
        day === 0 && goalMl > 0
          ? texts.progress(amountMl, goalMl)
          : texts.generic[(day + idx) % texts.generic.length];

      batch.push({
        id: ID_BASE + day * 100 + idx,
        title: texts.title,
        body,
        channelId: CHANNEL_ID,
        schedule: { at, allowWhileIdle: true }, // неточное окно: спец. разрешение на точные будильники не нужно
        extra: { kind: "water" },
      });
    });
  }

  if (batch.length > 0) await LocalNotifications.schedule({ notifications: batch });
}

// Синхронизации идут строго по очереди: параллельные cancel/schedule дают дубли
let queue: Promise<void> = Promise.resolve();

export function syncWaterReminders(texts: ReminderTexts): Promise<void> {
  queue = queue.then(() => doSync(texts)).catch((e) => console.warn("water reminders sync:", e));
  return queue;
}
