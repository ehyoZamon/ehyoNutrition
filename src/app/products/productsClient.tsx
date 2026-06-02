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

import productsRu from "@/data/ru/products.json";
import productsEn from "@/data/en/products.json";

const ProductsClient = () => {
  const t = useTranslations("Products");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const activeCategory = isFavoriteCategory(categoryParam)
    ? categoryParam
    : null;

  const [search, setSearch] = useState("");

  const currentProductsData = useMemo(() => {
    return locale === "ru" ? productsRu : productsEn;
  }, [locale]);

  const [products, setProducts] = useState(currentProductsData);

  useEffect(() => {
    const store = loadFavorites();
    setProducts(
      currentProductsData.map((product) => ({
        ...product,
        favorite: store.products.includes(product.id),
      }))
    );
  }, [currentProductsData]);

  const toggleFavorite = (id: number) => {
    const store = toggleProductFavorite(id);
    setProducts((current) =>
      current.map((product) => ({
        ...product,
        favorite: store.products.includes(product.id),
      }))
    );
  };

  // Группировка продуктов по категориям
  const groupedProducts = useMemo(() => {
    const localeKey = locale === "ru" ? "ru" : "en";
    const allowedCategories = activeCategory
      ? FAVORITE_CATEGORY_FILTERS[activeCategory][localeKey]
      : null;

    const filtered = products.filter((product) => {
      if (allowedCategories && !allowedCategories.includes(product.category)) {
        return false;
      }
      const query = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });

    return filtered.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof products>);
  }, [products, search, activeCategory, locale]);

  const categories = Object.keys(groupedProducts);

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["search-container"]}>
        <Image
          src="/search.svg"
          alt="search-icon"
          width={16}
          height={16}
          className={styles["search-icon"]}
        />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className={styles["search-input"]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles["content"]}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className={styles["category-group"]}>
              <h3 className={styles["category-title"]}>{category}</h3>
              {groupedProducts[category].map((product) => (
                <div className={styles["product"]} key={product.id}>
                  <Link
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

                  <Link href={product.link} className={styles["product-details"]}>
                    <div className={styles["product-name"]}>{product.name}</div>
                    <div className={styles["product-category"]}>
                      {product.category}
                    </div>
                    <div className={styles["product-calories"]}>
                      {t("calories")}: {product.calories}
                    </div>
                  </Link>

                  <div
                    className={styles["put-to-favorite"]}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Image
                      src={
                        product.favorite
                          ? "/heart-filled.svg"
                          : "/heart.svg"
                      }
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
            <Image
              src="/nothing-found.svg"
              alt="nothing-found"
              width={48}
              height={48}
            />
            {t("nothingFound")}
          </div>
        )}
      </div>

      <div className={styles["navigation"]}>
        <Link className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/products" aria-current="page">
          <Image src="/main/products-green.svg" alt="products" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/vitamins">
          <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/favorites">
          <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
        </Link>
      </div>
    </div>
  );
};

export default ProductsClient;