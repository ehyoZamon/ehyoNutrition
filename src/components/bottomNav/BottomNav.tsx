"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAddFood } from "@/components/food-diary/addFoodProvider";
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

export default function BottomNav() {
  const t = useTranslations("navBar");
  const pathname = usePathname() ?? "";
  const { openAddFood } = useAddFood();

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
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            );
          }

          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles["nav-link"]} ${active ? styles["selected"] : ""}`}
              aria-current={active ? "page" : undefined}
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