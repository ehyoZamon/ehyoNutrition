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

import productDetailsRu from "@/data/ru/productDetails.json";
import productDetailsEn from "@/data/en/productDetails.json";

const ProductsClient = () => {
  const t = useTranslations("Products");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const activeCategory = isFavoriteCategory(categoryParam)
    ? categoryParam
    : null;

  const [search, setSearch] = useState("");
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const currentProductsData = useMemo(() => {
    return locale === "ru" ? productsRu : productsEn;
  }, [locale]);

  const productDetailsData =
    locale === "ru" ? productDetailsRu : productDetailsEn;

  const normalizeAmount = (amount: string) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return 0;

    if (amount.includes("mg")) return value * 1000;
    if (amount.includes("mcg")) return value;

    return value;
  };

  // 🔥 объединение данных
  const productsWithDetails = useMemo(() => {
    return currentProductsData.map((product) => {
      const slug = product.link.split("/").pop();
      const details =
        productDetailsData[slug as keyof typeof productDetailsData];

      if (!details) {
        return { ...product, nutrientsMap: {} };
      }

      const nutrients = [
        ...(details.macroNutrients || []),
        ...(((details as any).microNutrients) || []),
      ];

      const nutrientsMap = nutrients.reduce((acc: any, n: any) => {
        const key = n.slug || n.id;

        acc[key] = {
          name: n.name,
          amount: n.amount,
          numericAmount: normalizeAmount(n.amount),
        };

        return acc;
      }, {});

      return {
        ...product,
        nutrientsMap,
      };
    });
  }, [currentProductsData, productDetailsData]);

  // 🔥 список нутриентов
  const nutrientsList = useMemo(() => {
    const map = new Map<string, string>();

    Object.values(productDetailsData).forEach((details: any) => {
      const nutrients = [
        ...(details.macroNutrients || []),
        ...(details.microNutrients || []),
      ];

      nutrients.forEach((n: any) => {
        const key = n.slug || n.id;
        if (!map.has(key)) {
          map.set(key, n.name);
        }
      });
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [productDetailsData]);

  const [products, setProducts] = useState(productsWithDetails);

  useEffect(() => {
    const store = loadFavorites();

    setProducts(
      productsWithDetails.map((product) => ({
        ...product,
        favorite: store.products.includes(product.id),
      }))
    );
  }, [productsWithDetails]);

  const toggleFavorite = (id: number) => {
    const store = toggleProductFavorite(id);

    setProducts((current) =>
      current.map((product) => ({
        ...product,
        favorite: store.products.includes(product.id),
      }))
    );
  };

  // 🔥 фильтрация
  const groupedProducts = useMemo(() => {
    const localeKey = locale === "ru" ? "ru" : "en";

    const allowedCategories = activeCategory
      ? FAVORITE_CATEGORY_FILTERS[activeCategory][localeKey]
      : null;

    let filtered = products;

    if (allowedCategories) {
      filtered = filtered.filter((p) =>
        allowedCategories.includes(p.category)
      );
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    if (selectedNutrient) {
      filtered = filtered
        .filter((p) => p.nutrientsMap[selectedNutrient])
        .sort(
          (a, b) =>
            b.nutrientsMap[selectedNutrient].numericAmount -
            a.nutrientsMap[selectedNutrient].numericAmount
        );
    }

    return filtered.reduce((acc: any, product: any) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});
  }, [products, search, selectedNutrient, activeCategory, locale]);

  const categories = Object.keys(groupedProducts);

  return (
    <div className={styles["main-layout"]}>
      {/* 🔍 поиск + иконка */}
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

        <Image
          src="/filter.svg"
          alt="filter"
          width={20}
          height={20}
          className={styles["filter-icon"]}
          onClick={() => setShowFilter((prev) => !prev)}
        />
      </div>

      {/* 🔽 ФИЛЬТР */}
      {showFilter && (
        <div className={styles["filter-bar"]}>
          <select
            className={styles["filter-select"]}
            value={selectedNutrient || ""}
            onChange={(e) => {
              const value = e.target.value || null;
              setSelectedNutrient(value);
              setShowFilter(false); // 🔥 скрыть после выбора
            }}
          >
            <option value="">All nutrients</option>

            {nutrientsList.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>

          {selectedNutrient && (
            <button
              className={styles["filter-reset"]}
              onClick={() => {
                setSelectedNutrient(null);
                setShowFilter(false);
              }}
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* 📦 контент */}
      <div className={styles["content"]}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className={styles["category-group"]}>
              <h3 className={styles["category-title"]}>{category}</h3>

              {groupedProducts[category].map((product: any) => (
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

                  <Link
                    href={product.link}
                    className={styles["product-details"]}
                  >
                    <div className={styles["product-name"]}>
                      {product.name}
                    </div>

                    <div className={styles["product-category"]}>
                      {product.category}
                    </div>

                    <div className={styles["product-calories"]}>
                      {selectedNutrient
                        ? `${
                            product.nutrientsMap[selectedNutrient]?.name
                          }: ${
                            product.nutrientsMap[selectedNutrient]?.amount ||
                            "-"
                          }`
                        : `${t("calories")}: ${product.calories}`}
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

      {/* 🔽 навигация */}
      <div className={styles["navigation"]}>
        <Link className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>

        <Link
          className={styles["nav-link"]}
          href="/products"
          aria-current="page"
        >
          <Image
            src="/main/products-green.svg"
            alt="products"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/vitamins">
          <Image
            src="/main/antioxidant.svg"
            alt="antioxidant"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/favorites">
          <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
        </Link>
      </div>
    </div>
  );
};

export default ProductsClient;