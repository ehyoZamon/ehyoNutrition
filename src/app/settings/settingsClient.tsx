"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import styles from "./settings.module.css";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import {
  Gender,
  UserProfile,
  getUserProfile,
  isValidHeight,
  isValidWeight,
  sanitizeHeightInput,
  sanitizeWeightInput,
  saveUserProfile,
} from "@/lib/userProfile";
import { BackupError, exportBackup, importBackup } from "@/lib/backup";
import {
  AnalyticsEvent,
  isAnalyticsEnabled,
  setAnalyticsEnabled,
  track,
} from "@/lib/analytics";
import WaterReminderSettingsBlock from "@/components/settings/waterReminderSettings";
import { requestWaterReminderSync } from "@/lib/waterReminders";
import MealReminderSettingsBlock from "@/components/settings/mealReminderSettings";

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  gender: "male",
  birthDate: "",
};

const MIN_BIRTH_YEAR = 1900;

type SaveState = "idle" | "saving" | "saved" | "error";
type FieldKey = "birthDate" | "weight" | "height";
type Screen = "backup" | "reminders";
const SCREENS: Screen[] = ["backup", "reminders"];

const readScreen = (): Screen | null => {
  const hash = window.location.hash.slice(1) as Screen;
  return SCREENS.includes(hash) ? hash : null;
};

// Форматирование и валидация даты: ДД.ММ.ГГГГ -> ISO.
// Дата должна существовать, не быть в будущем и не раньше MIN_BIRTH_YEAR.
function formatBirthDateInput(raw: string): {
  display: string;
  iso: string | null;
} {
  const digits = raw.replace(/\D/g, "").slice(0, 8);

  let display = digits;
  if (digits.length > 4) {
    display = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  } else if (digits.length > 2) {
    display = `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length === 8) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    const valid =
      !Number.isNaN(d.getTime()) &&
      d.getUTCFullYear() === Number(year) &&
      d.getUTCMonth() + 1 === Number(month) &&
      d.getUTCDate() === Number(day) &&
      Number(year) >= MIN_BIRTH_YEAR &&
      d.getTime() <= Date.now();
    return { display, iso: valid ? iso : null };
  }

  return { display, iso: null };
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles["field"]}>
      <label className={styles["field-label"]} htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={styles["field-error"]} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className={styles["chevron"]}
      width="8"
      height="14"
      viewBox="0 0 8 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles["list-row"]} onClick={onClick}>
      <span className={styles["list-label"]}>{label}</span>
      {value && <span className={styles["list-value"]}>{value}</span>}
      <Chevron />
    </button>
  );
}

const SettingsClient = () => {
  const t = useTranslations("Settings");
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    gender: `${uid}-gender`,
    birth: `${uid}-birth`,
    weight: `${uid}-weight`,
    height: `${uid}-height`,
    dialog: `${uid}-dialog`,
  };

  // ---------- Навигация между экранами ----------
  // Экран хранится в hash (#backup): работает кнопка «Назад» (в т.ч. Android) и обновление страницы
  const [screen, setScreen] = useState<Screen | null>(null);
  const pushedRef = useRef(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScreen(readScreen());
    const onHashChange = () => setScreen(readScreen());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    layoutRef.current?.scrollTo(0, 0);
  }, [screen]);

  const openScreen = (next: Screen) => {
    pushedRef.current = true;
    window.location.hash = next;
  };

  const goBack = () => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      // Страницу открыли сразу на подэкране (обновление/ссылка) — истории назад нет
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      setScreen(null);
    }
  };

  // Смена языка: переключатель — отдельный компонент, поэтому ловим смену локали здесь
  const locale = useLocale();
  const prevLocale = useRef(locale);
  useEffect(() => {
    if (prevLocale.current !== locale) {
      prevLocale.current = locale;
      track(AnalyticsEvent.LanguageChanged, { language: locale });
    }
  }, [locale]);

  // ---------- Профиль ----------
  // profileRef всегда хранит актуальный профиль: исключает гонки между blur/change
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const profileRef = useRef<UserProfile>(DEFAULT_PROFILE);
  const [nameDisplay, setNameDisplay] = useState("");
  const [birthDateDisplay, setBirthDateDisplay] = useState("");
  const [weightDisplay, setWeightDisplay] = useState("");
  const [heightDisplay, setHeightDisplay] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const setFieldError = (key: FieldKey, message?: string) =>
    setErrors((prev) => ({ ...prev, [key]: message }));

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getUserProfile();
        if (stored) {
          profileRef.current = stored;
          setProfile(stored);
          setNameDisplay(stored.name ?? "");
          setBirthDateDisplay(isoToDisplay(stored.birthDate));
          if (stored.weightKg != null) setWeightDisplay(String(stored.weightKg));
          if (stored.heightCm != null) setHeightDisplay(String(stored.heightCm));
        }
      } catch (e) {
        console.error("Не удалось загрузить профиль:", e);
        setSaveState("error");
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  // Единая точка сохранения: сравнивает с текущим профилем, шлёт событие и пишет в хранилище
  const commit = async (patch: Partial<UserProfile>, field: string) => {
    const current = profileRef.current;
    const changed = (Object.keys(patch) as (keyof UserProfile)[]).some(
      (k) => patch[k] !== current[k],
    );
    if (!changed) return;

    const next = { ...current, ...patch };
    profileRef.current = next;
    setProfile(next);
    track(AnalyticsEvent.ProfileUpdated, { field });

    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSaveState("saving");
    try {
      await saveUserProfile(next);
      // Вес и пол меняют норму воды — обновляем расписание напоминаний
      requestWaterReminderSync();
      setSaveState("saved");
      savedTimer.current = setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      console.error("Не удалось сохранить профиль:", e);
      setSaveState("error");
    }
  };

  const handleNameBlur = () => {
    const trimmed = nameDisplay.trim();
    setNameDisplay(trimmed);
    commit({ name: trimmed }, "name");
  };

  const handleGenderChange = (value: Gender) => {
    commit({ gender: value }, "gender");
  };

  const handleBirthDateChange = (raw: string) => {
    const { display, iso } = formatBirthDateInput(raw);
    setBirthDateDisplay(display);

    if (display === "") {
      // Поле можно очистить
      setFieldError("birthDate");
      commit({ birthDate: "" }, "birth_date");
    } else if (display.replace(/\D/g, "").length === 8) {
      if (iso) {
        setFieldError("birthDate");
        commit({ birthDate: iso }, "birth_date");
      } else {
        setFieldError("birthDate", t("birthDateInvalid"));
      }
    } else {
      setFieldError("birthDate");
    }
  };

  const handleBirthDateBlur = () => {
    if (birthDateDisplay && !formatBirthDateInput(birthDateDisplay).iso) {
      setFieldError("birthDate", t("birthDateInvalid"));
    }
  };

  // Вес/рост сохраняем при потере фокуса: промежуточные значения ("7", "15") невалидны.
  // Пустое поле = значение удалено; невалидное — показываем ошибку и не сохраняем.
  const handleWeightBlur = () => {
    const raw = weightDisplay.trim();
    if (raw === "") {
      setFieldError("weight");
      commit({ weightKg: undefined }, "weight");
      return;
    }
    const value = Number(raw);
    if (isValidWeight(value)) {
      setFieldError("weight");
      setWeightDisplay(String(value));
      commit({ weightKg: value }, "weight");
    } else {
      setFieldError("weight", t("weightInvalid"));
    }
  };

  const handleHeightBlur = () => {
    const raw = heightDisplay.trim();
    if (raw === "") {
      setFieldError("height");
      commit({ heightCm: undefined }, "height");
      return;
    }
    const value = Number(raw);
    if (isValidHeight(value)) {
      setFieldError("height");
      setHeightDisplay(String(value));
      commit({ heightCm: value }, "height");
    } else {
      setFieldError("height", t("heightInvalid"));
    }
  };

  const blurOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  // ---------- Аналитика ----------
  // null, пока состояние не прочитано: переключатель не мигает неверным значением
  const [analyticsOn, setAnalyticsOn] = useState<boolean | null>(null);
  useEffect(() => {
    setAnalyticsOn(isAnalyticsEnabled());
  }, []);

  const handleAnalyticsToggle = async (checked: boolean) => {
    const previous = analyticsOn;
    setAnalyticsOn(checked);
    try {
      await setAnalyticsEnabled(checked);
      // Только включение: после отказа ничего не отправляем
      if (checked) track(AnalyticsEvent.AnalyticsEnabled);
    } catch (e) {
      console.error("Не удалось изменить согласие на аналитику:", e);
      setAnalyticsOn(previous);
      setSaveState("error");
    }
  };

  // ---------- Резервная копия ----------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  // Нативный <dialog>: фокус-ловушка, Escape и затемнение работают из коробки
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pendingFile && !dialog.open) dialog.showModal();
    if (!pendingFile && dialog.open) dialog.close();
  }, [pendingFile]);

  const handleExport = async () => {
    setBackupBusy(true);
    setBackupStatus(null);
    try {
      await exportBackup();
      track(AnalyticsEvent.BackupExport);
      setBackupStatus({ kind: "ok", text: t("exportDone") });
    } catch (e) {
      console.error("Ошибка экспорта:", e);
      // Закрытие системного меню «Поделиться» пользователем — не ошибка
      const msg = e instanceof Error ? e.message.toLowerCase() : "";
      if (!msg.includes("cancel")) {
        track(AnalyticsEvent.BackupExportFailed);
        setBackupStatus({ kind: "error", text: t("exportError") });
      }
    } finally {
      setBackupBusy(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // позволяет выбрать тот же файл повторно
    if (file) setPendingFile(file);
  };

  const confirmImport = async () => {
    const file = pendingFile;
    setPendingFile(null);
    if (!file) return;

    setBackupBusy(true);
    setBackupStatus(null);
    try {
      await importBackup(file);
      track(AnalyticsEvent.BackupImport);
      // Перезагружаем, чтобы все страницы и соединение с БД поднялись с новыми данными
      window.location.reload();
    } catch (err) {
      console.error("Ошибка импорта:", err);
      const key =
        err instanceof BackupError && err.code === "too-new"
          ? "importTooNew"
          : err instanceof BackupError
            ? "importInvalid"
            : "importError";
      track(AnalyticsEvent.BackupImportFailed, { reason: key });
      setBackupStatus({ kind: "error", text: t(key) });
      setBackupBusy(false);
    }
  };

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL;

  const saveText =
    saveState === "saving"
      ? t("saving")
      : saveState === "saved"
        ? t("saved")
        : saveState === "error"
          ? t("saveError")
          : "";

  const screenTitle =
    screen === "backup"
      ? t("backupTitle")
      : screen === "reminders"
        ? t("remindersTitle")
        : t("title");

  return (
    <div className={styles["main-layout"]} ref={layoutRef}>
      <div className={styles["header"]}>
        {screen && (
          <button
            type="button"
            className={styles["back-btn"]}
            onClick={goBack}
            aria-label={t("back")}
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
              <path
                d="M8.5 1.5L2 8l6.5 6.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h1 className={styles["page-title"]}>{screenTitle}</h1>
        <p
          className={styles["save-status"]}
          data-state={saveState}
          role="status"
          aria-live="polite"
        >
          {saveText}
        </p>
      </div>

      <div className={styles["content-container"]}>
        {/* ---------- Главный экран: список ---------- */}
        {screen === null && (
          <div className={styles["list-stack"]}>
            <div className={styles["profile-block"]}>
              <Field id={ids.name} label={t("nameLabel")}>
                <input
                  id={ids.name}
                  type="text"
                  className={styles["control"]}
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
                  maxLength={50}
                  enterKeyHint="done"
                  disabled={!loaded}
                  value={nameDisplay}
                  onChange={(e) => setNameDisplay(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={blurOnEnter}
                />
              </Field>

              <div className={styles["field-row"]}>
                <Field id={ids.gender} label={t("genderLabel")}>
                  <select
                    id={ids.gender}
                    className={`${styles["control"]} ${styles["control-select"]}`}
                    disabled={!loaded}
                    value={profile.gender}
                    onChange={(e) => handleGenderChange(e.target.value as Gender)}
                  >
                    <option value="male">{t("male")}</option>
                    <option value="female">{t("female")}</option>
                  </select>
                </Field>

                <Field id={ids.birth} label={t("birthDateLabel")} error={errors.birthDate}>
                  <input
                    id={ids.birth}
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday"
                    className={styles["control"]}
                    placeholder={t("birthDatePlaceholder")}
                    disabled={!loaded}
                    value={birthDateDisplay}
                    aria-invalid={errors.birthDate ? true : undefined}
                    aria-describedby={errors.birthDate ? `${ids.birth}-error` : undefined}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    onBlur={handleBirthDateBlur}
                    onKeyDown={blurOnEnter}
                  />
                </Field>
              </div>

              <div className={styles["field-row"]}>
                <Field id={ids.weight} label={t("weightPlaceholder")} error={errors.weight}>
                  <div className={styles["input-wrap"]}>
                    <input
                      id={ids.weight}
                      type="text"
                      inputMode="decimal"
                      className={`${styles["control"]} ${styles["control-unit"]}`}
                      disabled={!loaded}
                      value={weightDisplay}
                      aria-invalid={errors.weight ? true : undefined}
                      aria-describedby={errors.weight ? `${ids.weight}-error` : undefined}
                      onChange={(e) => {
                        setWeightDisplay(sanitizeWeightInput(e.target.value));
                        setFieldError("weight");
                      }}
                      onBlur={handleWeightBlur}
                      onKeyDown={blurOnEnter}
                    />
                    <span className={styles["unit"]} aria-hidden="true">
                      {t("kg")}
                    </span>
                  </div>
                </Field>

                <Field id={ids.height} label={t("heightPlaceholder")} error={errors.height}>
                  <div className={styles["input-wrap"]}>
                    <input
                      id={ids.height}
                      type="text"
                      inputMode="numeric"
                      className={`${styles["control"]} ${styles["control-unit"]}`}
                      disabled={!loaded}
                      value={heightDisplay}
                      aria-invalid={errors.height ? true : undefined}
                      aria-describedby={errors.height ? `${ids.height}-error` : undefined}
                      onChange={(e) => {
                        setHeightDisplay(sanitizeHeightInput(e.target.value));
                        setFieldError("height");
                      }}
                      onBlur={handleHeightBlur}
                      onKeyDown={blurOnEnter}
                    />
                    <span className={styles["unit"]} aria-hidden="true">
                      {t("cm")}
                    </span>
                  </div>
                </Field>
              </div>

              <p className={styles["hint"]}>{t("profileHint")}</p>
            </div>

            <div className={styles["list-group"]}>
              <NavRow
                label={t("remindersTitle")}
                onClick={() => openScreen("reminders")}
              />
              <div className={styles["list-row-static"]}>
                <span className={styles["list-label"]}>{t("systemLanguage")}</span>
                <LanguageSwitcher />
              </div>
            </div>

            <div className={styles["list-group"]}>
              <NavRow label={t("backupTitle")} onClick={() => openScreen("backup")} />
            </div>

            <div className={styles["list-group"]}>
              <label className={styles["list-row-static"]}>
                <span id={`${uid}-analytics`} className={styles["list-label"]}>
                  {t("analyticsTitle")}
                </span>
                <span className={styles["switch"]}>
                  <input
                    type="checkbox"
                    role="switch"
                    className={styles["switch-input"]}
                    checked={analyticsOn ?? false}
                    disabled={analyticsOn === null}
                    onChange={(e) => handleAnalyticsToggle(e.target.checked)}
                    aria-labelledby={`${uid}-analytics`}
                    aria-describedby={`${uid}-analytics-hint`}
                  />
                  <span className={styles["switch-slider"]} aria-hidden="true" />
                </span>
              </label>
            </div>
            <p
              id={`${uid}-analytics-hint`}
              className={`${styles["hint"]} ${styles["footnote"]}`}
            >
              {t("analyticsHint")}
            </p>

            {(privacyUrl || appVersion) && (
              <div className={styles["list-group"]}>
                {privacyUrl && (
                  <a
                    className={styles["list-row"]}
                    href={privacyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={styles["list-label"]}>{t("privacyPolicy")}</span>
                    <Chevron />
                  </a>
                )}
                {appVersion && (
                  <div className={styles["list-row-static"]}>
                    <span className={styles["list-label"]}>{t("version")}</span>
                    <span className={styles["list-value"]}>{appVersion}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---------- Напоминания ---------- */}
        {screen === "reminders" && (
          <div className={styles["screen"]}>
            <WaterReminderSettingsBlock />
            <MealReminderSettingsBlock />
          </div>
        )}

        {/* ---------- Резервная копия ---------- */}
        {screen === "backup" && (
          <div className={styles["screen"]}>
            <p className={styles["hint"]}>{t("backupHint")}</p>
            <div className={styles["button-row"]}>
              <button
                type="button"
                className={styles["btn"]}
                onClick={handleExport}
                disabled={backupBusy}
              >
                {t("exportData")}
              </button>
              <button
                type="button"
                className={styles["btn"]}
                onClick={() => fileInputRef.current?.click()}
                disabled={backupBusy}
              >
                {t("importData")}
              </button>
            </div>
            {backupStatus && (
              <p
                className={`${styles["backup-status"]} ${
                  backupStatus.kind === "ok"
                    ? styles["backup-status-ok"]
                    : styles["backup-status-error"]
                }`}
                role={backupStatus.kind === "ok" ? "status" : "alert"}
              >
                {backupStatus.text}
              </p>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className={styles["file-input"]}
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleImportFile}
      />

      {/* Подтверждение импорта */}
      <dialog
        ref={dialogRef}
        className={styles["dialog"]}
        aria-labelledby={ids.dialog}
        onClose={() => setPendingFile(null)}
      >
        <p id={ids.dialog} className={styles["dialog-text"]}>
          {t("importConfirm")}
        </p>
        <div className={styles["button-row"]}>
          <button
            type="button"
            className={styles["btn"]}
            onClick={() => setPendingFile(null)}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            className={`${styles["btn"]} ${styles["btn-danger"]}`}
            onClick={confirmImport}
          >
            {t("importData")}
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default SettingsClient;