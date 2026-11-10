"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { loadProductsIndex } from "@/lib/productsIndex";

// Страницы нижней навигации, которые нужно прогреть в фоне
const ROUTES = ["/food-diary", "/products", "/statistics", "/settings"];

const START_DELAY_MS = 800; // не мешаем первому экрану
const STEP_DELAY_MS = 250; // небольшая пауза между страницами

// Кэш Next по умолчанию живёт 300 с (staleTimes.static).
// Обновляем чуть раньше, чтобы он не успевал устареть.
// Если поменяли staleTimes.static в next.config — поправьте и это значение.
const REFRESH_MS = 280 * 1000;

export default function PagePrefetcher() {
  const router = useRouter();
  const locale = useLocale();

  // Заранее грузим каталог продуктов в кэш модуля, чтобы страница /products
  // открывалась сразу с данными, без спиннера внутри страницы
  useEffect(() => {
    loadProductsIndex(locale).catch((e) =>
      console.error("Не удалось предзагрузить продукты:", e)
    );
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    let lastRun = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const prefetchAll = () => {
      lastRun = Date.now();
      ROUTES.forEach((href, i) => {
        timers.push(
          setTimeout(() => {
            if (!cancelled) router.prefetch(href);
          }, i * STEP_DELAY_MS)
        );
      });
    };

    // Первый прогрев — когда браузер свободен
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const start = setTimeout(() => {
      if (ric) ric(prefetchAll, { timeout: 3000 });
      else prefetchAll();
    }, START_DELAY_MS);

    // Периодический повтор, пока приложение открыто
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") prefetchAll();
    }, REFRESH_MS);

    // Таймеры в фоне замораживаются, поэтому при возврате в приложение
    // проверяем, не истёк ли кэш, и обновляем сразу
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        lastRun > 0 &&
        Date.now() - lastRun >= REFRESH_MS
      ) {
        prefetchAll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(start);
      clearInterval(interval);
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null;
}