"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  startTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./PageTransition.module.css";

export type Dir = "left" | "right";

interface Ctx {
  navigate: (href: string, dir: Dir) => void;
  /** Куда пользователь уже нажал, но страница ещё не открылась (для мгновенной подсветки) */
  pendingHref: string | null;
}

const PageTransitionContext = createContext<Ctx>({
  navigate: () => {},
  pendingHref: null,
});

export const usePageTransition = () => useContext(PageTransitionContext);

/**
 * Оставлен как пустая заглушка, чтобы не ломались страницы, где уже
 * добавлен вызов usePageLoading(...). Его можно удалить из страниц.
 */
export function usePageLoading(_isLoading: boolean) {}

const SLIDE_MS = 220;
const SLIDE_OFFSET_PERCENT = 30;

// «Окно успокоения» вокруг смены страницы. Пока оно открыто, случайные «хвостовые»
// клики (палец ещё на экране, а страница уже поменялась и под ним оказалась другая
// кнопка, например центральная «Add») не должны ничего запускать.
const SETTLE_MS = 450;
// Если переход к странице не завершился за это время — повторное нажатие на ту же
// вкладку снова разрешено (раньше оно игнорировалось до 5 с).
const STALL_MS = 1500;

let settleUntil = 0;
const markSettling = (ms: number) => {
  settleUntil = Math.max(settleUntil, performance.now() + ms);
};

/** true, пока идёт переход между страницами или только что закончился. */
export const isNavigationSettling = () =>
  typeof performance !== "undefined" && performance.now() < settleUntil;

// "/food-diary/" и "/food-diary" — одна и та же страница (trailingSlash в next.config)
const normalizePath = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const rootRef = useRef<HTMLDivElement>(null);
  const dirRef = useRef<Dir | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pendingSince = useRef(0);

  const navigate = useCallback(
    (href: string, dir: Dir) => {
      const target = normalizePath(href);
      if (target === normalizePath(pathname)) return;

      // Повторный тап по уже ожидаемой вкладке игнорируем, но только пока переход
      // «живой»: если он завис, даём запустить его заново.
      const stalled = performance.now() - pendingSince.current > STALL_MS;
      if (pendingHref !== null && target === normalizePath(pendingHref) && !stalled) return;

      dirRef.current = dir;
      pendingSince.current = performance.now();
      markSettling(SETTLE_MS);
      // срочное обновление: подсветка вкладки меняется сразу, не дожидаясь страницы
      setPendingHref(href);
      // transition: старая страница остаётся, пока новая не готова
      startTransition(() => {
        router.push(href);
      });
    },
    [router, pathname, pendingHref]
  );

  // Страница открылась -> снимаем «ожидание»
  useLayoutEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  // Страховка: если переход не состоялся, подсветка не должна застрять
  useEffect(() => {
    if (pendingHref === null) return;
    const id = setTimeout(() => setPendingHref(null), 5000);
    return () => clearTimeout(id);
  }, [pendingHref]);

  // Новая страница смонтирована -> плавно выезжает с нужной стороны
  useLayoutEffect(() => {
    // страница сменилась (любым способом) — открываем «окно успокоения»
    markSettling(SLIDE_MS + 250);

    const dir = dirRef.current;
    if (!dir) return;
    dirRef.current = null;

    const root = rootRef.current;
    if (!root) return;

    // Пока страница «выезжает», её кнопки смещены: тап в этот момент попадал бы
    // не в ту кнопку (в том числе в «Add»). Поэтому на время анимации отключаем
    // касания, а потом возвращаем.
    root.style.pointerEvents = "none";
    const restore = () => {
      root.style.pointerEvents = "";
    };

    const from = dir === "left" ? -SLIDE_OFFSET_PERCENT : SLIDE_OFFSET_PERCENT;
    const anim = root.animate(
      [
        { transform: `translateX(${from}%)`, opacity: 0.4 },
        { transform: "translateX(0)", opacity: 1 },
      ],
      {
        duration: SLIDE_MS,
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        fill: "backwards",
      }
    );
    anim.addEventListener("finish", restore);
    anim.addEventListener("cancel", restore);
    // страховка, если событие не придёт
    const safety = setTimeout(restore, SLIDE_MS + 120);

    return () => {
      clearTimeout(safety);
      restore();
    };
  }, [pathname]);

  return (
    <PageTransitionContext.Provider value={{ navigate, pendingHref }}>
      <div ref={rootRef} className={styles.root}>
        {children}
      </div>
    </PageTransitionContext.Provider>
  );
}