// components/BackButtonHandler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { runBackHandlers } from "@/lib/backHandler";

// Логи в консоль WebView (chrome://inspect). Для отладки поставьте true.
const DEBUG = false;
const log = (...args: unknown[]) => {
  if (DEBUG) console.log("[back]", ...args);
};

// Главный экран приложения
const ROOT_ROUTE = "/food-diary";

// Экраны, откуда "Назад" ВСЕГДА закрывает приложение (в историю на них не возвращаемся)
const ALWAYS_EXIT_ROUTES = new Set<string>(["/", "/walkthrough", "/onboardingInfo"]);

// Реальный путь из адреса WebView (не зависит от состояния React/Next)
const currentPath = (): string => {
  let path = window.location.pathname || "/";
  path = path.replace(/\.html$/, "").replace(/\/index$/, "");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path || "/";
};

export default function BackButtonHandler() {
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removed = false;
    let handle: PluginListenerHandle | undefined;

    App.addListener("backButton", ({ canGoBack }) => {
      const path = currentPath();
      log("pressed, path =", path, "canGoBack =", canGoBack);

      // 1) Открытые шторки/модалки/шаги онбординга (useBackHandler)
      if (runBackHandlers()) return;

      // 2) Онбординг и стартовые экраны -> выход
      if (ALWAYS_EXIT_ROUTES.has(path)) {
        App.exitApp();
        return;
      }

      // 3) Обычная цепочка: назад по истории (food-diary -> products -> settings -> products -> ...)
      if (canGoBack) {
        routerRef.current.back();
        return;
      }

      // 4) Истории нет: на главном экране выходим, с любого другого — на главный
      if (path === ROOT_ROUTE) {
        App.exitApp();
      } else {
        routerRef.current.replace(ROOT_ROUTE);
      }
    })
      .then((h) => {
        if (removed) h.remove();
        else handle = h;
      })
      .catch((error) => console.error("[back] addListener failed:", error));

    return () => {
      removed = true;
      handle?.remove();
    };
  }, []);

  return null;
}