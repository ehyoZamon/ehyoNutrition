"use client";

// components/AnalyticsTracker.tsx
// Ставится один раз в layout.tsx. Отслеживает:
//  - просмотры экранов (смена pathname)
//  - время в приложении (интервалы foreground -> background)

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import {
  AnalyticsEvent,
  initAnalytics,
  track,
  trackScreen,
} from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const activeSince = useRef<number>(Date.now());

  // Инициализация SDK по сохранённому согласию
  useEffect(() => {
    initAnalytics();
  }, []);

  // Просмотры экранов
  useEffect(() => {
    if (!pathname) return;
    trackScreen(pathname);
    track(AnalyticsEvent.ScreenView, { screen_name: pathname });
  }, [pathname]);

  // Время в приложении
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    activeSince.current = Date.now();
    track(AnalyticsEvent.AppForeground);

    const handle = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        activeSince.current = Date.now();
        track(AnalyticsEvent.AppForeground);
      } else {
        const seconds = Math.round((Date.now() - activeSince.current) / 1000);
        track(AnalyticsEvent.AppBackground, { session_seconds: seconds });
      }
    });

    return () => {
      handle.then((h) => h.remove());
    };
  }, []);

  return null;
}
