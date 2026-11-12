// components/mealReminderSync.tsx
// Невидимый компонент: держит расписание локальных уведомлений актуальным —
// и напоминаний о воде, и напоминаний о запланированной еде.
// Монтировать ОДИН раз в корневом layout, ВНУТРИ DBProvider и LanguageProvider
// (нужны открытая БД и переводы).
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { AnalyticsEvent, track } from "@/lib/analytics";
import {
  SYNC_EVENT,
  isReminderPlatform,
  syncWaterReminders,
  type ReminderTexts,
} from "@/lib/waterReminders";
import { syncMealReminders, type MealReminderTexts } from "@/lib/mealReminders";
import { MEAL_SYNC_EVENT } from "@/lib/reminderEvents";

export default function MealReminderSync() {
  const t = useTranslations("WaterReminder");
  const tm = useTranslations("MealReminder");
  const locale = useLocale();
  const router = useRouter();

  // Свежие тексты без пересоздания слушателей
  const waterTextsRef = useRef<ReminderTexts | null>(null);
  waterTextsRef.current = {
    channelName: t("channelName"),
    channelDescription: t("channelDescription"),
    title: t("notifTitle"),
    progress: (drunkMl, goalMl) =>
      t("notifProgress", {
        drunk: (drunkMl / 1000).toLocaleString(locale, { maximumFractionDigits: 1 }),
        goal: (goalMl / 1000).toLocaleString(locale, { maximumFractionDigits: 1 }),
      }),
    generic: [t("notifGeneric1"), t("notifGeneric2"), t("notifGeneric3")],
  };

  const mealTextsRef = useRef<MealReminderTexts | null>(null);
  mealTextsRef.current = {
    locale,
    channelName: tm("channelName"),
    channelDescription: tm("channelDescription"),
    title: {
      breakfast: tm("notifTitleBreakfast"),
      lunch: tm("notifTitleLunch"),
      dinner: tm("notifTitleDinner"),
      snacks: tm("notifTitleSnacks"),
    },
    body: (names, more) =>
      more > 0
        ? tm("notifBodyMore", { items: names.join(", "), count: more })
        : tm("notifBody", { items: names.join(", ") }),
    bodyFallback: tm("notifBodyFallback"),
  };

  const syncWater = () => {
    if (waterTextsRef.current) syncWaterReminders(waterTextsRef.current);
  };
  const syncMeals = () => {
    if (mealTextsRef.current) syncMealReminders(mealTextsRef.current);
  };

  // Старт и смена языка (тексты уведомлений зависят от языка)
  useEffect(() => {
    if (!isReminderPlatform()) return;
    syncWater();
    syncMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Явные запросы (вода/дневник/настройки изменились) + возврат в приложение + нажатие на уведомление
  useEffect(() => {
    if (!isReminderPlatform()) return;

    window.addEventListener(SYNC_EVENT, syncWater);
    window.addEventListener(MEAL_SYNC_EVENT, syncMeals);

    const handles = [
      // Возврат в приложение: часы/часовой пояс/дата могли смениться
      App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          syncWater();
          syncMeals();
        }
      }),
      // Нажатие на уведомление → открываем дневник
      LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
        const kind = event.notification.extra?.kind;
        if (kind === "water") track(AnalyticsEvent.WaterReminderOpened);
        else if (kind === "meal") track(AnalyticsEvent.MealReminderOpened);
        else return;
        router.push("/food-diary"); // проверьте, что маршрут совпадает с вашим
      }),
    ];

    return () => {
      window.removeEventListener(SYNC_EVENT, syncWater);
      window.removeEventListener(MEAL_SYNC_EVENT, syncMeals);
      handles.forEach((p) => p.then((h) => h.remove()).catch(() => {}));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}