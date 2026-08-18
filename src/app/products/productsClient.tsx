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
import { ORGANS, OrganKey } from "@/data/organs";
import { scoreProductForOrgan } from "@/lib/organNutrients";

import productsRu from "@/data/ru/products.json";
import productsEn from "@/data/en/products.json";
import productDetailsRu from "@/data/ru/productDetails.json";
import productDetailsEn from "@/data/en/productDetails.json";

const normalizeAmount = (amount: string): number => {
  const value = parseFloat(amount);
  if (isNaN(value)) return 0;
  if (amount.includes("mg")) return value * 1000;
  return value;
};

const generateNutrientsList = (detailsData: any) => {
  const map = new Map<string, string>();
  const values = Object.values(detailsData);

  for (let i = 0; i < values.length; i++) {
    const details = values[i] as any;
    const nutrients = [
      ...(details.macroNutrients || []),
      ...(details.microNutrients || []),
    ];
    for (let j = 0; j < nutrients.length; j++) {
      const n = nutrients[j];
      const key = n.slug || n.id;
      if (!map.has(key)) {
        map.set(key, n.name);
      }
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
};

const ProductsClient = () => {
  const t = useTranslations("Products");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const activeCategory = isFavoriteCategory(categoryParam) ? categoryParam : null;

  const [search, setSearch] = useState("");
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganKey | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const store = loadFavorites();
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  }, []);

  const { currentProductsData, productDetailsData } = useMemo(() => {
    return locale === "ru"
      ? { currentProductsData: productsRu, productDetailsData: productDetailsRu }
      : { currentProductsData: productsEn, productDetailsData: productDetailsEn };
  }, [locale]);

  const nutrientsList = useMemo(() => {
    return generateNutrientsList(productDetailsData);
  }, [productDetailsData]);

  const productsWithDetails = useMemo(() => {
    return currentProductsData.map((product) => {
      const slug = product.link.substring(product.link.lastIndexOf("/") + 1);
      const details = productDetailsData[slug as keyof typeof productDetailsData] as any;

      if (!details) {
        return { ...product, nutrientsMap: {} };
      }

      const nutrients = [
        ...(details.macroNutrients || []),
        ...(details.microNutrients || []),
      ];

      const nutrientsMap: Record<string, { name: string; amount: string; numericAmount: number }> = {};
      for (let i = 0; i < nutrients.length; i++) {
        const n = nutrients[i];
        const key = n.slug || n.id;
        nutrientsMap[key] = {
          name: n.name,
          amount: n.amount,
          numericAmount: normalizeAmount(n.amount),
        };
      }

      return {
        ...product,
        nutrientsMap,
      };
    });
  }, [currentProductsData, productDetailsData]);

  const toggleFavorite = (id: number) => {
    const store = toggleProductFavorite(id);
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  };

  const handleOrganClick = (key: OrganKey) => {
    setSelectedOrgan((prev) => (prev === key ? null : key));
    setSelectedNutrient(null);
    setShowFilter(false);
  };

  const handleNutrientChange = (value: string) => {
    setSelectedNutrient(value || null);
    setSelectedOrgan(null);
    setShowFilter(false);
  };

  const groupedProducts = useMemo(() => {
    const localeKey = locale === "ru" ? "ru" : "en";
    const allowedCategories = activeCategory
      ? FAVORITE_CATEGORY_FILTERS[activeCategory][localeKey]
      : null;

    const query = search.trim().toLowerCase();

    let filtered = productsWithDetails.map((p) => ({
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

    // 🫀 Фильтр по органу: считаем очки полезности и сортируем по убыванию
    if (selectedOrgan) {
      const scored = filtered
        .map((p) => {
          const { score, topNutrient } = scoreProductForOrgan(p.nutrientsMap as any, selectedOrgan);
          return { ...p, organScore: score, organTopNutrient: topNutrient };
        })
        .filter((p) => p.organScore > 0)
        .sort((a, b) => b.organScore - a.organScore);

      const organInfo = ORGANS.find((o) => o.key === selectedOrgan)!;
      const groupTitle = `${locale === "ru" ? organInfo.ru : organInfo.en}`;

      return scored.length ? { [groupTitle]: scored } : {};
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

    const groups: Record<string, typeof filtered> = {};
    for (let i = 0; i < filtered.length; i++) {
      const product = filtered[i];
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    }

    return groups;
  }, [productsWithDetails, search, selectedNutrient, selectedOrgan, activeCategory, locale, favoriteIds]);

  const categories = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

  return (
    <div className={styles["main-layout"]}>
      {/* 🔍 Поиск */}
      <div className={styles["search-container"]}>
        <Image src="/search.svg" alt="search-icon" width={16} height={16} className={styles["search-icon"]} />
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

      {/* 🫀 Фильтр по органам */}
      {showFilter && (
      <div className={styles["organs-scroll"]}>
      {ORGANS.map((organ) => (
        <button
          key={organ.key}
          type="button"
          className={`${styles["organ-chip"]} ${
            selectedOrgan === organ.key ? styles["organ-chip-active"] : ""
          }`}
          onClick={() => handleOrganClick(organ.key)}
        >
          <span className={styles["organ-label"]}>
            {locale === "ru" ? organ.ru : organ.en}
          </span>
        </button>
      ))}
    </div>)}

      {/* 🔽 Фильтр по нутриенту */}
      {showFilter && (
        <div className={styles["filter-bar"]}>
          <select
            className={styles["filter-select"]}
            value={selectedNutrient || ""}
            onChange={(e) => handleNutrientChange(e.target.value)}
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

      {/* 📦 Контент */}
      <div className={styles["content"]}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className={styles["category-group"]}>
              <h3 className={styles["category-title"]}>{category}</h3>

              {groupedProducts[category].map((product: any) => (
                <div className={styles["product"]} key={product.id}>
                  <Link href={product.link} prefetch={false} className={styles["product-img-container"]}>
                    <Image src={product.image} alt={product.name} width={48} height={48} />
                  </Link>

                  <Link href={product.link} prefetch={false} className={styles["product-details"]}>
                    <div className={styles["product-name"]}>{product.name}</div>
                    <div className={styles["product-category"]}>{product.category}</div>
                    <div className={styles["product-calories"]}>
                      {selectedOrgan && product.organTopNutrient
                        ? `${product.organTopNutrient.name}: ${product.organTopNutrient.amount}`
                        : selectedNutrient
                        ? `${product.nutrientsMap[selectedNutrient]?.name}: ${
                            product.nutrientsMap[selectedNutrient]?.amount || "-"
                          }`
                        : `${t("calories")}: ${product.calories}`}
                    </div>
                  </Link>

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
            <Image src="/nothing-found.svg" alt="nothing-found" width={48} height={48} />
            {t("nothingFound")}
          </div>
        )}
      </div>

      {/* 🔽 Навигация */}
      <div className={styles["navigation"]}>
        <Link prefetch={false} className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/products" aria-current="page" prefetch={false}>
          <Image src="/main/products-green.svg" alt="products" width={48} height={48} />
        </Link>
        <Link prefetch={false} className={styles["nav-link"]} href="/vitamins">
          <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
        </Link>
        <Link prefetch={false} className={styles["nav-link"]} href="/favorites">
          <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
        </Link>
      </div>
    </div>
  );
};

export default ProductsClient;