"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAddFood } from "@/components/food-diary/addFoodProvider";
import { isNavigationSettling, usePageTransition } from "@/components/pageTransition/PageTransition";
import styles from "./BottomNav.module.css";

// Единственное место, где описаны пункты нижнего меню.
// Чтобы добавить/переименовать/переупорядочить пункт — правьте только этот массив.
// kind: "link" — обычная ссылка на страницу, "add" — центральная кнопка,
// открывающая AddFoodSheet поверх текущей страницы.
const ITEMS = [
  { kind: "link", href: "/products",   labelKey: "foods",      icon: "products",   iconActive: "products-green" },
  /*{ kind: "link", href: "/vitamins",   labelKey: "nutrients",  icon: "antioxidant", iconActive: "antioxidant-green" },*/
  { kind: "link", href: "/food-diary", labelKey: "foodDiary",  icon: "food-diary", iconActive: "food-diary-green" },
  { kind: "add",  labelKey: "add" },
  { kind: "link", href: "/statistics", labelKey: "statistics", icon: "statistics", iconActive: "statistics-green" },
  /*{ kind: "link", href: "/favorites",  labelKey: "favourites", icon: "heart",       iconActive: "heart-green" },*/
  { kind: "link", href: "/settings",   labelKey: "settings",   icon: "settings",   iconActive: "settings-green" },
] as const;

const indexOfPath = (p: string) =>
  ITEMS.findIndex(
    (i) => i.kind === "link" && (p === i.href || p.startsWith(`${i.href}/`))
  );

export default function BottomNav() {
  const t = useTranslations("navBar");
  const pathname = usePathname() ?? "";
  const { openAddFood } = useAddFood();
  const { navigate, pendingHref } = usePageTransition();
  // подсвечиваем вкладку сразу по нажатию, не дожидаясь открытия страницы
  const currentPath = pendingHref ?? pathname;

  const go = (item: (typeof ITEMS)[number]) => {
    if (item.kind !== "link") return;
    // Сравниваем с РЕАЛЬНОЙ текущей страницей, а не с ожидаемой (pendingHref):
    // иначе повторный тап по вкладке, переход к которой завис, игнорировался
    // бы здесь, и navigate() не мог бы его перезапустить. Дубли во время
    // нормального перехода отсекает сам navigate().
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return;
    const currentIdx = indexOfPath(pathname);
    const targetIdx = ITEMS.indexOf(item);
    // активная страница правее нажатой -> эффект влево, иначе вправо
    navigate(item.href, currentIdx > targetIdx ? "left" : "right");
  };

  return (
    <nav className={styles["navigation-container"]}>
      <div className={styles["navigation"]}>
        {ITEMS.map((item) => {
          if (item.kind === "add") {
            return (
              <button
                key="add"
                type="button"
                className={styles["add-btn"]}
                onClick={openAddFood}
                aria-label={t(item.labelKey)}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M14 5v18M5 14h18"
                    stroke="#fefefe"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            );
          }

          const active =
            currentPath === item.href || currentPath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles["nav-link"]} ${active ? styles["selected"] : ""}`}
              aria-current={active ? "page" : undefined}
              onPointerDown={(e) => {
                // переход стартует в момент касания, а не при отпускании пальца
                if (e.pointerType === "mouse" && e.button !== 0) return;
                go(item);
              }}
              onClick={(e) => {
                // страховка (клавиатура, программный клик); повтор после
                // pointerdown игнорируется внутри navigate
                e.preventDefault();
                // «Хвостовой» клик: переход уже стартовал на pointerdown, а палец
                // отпущен над другой кнопкой новой (ещё выезжающей) страницы.
                // Такой клик не должен вести на третью страницу.
                if (isNavigationSettling()) return;
                go(item);
              }}
            >
              <div className={styles["nav-bar"]}>
                <Image
                  src={`/main/${active ? item.iconActive : item.icon}.svg`}
                  alt=""
                  width={48}
                  height={48}
                />
              </div>
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}