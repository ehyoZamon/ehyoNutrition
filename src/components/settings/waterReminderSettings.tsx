// components/settings/waterReminderSettings.tsx
// Блок "Напоминания о воде" для страницы /settings.
// На вебе (не нативная платформа) в продакшене не показывается: локальные уведомления там
// не работают. В режиме разработки (npm run dev) блок виден и в браузере — чтобы можно
// было проверять интерфейс; реальные уведомления при этом, конечно, не планируются.
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./reminderSettings.module.css";
import { AnalyticsEvent, track } from "@/lib/analytics";
import {
  INTERVAL_OPTIONS_MIN,
  MIN_WINDOW_MIN,
  ensureNotificationPermission,
  isReminderPlatform,
  loadWaterReminderSettings,
  requestWaterReminderSync,
  saveWaterReminderSettings,
  type ReminderInterval,
  type WaterReminderSettings,
} from "@/lib/waterReminders";

const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const fromHHMM = (value: string): number | null => {
  const [h, m] = value.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

const canShow = () => isReminderPlatform() || process.env.NODE_ENV === "development";

const INTERVAL_KEY: Record<ReminderInterval, string> = {
  90: "interval90",
  120: "interval120",
  180: "interval180",
};

export default function WaterReminderSettingsBlock() {
  const t = useTranslations("WaterReminder");
  const [settings, setSettings] = useState<WaterReminderSettings | null>(null);
  const [denied, setDenied] = useState(false);

  // Читаем только на клиенте, чтобы не было hydration mismatch
  useEffect(() => {
    if (canShow()) setSettings(loadWaterReminderSettings());
  }, []);

  if (!settings) return null;

  const update = (next: WaterReminderSettings) => {
    setSettings(next);
    saveWaterReminderSettings(next);
    requestWaterReminderSync();
  };

  const handleToggle = async (checked: boolean) => {
    // В браузере (dev-превью) системного разрешения нет — пропускаем запрос
    if (checked && isReminderPlatform()) {
      // Разрешение просим только в момент, когда пользователь сам включил функцию
      const result = await ensureNotificationPermission();
      if (result !== "granted") {
        setDenied(true);
        track(AnalyticsEvent.WaterReminderPermissionDenied);
        return;
      }
      setDenied(false);
    }
    update({ ...settings, enabled: checked });
    track(checked ? AnalyticsEvent.WaterReminderEnabled : AnalyticsEvent.WaterReminderDisabled, {
      interval_min: settings.intervalMin,
    });
  };

  const handleInterval = (intervalMin: ReminderInterval) => {
    if (intervalMin === settings.intervalMin) return;
    update({ ...settings, intervalMin });
    track(AnalyticsEvent.WaterReminderSettingsChanged, { field: "interval" });
  };

  const handleTime = (field: "startMin" | "endMin", value: string) => {
    const minutes = fromHHMM(value);
    if (minutes === null) return;
    const next = { ...settings, [field]: minutes };
    // Окно должно вмещать хотя бы одно напоминание; иначе игнорируем ввод
    if (next.endMin - next.startMin < MIN_WINDOW_MIN) return;
    update(next);
    track(AnalyticsEvent.WaterReminderSettingsChanged, {
      field: field === "startMin" ? "start" : "end",
    });
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
          <div className={styles["chips"]} role="radiogroup" aria-label={t("intervalLabel")}>
            {INTERVAL_OPTIONS_MIN.map((min) => (
              <button
                key={min}
                type="button"
                role="radio"
                aria-checked={settings.intervalMin === min}
                className={`${styles["chip"]} ${
                  settings.intervalMin === min ? styles["chip-active"] : ""
                }`}
                onClick={() => handleInterval(min)}
              >
                {t(INTERVAL_KEY[min])}
              </button>
            ))}
          </div>

          <div className={styles["time-row"]}>
            <label className={styles["time-box"]}>
              <span className={styles["time-label"]}>{t("from")}</span>
              <input
                type="time"
                className={styles["time-input"]}
                value={toHHMM(settings.startMin)}
                onChange={(e) => handleTime("startMin", e.target.value)}
              />
            </label>
            <label className={styles["time-box"]}>
              <span className={styles["time-label"]}>{t("to")}</span>
              <input
                type="time"
                className={styles["time-input"]}
                value={toHHMM(settings.endMin)}
                onChange={(e) => handleTime("endMin", e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}