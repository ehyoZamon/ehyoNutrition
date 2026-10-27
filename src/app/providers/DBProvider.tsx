// app/providers/DBProvider.tsx
"use client";
import { useEffect, useState } from "react";
import { initDB } from "@/lib/db";
import { hideSplash } from "@/lib/splash";
import styles from "./DBProvider.module.css";

// Если БД не открылась за это время — показываем ошибку вместо вечной загрузки
const DB_INIT_TIMEOUT_MS = 15000;

// Страховка: если по какой-то причине SplashGate так и не скрыл splash,
// скрываем его сами, чтобы он не висел вечно
const SPLASH_SAFETY_TIMEOUT_MS = DB_INIT_TIMEOUT_MS + 3000;

type Lang = "ru" | "en";

const TEXTS: Record<Lang, { loading: string; error: string; retry: string }> = {
  ru: {
    loading: "Загрузка базы данных...",
    error: "Не удалось загрузить базу данных.",
    retry: "Повторить",
  },
  en: {
    loading: "Loading database...",
    error: "Failed to load the database.",
    retry: "Retry",
  },
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("DB init timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

// Язык определяем сам: LanguageProvider находится ВНУТРИ DBProvider и ещё не доступен.
function detectLang(): Lang {
  try {
    const saved = localStorage.getItem("app_locale");
    if (saved === "ru" || saved === "en") return saved;
  } catch {
    /* localStorage может быть недоступен */
  }
  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export default function DBProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  // null до первого эффекта, чтобы не было hydration mismatch (страница предрендерена)
  const [lang, setLang] = useState<Lang | null>(null);

  useEffect(() => {
    setLang(detectLang());
  }, []);

  // Инициализация БД
  useEffect(() => {
    let cancelled = false;

    withTimeout(initDB(), DB_INIT_TIMEOUT_MS)
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err) => {
        console.error("Не удалось инициализировать БД:", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Страховка: splash не должен висеть вечно, даже если что-то пошло не так.
  // В обычном сценарии его скрывает SplashGate после редиректа с "/".
  useEffect(() => {
    const t = setTimeout(() => {
      hideSplash();
    }, SPLASH_SAFETY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  // При ошибке скрываем splash, чтобы пользователь увидел экран ошибки и кнопку «Повторить»
  useEffect(() => {
    if (status === "error") {
      hideSplash();
    }
  }, [status]);

  if (status === "loading") {
    // Пока нативный splash не скрыт, этот лоадер закрыт им и не виден.
    // Он нужен для web и для случая, когда сработала страховка.
    return (
      <div className={styles["loader-container"]}>
        <div className={styles["spinner"]} />
        <p className={styles["loader-text"]}>{lang ? TEXTS[lang].loading : ""}</p>
      </div>
    );
  }

  if (status === "error") {
    const t = TEXTS[lang ?? "en"];
    return (
      <div className={styles["loader-container"]}>
        <p className={styles["error-text"]}>{t.error}</p>
        <button
          type="button"
          className={styles["retry-button"]}
          onClick={() => window.location.reload()}
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}