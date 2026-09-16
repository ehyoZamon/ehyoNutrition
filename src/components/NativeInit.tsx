// components/NativeInit.tsx
"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

const NativeInit = () => {
  useEffect(() => {
    if (Capacitor.getPlatform() !== "android") return;

    StatusBar.setOverlaysWebView({ overlay: true });
    StatusBar.setStyle({ style: Style.Dark }); // тёмные иконки на светлом фоне
  }, []);

  return null;
};

export default NativeInit;