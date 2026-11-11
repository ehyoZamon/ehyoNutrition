"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Рендерит детей прямо в <body>, вне любых предков с transform / z-index.
// Нужен шторкам (position: fixed), чтобы их z-index сравнивался с навбаром
// в одном корневом контексте наложения. По React-дереву дети остаются
// внутри своих провайдеров, так что контексты работают как раньше.
export default function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
