// components/WaterReminderSync.tsx
// Невидимый компонент: держит расписание напоминаний актуальным.
// Монтировать ОДИН раз в корневом layout, ВНУТРИ DBProvider и провайдера next-intl
// (ему нужны открытая БД и переводы).
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

export default function WaterReminderSync() {
  const t = useTranslations("WaterReminder");
  const locale = useLocale();
  const router = useRouter();

  // Свежие тексты без пересоздания слушателей
  const textsRef = useRef<ReminderTexts | null>(null);
  textsRef.current = {
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

  const sync = () => {
    if (textsRef.current) syncWaterReminders(textsRef.current);
  };

  // Старт и смена языка (тексты уведомлений зависят от языка)
  useEffect(() => {
    if (!isReminderPlatform()) return;
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Явные запросы (вода изменилась, настройки/профиль сохранены) + возврат в приложение
  useEffect(() => {
    if (!isReminderPlatform()) return;

    const onSyncRequest = () => sync();
    window.addEventListener(SYNC_EVENT, onSyncRequest);

    const handles = [
      // Возврат в приложение: часы/часовой пояс могли смениться
      App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) sync();
      }),
      // Нажатие на уведомление → открываем дневник
      LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
        if (event.notification.extra?.kind !== "water") return;
        track(AnalyticsEvent.WaterReminderOpened);
        router.push("/food-diary"); // проверьте, что маршрут совпадает с вашим
      }),
    ];

    return () => {
      window.removeEventListener(SYNC_EVENT, onSyncRequest);
      handles.forEach((p) => p.then((h) => h.remove()).catch(() => {}));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
