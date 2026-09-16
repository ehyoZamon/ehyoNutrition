"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import styles from "./onboardingInfo.module.css";
import {
  Gender,
  hasCompletedPersonalInfo,
  saveUserProfile,
} from "@/lib/userProfile";

type Step = 1 | 2 | 3;

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

const OnboardingInfoClient = () => {
  const router = useRouter();
  const t = useTranslations("OnboardingInfo");

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDateDisplay, setBirthDateDisplay] = useState("");
  const [birthDateIso, setBirthDateIso] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Если пользователь уже прошёл этот шаг раньше — сразу пропускаем его.
  useEffect(() => {
    const check = async () => {
      const done = await hasCompletedPersonalInfo();
      if (done) {
        router.replace("/food-diary");
      }
    };
    check();
  }, [router]);

  const canGoNext =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && gender !== null) ||
    (step === 3 && birthDateIso !== null);

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleNext = async () => {
    if (!canGoNext || saving) return;

    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      return;
    }

    if (!gender || !birthDateIso) return;

    setSaving(true);
    try {
      await saveUserProfile({
        name: name.trim(),
        gender,
        birthDate: birthDateIso,
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
        {[1, 2, 3].map((s) => (
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
        {/* NB: путь к иллюстрации — заглушка, подставь реальный ассет */}
        

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
          src={`/onboarding/step-${step}.png`}
          alt=""
          width={600}
          height={400 }
          className={styles.illustration}
        />
      </div>

      
    </div>
  );
};

export default OnboardingInfoClient;
