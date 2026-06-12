"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import styles from "./favorites.module.css";

// Импортируем оба языковых набора данных
import productsEn from "@/data/en/products.json";
import productsRu from "@/data/ru/products.json"; 
import vitaminsEn from "@/data/en/vitamins.json";
import vitaminsRu from "@/data/ru/vitamins.json";

import { loadFavorites, toggleProductFavorite, toggleVitaminFavorite } from "@/lib/favorites";

type ProductItem = (typeof productsEn)[number];
type VitaminItem = (typeof vitaminsEn)[number];

const FavoritesClient = () => {
  const t = useTranslations("Favorites");
  const locale = useLocale();
  const pathname = usePathname();

  const [favoriteProductIds, setFavoriteProductIds] = useState<number[]>([]);
  const [favoriteVitaminIds, setFavoriteVitaminIds] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Определяем, какой набор данных использовать на основе локали
  const currentProductsData = (locale === "ru" ? productsRu : productsEn) as ProductItem[];
  const currentVitaminsData = (locale === "ru" ? vitaminsRu : vitaminsEn) as VitaminItem[];

  const syncFavorites = useCallback(() => {
    const store = loadFavorites();
    setFavoriteProductIds(store.products);
    setFavoriteVitaminIds(store.vitamins);
    setIsReady(true);
  }, []);

  useEffect(() => {
    syncFavorites();
  }, [pathname, syncFavorites]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "favorites") syncFavorites();
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncFavorites]);

  const favoriteProducts = useMemo(
    () =>
      currentProductsData.filter((product) =>
        favoriteProductIds.includes(product.id)
      ),
    [favoriteProductIds, currentProductsData]
  );

  const favoriteVitamins = useMemo(
    () =>
      currentVitaminsData.filter((vitamin) =>
        favoriteVitaminIds.includes(vitamin.id)
      ),
    [favoriteVitaminIds, currentVitaminsData]
  );

  const handleToggleProduct = (id: number) => {
    const store = toggleProductFavorite(id);
    setFavoriteProductIds(store.products);
  };

  const handleToggleVitamin = (id: number) => {
    const store = toggleVitaminFavorite(id);
    setFavoriteVitaminIds(store.vitamins);
  };

  const isEmpty =
    isReady && favoriteProducts.length === 0 && favoriteVitamins.length === 0;

  return (
    <div className={styles["main-layout"]}>
      <header className={styles["header"]}>
        <h1 className={styles["title"]}>{t("title")}</h1>
        <p className={styles["subtitle"]}>{t("subtitle")}</p>
      </header>

      <div className={styles["content"]}>
        {isEmpty && (
          <div className={styles["empty-state"]}>
            <Image
              src="/nothing-found.svg"
              alt="no favorites"
              width={48}
              height={48}
            />
            <span>{t("emptyTitle")}</span>
            <span className={styles["empty-hint"]}>{t("emptyHint")}</span>
          </div>
        )}

        {!isEmpty && favoriteProducts.length > 0 && (
          <section className={styles["section"]}>
            <h2 className={styles["section-title"]}>{t("productsSection")}</h2>
            {favoriteProducts.map((product) => (
              <div className={styles["product"]} key={`product-${product.id}`}>
                <Link
                  prefetch={false}
                  href={product.link}
                  className={styles["product-img-container"]}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={48}
                  />
                </Link>

                <Link prefetch={false} href={product.link} className={styles["product-details"]}>
                  <div className={styles["product-name"]}>{product.name}</div>
                  <div className={styles["product-category"]}>
                    {product.category}
                  </div>
                  <div className={styles["product-calories"]}>
                    {t("calories")}: {product.calories}
                  </div>
                </Link>

                <button
                  type="button"
                  className={styles["put-to-favorite"]}
                  onClick={() => handleToggleProduct(product.id)}
                  aria-label={`Remove ${product.name} from favorites`}
                >
                  <Image
                    src="/heart-filled.svg"
                    alt=""
                    width={27}
                    height={27}
                  />
                </button>
              </div>
            ))}
          </section>
        )}

        {!isEmpty && favoriteVitamins.length > 0 && (
          <section className={styles["section"]}>
            <h2 className={styles["section-title"]}>{t("vitaminsSection")}</h2>
            {favoriteVitamins.map((vitamin) => (
              <div className={styles["vitamin"]} key={`vitamin-${vitamin.id}`}>
                <Link
                  prefetch={false}
                  href={vitamin.link}
                  className={styles["vitamin-img-container"]}
                >
                  <Image
                    src="/vitamins/molecule.svg"
                    alt=""
                    width={42}
                    height={42}
                    className={styles["molecule"]}
                  />
                  <span dangerouslySetInnerHTML={{ __html: vitamin.image }} />
                </Link>

                <Link prefetch={false} href={vitamin.link} className={styles["vitamin-details"]}>
                  <div className={styles["vitamin-name"]}>{vitamin.name}</div>
                  <div className={styles["vitamin-daily-value"]}>
                    {t("dailyValue")}: {vitamin.dailyValue} {vitamin.unit}
                  </div>
                  <div className={styles["vitamin-benefit"]}>
                    {t("benefit")}: {vitamin.benefit}
                  </div>
                </Link>

                <button
                  type="button"
                  className={styles["put-to-favorite"]}
                  onClick={() => handleToggleVitamin(vitamin.id)}
                  aria-label={`Remove ${vitamin.name} from favorites`}
                >
                  <Image
                    src="/vitamins/heart-filled.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            ))}
          </section>
        )}
      </div>

      <div className={styles["navigation"]}>
        <Link prefetch={false} className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>
        <Link prefetch={false} className={styles["nav-link"]} href="/products">
          <Image src="/main/products.svg" alt="products" width={48} height={48} />
        </Link>
        <Link prefetch={false}  className={styles["nav-link"]} href="/vitamins">
          <Image
            src="/main/antioxidant.svg"
            alt="vitamins"
            width={48}
            height={48}
          />
        </Link>
        <Link prefetch={false} className={styles["nav-link"]} href="/favorites">
          <Image src="/heart-filled.svg" alt="favorites" width={48} height={48} />
        </Link>
      </div>
    </div>
  );
};

export default FavoritesClient;