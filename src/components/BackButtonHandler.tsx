// components/BackButtonHandler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { runBackHandlers } from "@/lib/backHandler";

// Логи в консоль WebView (chrome://inspect). После отладки поставьте false.
const DEBUG = true;
const log = (...args: unknown[]) => {
  if (DEBUG) console.log("[back]", ...args);
};

// ГЛАВНЫЙ экран приложения
const ROOT_ROUTE = "/food-diary";

// Экраны, на которых "Назад" закрывает приложение
const EXIT_ROUTES = new Set<string>(["/", ROOT_ROUTE, "/walkthrough", "/onboardingInfo"]);

// Экраны нижней навигации: "Назад" возвращает на главный экран
const TAB_ROUTES = new Set<string>(["/products", "/statistics", "/settings"]);

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
    const native = Capacitor.isNativePlatform();
    log("init, native =", native);
    if (!native) return;

    let removed = false;
    let handle: PluginListenerHandle | undefined;

    App.addListener("backButton", ({ canGoBack }) => {
      const path = currentPath();
      log("pressed, path =", path, "canGoBack =", canGoBack);

      // 1) Открытые шторки/модалки/шаги онбординга (useBackHandler)
      if (runBackHandlers()) {
        log("handled by overlay");
        return;
      }

      // 2) Корневые экраны -> выход
      if (EXIT_ROUTES.has(path)) {
        log("exit app");
        App.exitApp();
        return;
      }

      // 3) Вкладки -> главный экран
      if (TAB_ROUTES.has(path)) {
        log("tab -> root");
        routerRef.current.replace(ROOT_ROUTE);
        return;
      }

      // 4) Остальные экраны -> назад по истории, иначе на главный
      if (canGoBack) {
        log("history back");
        routerRef.current.back();
      } else {
        log("no history -> root");
        routerRef.current.replace(ROOT_ROUTE);
      }
    })
      .then((h) => {
        log("listener registered");
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