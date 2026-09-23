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
import ProductDetailSheet from "@/components/ProductDetailSheet/ProductDetailSheet";
import VitaminDetailSheet from "@/components/VitaminDetailSheet/VitaminDetailSheet";

type ProductItem = (typeof productsEn)[number];
type VitaminItem = (typeof vitaminsEn)[number];

// Slug из ссылки вида "/productinfo/apple" или "/vitamininfo/vitamin-c"
// -> "apple" / "vitamin-c". Тем же способом, что и в productsClient /
// vitaminsClient, — под эти ключи заведены productDetails/*.json и
// vitaminDRI.json.
const getSlug = (link: string) => link.substring(link.lastIndexOf("/") + 1);

const FavoritesClient = () => {
  const t = useTranslations("Favorites");
  const navBar=useTranslations("navBar");
  const locale = useLocale();
  const pathname = usePathname();

  const [favoriteProductIds, setFavoriteProductIds] = useState<number[]>([]);
  const [favoriteVitaminIds, setFavoriteVitaminIds] = useState<number[]>([]);
  const [isReady, setIsReady] = useState(false);

  // slug of the product/vitamin whose detail sheet is currently open, if any
  const [openedProductSlug, setOpenedProductSlug] = useState<string | null>(null);
  const [openedVitaminSlug, setOpenedVitaminSlug] = useState<string | null>(null);

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

  const openedProduct = openedProductSlug
    ? favoriteProducts.find((p) => getSlug(p.link) === openedProductSlug)
    : null;

  const openedVitamin = openedVitaminSlug
    ? favoriteVitamins.find((v) => getSlug(v.link) === openedVitaminSlug)
    : null;

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["header-container"]}>
        <header className={styles["header"]}>
          <h1 className={styles["title"]}>{t("title")}</h1>
          <p className={styles["subtitle"]}>{t("subtitle")}</p>
        </header>
      </div>

      <div className={styles["content-container"]}>
        <div className={styles["content"]}>
          {isEmpty && (
            <div className={styles["empty-state"]}>
              <Image
                src="/nothing-found.svg"
                alt="no favorites"
                width={40}
                height={40}
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
                  <div
                    className={styles["product-img-container"]}
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenedProductSlug(getSlug(product.link))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenedProductSlug(getSlug(product.link));
                      }
                    }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                    />
                  </div>

                  <div
                    className={styles["product-details"]}
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenedProductSlug(getSlug(product.link))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenedProductSlug(getSlug(product.link));
                      }
                    }}
                  >
                    <div className={styles["product-name"]}>{product.name}</div>
                    <div className={styles["product-category"]}>
                      {product.category}
                    </div>
                    <div className={styles["product-calories"]}>
                      {t("calories")}: {product.calories}
                    </div>
                  </div>

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
                  <div
                    className={styles["vitamin-img-container"]}
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenedVitaminSlug(getSlug(vitamin.link))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenedVitaminSlug(getSlug(vitamin.link));
                      }
                    }}
                  >
                    <Image
                      src="/vitamins/molecule.svg"
                      alt=""
                      width={42}
                      height={42}
                      className={styles["molecule"]}
                    />
                    <span dangerouslySetInnerHTML={{ __html: vitamin.image }} />
                  </div>

                  <div
                    className={styles["vitamin-details"]}
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenedVitaminSlug(getSlug(vitamin.link))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenedVitaminSlug(getSlug(vitamin.link));
                      }
                    }}
                  >
                    <div className={styles["vitamin-name"]}>{vitamin.name}</div>
                    <div className={styles["vitamin-daily-value"]}>
                      {t("dailyValue")}: {vitamin.dailyValue} {vitamin.unit}
                    </div>
                    <div className={styles["vitamin-benefit"]}>
                      {t("benefit")}: {vitamin.benefit}
                    </div>
                  </div>

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
      </div>
        
      <div className={styles["navigation-container"]}>
        <div className={styles["navigation"]}>
          <Link className={styles["nav-link"]} href="/products" aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/products.svg" alt="products" width={48} height={48} />
            </div>
            {navBar("foods")}
          </Link>
          <Link  className={styles["nav-link"]} href="/vitamins">
            <div className={styles["nav-bar"]}>
                <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
            </div>
            {navBar("nutrients")}
          </Link>
          <Link  href="/food-diary" className={styles["nav-link"]} aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/food-diary.svg" alt="food-diary" width={48} height={48} />
            </div>
            {navBar("foodDiary")}
          </Link>
          <Link  className={`${styles["nav-link"]} ${styles["selected"]}`} href="/favorites">
            <div className={styles["nav-bar"]}>
              <Image src="/main/heart-green.svg" alt="heart" width={48} height={48} />
            </div>
            {navBar("favourites")}
          </Link>
          <Link  className={styles["nav-link"]} href="/settings">
            <div className={styles["nav-bar"]}>
              <Image src="/main/settings.svg" alt="heart" width={48} height={48} />
            </div>
            {navBar("settings")}
          </Link>
        </div>
      </div>

      {/* 🧾 Вкладка с составом продукта */}
      {openedProduct && (
        <ProductDetailSheet
          slug={getSlug(openedProduct.link)}
          locale={locale}
          basicInfo={{ name: openedProduct.name, image: openedProduct.image }}
          fullInfoHref={openedProduct.link}
          onClose={() => setOpenedProductSlug(null)}
        />
      )}

      {/* 🧾 Вкладка с дозировками (DRI) */}
      {openedVitamin && (
        <VitaminDetailSheet
          slug={getSlug(openedVitamin.link)}
          basicInfo={{ name: openedVitamin.name, image: openedVitamin.image }}
          onClose={() => setOpenedVitaminSlug(null)}
        />
      )}
    </div>
  );
};

export default FavoritesClient;
