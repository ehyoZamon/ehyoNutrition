// components/NativeInit.tsx
"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

// Статус-бар (overlay и стиль) настраивается в capacitor.config.ts,
// здесь его повторно не трогаем — иначе WebView пересчитывает insets дважды.
const NativeInit = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const root = document.documentElement;
    const handles: Promise<{ remove: () => Promise<void> }>[] = [
      Keyboard.addListener("keyboardWillShow", () => root.classList.add("keyboard-open")),
      Keyboard.addListener("keyboardWillHide", () => root.classList.remove("keyboard-open")),
    ];

    return () => {
      handles.forEach((h) => h.then((l) => l.remove()).catch(() => {}));
      root.classList.remove("keyboard-open");
    };
  }, []);

  return null;
};

export default NativeInit;