"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import styles from "./products.module.css";
import { loadFavorites, toggleProductFavorite } from "@/lib/favorites";
import {
  FAVORITE_CATEGORY_FILTERS,
  isFavoriteCategory,
} from "@/lib/productCategories";
import ProductDetailSheet from "@/components/ProductDetailSheet/ProductDetailSheet";

import productsRu from "@/data/ru/products.json";
import productsEn from "@/data/en/products.json";

const getSlug = (link: string) => link.substring(link.lastIndexOf("/") + 1);

const ProductsClient = () => {
  const t = useTranslations("Products");
  const navBar=useTranslations("navBar");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const activeCategory = isFavoriteCategory(categoryParam) ? categoryParam : null;

  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // slug of the product whose detail sheet is currently open, if any
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);

  useEffect(() => {
    const store = loadFavorites();
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  }, []);

  const currentProductsData = useMemo(() => {
    return locale === "ru" ? productsRu : productsEn;
  }, [locale]);

  const productsWithSlug = useMemo(() => {
    return currentProductsData.map((product) => ({
      ...product,
      slug: getSlug(product.link),
    }));
  }, [currentProductsData]);

  const toggleFavorite = (id: number) => {
    const store = toggleProductFavorite(id);
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  };

  const groupedProducts = useMemo(() => {
    const localeKey = locale === "ru" ? "ru" : "en";
    const allowedCategories = activeCategory
      ? FAVORITE_CATEGORY_FILTERS[activeCategory][localeKey]
      : null;

    const query = search.trim().toLowerCase();

    let filtered = productsWithSlug.map((p) => ({
      ...p,
      favorite: favoriteIds.includes(p.id),
    }));

    if (allowedCategories) {
      filtered = filtered.filter((p) => allowedCategories.includes(p.category));
    }

    if (query) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    const groups: Record<string, typeof filtered> = {};
    for (let i = 0; i < filtered.length; i++) {
      const product = filtered[i];
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    }

    return groups;
  }, [productsWithSlug, search, activeCategory, locale, favoriteIds]);

  const categories = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

  const openedProduct = openedSlug
    ? productsWithSlug.find((p) => p.slug === openedSlug)
    : null;

  return (
    <div className={styles["main-layout"]}>
      {/* 🔍 Поиск */}
      <div className={styles["search-container"]}>
        <div className={styles["search-bar"]}>
          <Image src="/search.svg" alt="search-icon" width={16} height={16} className={styles["search-icon"]} />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className={styles["search-input"]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 📦 Контент */}
      <div className={styles["content-container"]}>
        <div className={styles["content"]}>
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category} className={styles["category-group"]}>
                <h3 className={styles["category-title"]}>{category}</h3>

                {groupedProducts[category].map((product: any) => (
                  <div className={styles["product"]} key={product.id}>
                    <div
                      className={styles["product-img-container"]}
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenedSlug(product.slug)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenedSlug(product.slug);
                        }
                      }}
                    >
                      <Image src={product.image} alt={product.name} width={40} height={40} />
                    </div>

                    <div
                      className={styles["product-details"]}
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenedSlug(product.slug)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenedSlug(product.slug);
                        }
                      }}
                    >
                      <div className={styles["product-name"]}>{product.name}</div>
                      <div className={styles["product-category"]}>{product.category}</div>
                      <div className={styles["product-calories"]}>
                        {t("calories")}: {product.calories}
                      </div>
                    </div>

                    <div className={styles["put-to-favorite"]} onClick={() => toggleFavorite(product.id)}>
                      <Image
                        src={product.favorite ? "/heart-filled.svg" : "/heart.svg"}
                        alt="favorite"
                        width={27}
                        height={27}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className={styles["empty-state"]}>
              <Image src="/nothing-found.svg" alt="nothing-found" width={40} height={40} />
              {t("nothingFound")}
            </div>
          )}
        </div>
      </div>

      <div className={styles["navigation-container"]}>
        <div className={styles["navigation"]}>
          <Link className={`${styles["nav-link"]} ${styles["selected"]}`}  href="/products" aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/products-green.svg" alt="products" width={48} height={48} />
            </div>
            {navBar("foods")}
          </Link>
          <Link  className={styles["nav-link"]} href="/vitamins">
            <div className={styles["nav-bar"]}>
                <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
            </div>
            {navBar("nutrients")}
          </Link>
          <Link  className={styles["nav-link"]} href="/food-diary" aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/food-diary.svg" alt="food-diary" width={48} height={48} />
            </div>
            {navBar("foodDiary")}
          </Link>
          <Link  className={styles["nav-link"]} href="/favorites">
            <div className={styles["nav-bar"]}>
              <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
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
          slug={openedProduct.slug}
          locale={locale}
          basicInfo={{ name: openedProduct.name, image: openedProduct.image }}
          fullInfoHref={openedProduct.link}
          onClose={() => setOpenedSlug(null)}
        />
      )}
    </div>
  );
};

export default ProductsClient;
