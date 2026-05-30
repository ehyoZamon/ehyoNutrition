"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./main.module.css";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FAVORITE_LINKS = [
  { key: "fruits" as const, href: "/products?category=fruits", className: "" },
  {
    key: "vegetables" as const,
    href: "/products?category=vegetables",
    className: styles.vegetables,
  },
  { key: "snack" as const, href: "/products?category=snack", className: styles.snack },
] as const;

const FAVORITE_ICONS = {
  fruits: { src: "/main/strawberry.svg", width: 32, height: 48 },
  vegetables: { src: "/main/vegetables.svg", width: 50, height: 48 },
  snack: { src: "/main/snack.svg", width: 48, height: 48 },
} as const;

const MainClient = () => {
  const t = useTranslations("Main");

  return (
    <div className={styles["main-layout"]}>
      <LanguageSwitcher />
      <div className={styles.welcome}>
        <h2>{t("hello")}</h2>
        <p>{t("subtitle")}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.articles}>
          <div className={styles["article-content"]}>
            <div className={styles["article-label"]}>{t("articleLabel")}</div>
            <div className={styles["article-name"]}>{t("articleTitle")}</div>
            <Link href="/article/fast-food" className={styles["read-now-button"]}>
              {t("readNow")}
              <Image
                src="/main/arrow-right.svg"
                alt=""
                width={12}
                height={12}
              />
            </Link>
          </div>
          <div className={styles["article-banner"]}>
            <Image
              src="/main/burger.svg"
              alt=""
              width={111}
              height={120}
            />
          </div>
        </div>

        <Link href="/vitamins" className={styles["explore-vitamins"]}>
          {t("exploreVitamins")}
          <Image
            src="/main/arrow-right-purple.svg"
            alt=""
            width={42}
            height={36}
          />
        </Link>

        <div className={styles["choose-your-favorites"]}>
          <h3>{t("chooseFavorites")}</h3>
          <div className={styles["favorites-list"]}>
            {FAVORITE_LINKS.map(({ key, href, className }) => {
              const icon = FAVORITE_ICONS[key];
              return (
                <Link
                  key={key}
                  href={href}
                  className={`${styles.favorite} ${styles["favorite-link"]} ${className}`}
                >
                  <Image
                    src={icon.src}
                    alt=""
                    width={icon.width}
                    height={icon.height}
                  />
                  {t(key)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <nav className={styles.navigation} aria-label="Main navigation">
        <Link className={styles["nav-link"]} href="/main" aria-current="page">
          <Image
            src="/main/home-green.svg"
            alt="home"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/products">
          <Image
            src="/main/products.svg"
            alt="products"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/vitamins">
          <Image
            src="/main/antioxidant.svg"
            alt="vitamins"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/favorites">
          <Image
            src="/main/heart.svg"
            alt="favorites"
            width={48}
            height={48}
          />
        </Link>
      </nav>
    </div>
  );
};

export default MainClient;
