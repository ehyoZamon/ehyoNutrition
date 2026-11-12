// components/settings/mealReminderSettings.tsx
// Блок "Напоминания о еде" для страницы /settings (ставится под блоком напоминаний о воде).
// Стили общие с блоком воды — импортируется тот же waterReminderSettings.module.css.
// На вебе в продакшене не показывается; в режиме разработки виден (для проверки интерфейса).
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./reminderSettings.module.css";
import { AnalyticsEvent, track } from "@/lib/analytics";
import { ensureNotificationPermission, isReminderPlatform } from "@/lib/waterReminders";
import {
  MEAL_KEYS,
  loadMealReminderSettings,
  saveMealReminderSettings,
  type MealReminderSettings,
  type ReminderMeal,
} from "@/lib/mealReminders";
import { requestMealReminderSync } from "@/lib/reminderEvents";

const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const fromHHMM = (value: string): number | null => {
  const [h, m] = value.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

const canShow = () => isReminderPlatform() || process.env.NODE_ENV === "development";

export default function MealReminderSettingsBlock() {
  const t = useTranslations("MealReminder");
  const [settings, setSettings] = useState<MealReminderSettings | null>(null);
  const [denied, setDenied] = useState(false);

  // Читаем только на клиенте, чтобы не было hydration mismatch
  useEffect(() => {
    if (canShow()) setSettings(loadMealReminderSettings());
  }, []);

  if (!settings) return null;

  const update = (next: MealReminderSettings) => {
    setSettings(next);
    saveMealReminderSettings(next);
    requestMealReminderSync();
  };

  const handleToggle = async (checked: boolean) => {
    // В браузере (dev-превью) системного разрешения нет — пропускаем запрос
    if (checked && isReminderPlatform()) {
      const result = await ensureNotificationPermission();
      if (result !== "granted") {
        setDenied(true);
        track(AnalyticsEvent.MealReminderPermissionDenied);
        return;
      }
      setDenied(false);
    }
    update({ ...settings, enabled: checked });
    track(checked ? AnalyticsEvent.MealReminderEnabled : AnalyticsEvent.MealReminderDisabled);
  };

  const handleTime = (meal: ReminderMeal, value: string) => {
    const minutes = fromHHMM(value);
    if (minutes === null) return;
    update({ ...settings, times: { ...settings.times, [meal]: minutes } });
    track(AnalyticsEvent.MealReminderSettingsChanged, { meal_type: meal });
  };

  return (
    <div className={styles["section"]}>
      <div className={styles["header-row"]}>
        <div className={styles["text"]}>
          <span className={styles["title"]}>{t("title")}</span>
          <p className={styles["hint"]}>{t("hint")}</p>
        </div>
        <label className={styles["switch"]}>
          <input
            type="checkbox"
            role="switch"
            className={styles["switch-input"]}
            checked={settings.enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            aria-label={t("title")}
          />
          <span className={styles["switch-slider"]} />
        </label>
      </div>

      {denied && <p className={styles["denied"]}>{t("permissionDenied")}</p>}

      {settings.enabled && (
        <div className={styles["options"]}>
          <div className={styles["time-row"]}>
            {MEAL_KEYS.map((meal) => (
              <label key={meal} className={styles["time-box"]}>
                <span className={styles["time-label"]}>{t(meal)}</span>
                <input
                  type="time"
                  className={styles["time-input"]}
                  value={toHHMM(settings.times[meal])}
                  onChange={(e) => handleTime(meal, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
