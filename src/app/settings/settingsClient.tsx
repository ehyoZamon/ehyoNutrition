"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./settings.module.css";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import {
  Gender,
  UserProfile,
  getUserProfile,
  saveUserProfile,
} from "@/lib/userProfile";

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  gender: "male",
  birthDate: "",
};

// Функция форматирования и валидации даты (как в onboarding)
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

// Преобразует YYYY-MM-DD в DD.MM.YYYY для первичного отображения
function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}.${month}.${year}`;
}

const SettingsClient = () => {
  const t = useTranslations("Settings");

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [birthDateDisplay, setBirthDateDisplay] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const stored = await getUserProfile();
      if (stored) {
        setProfile(stored);
        if (stored.birthDate) {
          setBirthDateDisplay(isoToDisplay(stored.birthDate));
        }
      }
      setLoaded(true);
    };
    load();
  }, []);

  const persist = async (next: UserProfile) => {
    try {
      await saveUserProfile(next);
    } catch (e) {
      console.error("Не удалось сохранить профиль:", e);
    }
  };

  const handleNameChange = (value: string) => {
    setProfile((p) => ({ ...p, name: value }));
  };

  const handleNameBlur = () => {
    if (loaded) persist(profile);
  };

  const handleGenderChange = (value: Gender) => {
    const next = { ...profile, gender: value };
    setProfile(next);
    if (loaded) persist(next);
  };

  const handleBirthDateChange = (rawInput: string) => {
    const { display, iso } = formatBirthDateInput(rawInput);
    setBirthDateDisplay(display);

    if (iso) {
      const next = { ...profile, birthDate: iso };
      setProfile(next);
      if (loaded) persist(next);
    }
  };

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["header"]}>
        <h1 className={styles["page-title"]}>{t("title")}</h1>
      </div>
      
      <div className={styles["content-container"]}>
        <div className={styles["content"]}>
          {/* Avatar */}
          <div className={styles["avatar-wrapper"]}>
            <div className={styles["avatar-circle"]}>
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="28" cy="20" r="10" fill="#c9c5bd" />
                <path d="M8 50c0-12 9-18 20-18s20 6 20 18" fill="#c9c5bd" />
              </svg>
            </div>
          </div>
          

          {/* Name */}
          <input
            type="text"
            className={styles["field-input"]}
            value={profile.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
          />

          {/* Gender + Birth date */}
          <div className={styles["field-row"]}>
            <div className={styles["field-box"]}>
              <select
                className={styles["field-select"]}
                value={profile.gender}
                onChange={(e) => handleGenderChange(e.target.value as Gender)}
              >
                <option value="male">{t("male")}</option>
                <option value="female">{t("female")}</option>
              </select>
            </div>

            <div className={styles["field-box"]}>
              <input
                type="text"
                inputMode="numeric"
                className={styles["field-date-text-input"]}
                placeholder="ДД.ММ.ГГГГ"
                value={birthDateDisplay}
                onChange={(e) => handleBirthDateChange(e.target.value)}
              />
            </div>
          </div>

          {/* System language */}
          <div className={styles["language-row"]}>
            <span className={styles["language-label"]}>
              {t("systemLanguage")}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className={styles["navigation-container"]}>
        <div className={styles["navigation"]}>
          <Link prefetch={false} className={styles["nav-link"]} href="/products">
            <Image src="/main/products.svg" alt="products" width={48} height={48} />
          </Link>
          <Link prefetch={false} className={styles["nav-link"]} href="/vitamins">
            <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
          </Link>
          <Link prefetch={false} className={styles["nav-link"]} href="/food-diary">
            <Image src="/main/food-diary.svg" alt="food-diary" width={48} height={48} />
          </Link>
          <Link prefetch={false} className={styles["nav-link"]} href="/favorites">
            <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
          </Link>
          <Link
            className={styles["nav-link"]}
            href="/settings"
            aria-current="page"
            prefetch={false}
          >
            <Image src="/main/settings-green.svg" alt="settings" width={48} height={48} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SettingsClient;