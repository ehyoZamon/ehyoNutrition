"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import styles from "./onboardingInfo.module.css";
import {
  Gender,
  getUserProfile,
  hasCompletedPersonalInfo,
  isValidHeight,
  isValidWeight,
  sanitizeHeightInput,
  sanitizeWeightInput,
  saveUserProfile,
} from "@/lib/userProfile";

// 1 — имя, 2 — пол, 3 — дата рождения, 4 — вес, 5 — рост
type Step = 1 | 2 | 3 | 4 | 5;
const STEPS: Step[] = [1, 2, 3, 4, 5];
const LAST_STEP: Step = 5;

// Для шагов 4–5 своих картинок пока нет — переиспользуем step-3.png.
// Когда появятся step-4.png / step-5.png, поменяй здесь.
const ILLUSTRATION_BY_STEP: Record<Step, string> = {
  1: "/onboarding/step-1.png",
  2: "/onboarding/step-2.png",
  3: "/onboarding/step-3.png",
  4: "/onboarding/step-3.png",
  5: "/onboarding/step-3.png",
};

// Приводит произвольный ввод цифр к маске DD.MM.YYYY и возвращает
// как отображаемую строку, так и (если дата полная и валидная) ISO yyyy-MM-dd.
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
      d.getUTCDate() === Number(day);
    return { display, iso: valid ? iso : null };
  }

  return { display, iso: null };
}

// Преобразует YYYY-MM-DD в DD.MM.YYYY для отображения
function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

const OnboardingInfoClient = () => {
  const router = useRouter();
  const t = useTranslations("OnboardingInfo");

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDateDisplay, setBirthDateDisplay] = useState("");
  const [birthDateIso, setBirthDateIso] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [saving, setSaving] = useState(false);

  const weightKg = isValidWeight(Number(weightInput)) ? Number(weightInput) : null;
  const heightCm = isValidHeight(Number(heightInput)) ? Number(heightInput) : null;

  // Если пользователь уже прошёл онбординг целиком — сразу пропускаем его.
  // Если он прошёл его в старой версии (имя/пол/дата есть, а веса и роста
  // ещё нет) — подставляем уже введённое и начинаем сразу с шага 4.
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const done = await hasCompletedPersonalInfo();
      if (cancelled) return;
      if (done) {
        router.replace("/food-diary");
        return;
      }

      const stored = await getUserProfile();
      if (cancelled || !stored?.name || !stored.birthDate) return;

      setName(stored.name);
      setGender(stored.gender);
      setBirthDateIso(stored.birthDate);
      setBirthDateDisplay(isoToDisplay(stored.birthDate));
      setStep(4);
    };
    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const canGoNext =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && gender !== null) ||
    (step === 3 && birthDateIso !== null) ||
    (step === 4 && weightKg !== null) ||
    (step === 5 && heightCm !== null);

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleNext = async () => {
    if (!canGoNext || saving) return;

    if (step < LAST_STEP) {
      setStep((s) => (s + 1) as Step);
      return;
    }

    if (!gender || !birthDateIso || weightKg === null || heightCm === null) return;

    setSaving(true);
    try {
      await saveUserProfile({
        name: name.trim(),
        gender,
        birthDate: birthDateIso,
        weightKg,
        heightCm,
      });
      router.replace("/food-diary");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles["onboarding-layout"]}>
      <div className={styles["ehyo-logo"]}>Ehyo</div>

      <div className={styles["step-dots"]} aria-hidden="true">
        {STEPS.map((s) => (
          <span
            key={s}
            className={[
              styles["step-dot"],
              s === step ? styles["step-dot--active"] : "",
            ].join(" ")}
          />
        ))}
      </div>

      <div className={styles["step-content"]}>
        {step === 1 && (
          <>
            <h2 className={styles["question-text"]}>{t("nameQuestion")}</h2>
            <input
              type="text"
              className={styles["field-input"]}
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles["question-text"]}>{t("genderQuestion")}</h2>
            <div className={styles["gender-row"]}>
              <button
                type="button"
                aria-pressed={gender === "male"}
                className={[
                  styles["gender-option"],
                  gender === "male" ? styles["gender-option--selected"] : "",
                ].join(" ")}
                onClick={() => setGender("male")}
              >
                {t("male")}
              </button>
              <button
                type="button"
                aria-pressed={gender === "female"}
                className={[
                  styles["gender-option"],
                  gender === "female" ? styles["gender-option--selected"] : "",
                ].join(" ")}
                onClick={() => setGender("female")}
              >
                {t("female")}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className={styles["question-text"]}>
              {t("birthdateQuestion")}
            </h2>
            <input
              type="text"
              inputMode="numeric"
              className={styles["field-input"]}
              placeholder={t("birthdatePlaceholder")}
              value={birthDateDisplay}
              onChange={(e) => {
                const { display, iso } = formatBirthDateInput(e.target.value);
                setBirthDateDisplay(display);
                setBirthDateIso(iso);
              }}
              autoFocus
            />
          </>
        )}

        {step === 4 && (
          <>
            <h2 className={styles["question-text"]}>{t("weightQuestion")}</h2>
            <div className={styles["field-wrap"]}>
              <input
                type="text"
                inputMode="decimal"
                className={styles["field-input"]}
                placeholder={t("weightPlaceholder")}
                value={weightInput}
                onChange={(e) => setWeightInput(sanitizeWeightInput(e.target.value))}
                autoFocus
              />
              <span className={styles["field-unit"]}>{t("kg")}</span>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className={styles["question-text"]}>{t("heightQuestion")}</h2>
            <div className={styles["field-wrap"]}>
              <input
                type="text"
                inputMode="numeric"
                className={styles["field-input"]}
                placeholder={t("heightPlaceholder")}
                value={heightInput}
                onChange={(e) => setHeightInput(sanitizeHeightInput(e.target.value))}
                autoFocus
              />
              <span className={styles["field-unit"]}>{t("cm")}</span>
            </div>
          </>
        )}

        <div className={styles["footer-row"]}>
          {step > 1 && (
            <button
              type="button"
              aria-label={t("back")}
              className={styles["back-button"]}
              onClick={handleBack}
            >
              <Image
                src="/onboarding/arrow-left.svg"
                alt=""
                width={20}
                height={20}
              />
            </button>
          )}

          <button
            type="button"
            className={styles["next-button"]}
            onClick={handleNext}
            disabled={!canGoNext || saving}
          >
            {t("next")}
          </button>
        </div>

        <Image
          src={ILLUSTRATION_BY_STEP[step]}
          alt=""
          width={600}
          height={400}
          className={styles.illustration}
        />
      </div>
    </div>
  );
};

export default OnboardingInfoClient;