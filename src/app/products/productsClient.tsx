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

// Оптимизация 1: Выносим парсинг за пределы компонента.
// Функция вызывается реже и не пересоздается.
const normalizeAmount = (amount: string): number => {
  const value = parseFloat(amount);
  if (isNaN(value)) return 0;
  if (amount.includes("mg")) return value * 1000;
  return value; // mcg или базовое значение
};

// Оптимизация 2: Выносим тяжелый сбор уникальных нутриентов.
// Нам не нужно делать это внутри хуков компонента, данные статичны.
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
  const [showFilter, setShowFilter] = useState(false);
  
  // Храним только ID избранных товаров для мгновенного O(1) поиска
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Загружаем избранное один раз при маунте
  useEffect(() => {
    const store = loadFavorites();
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  }, []);

  // Выбираем данные в зависимости от локали
  const { currentProductsData, productDetailsData } = useMemo(() => {
    return locale === "ru" 
      ? { currentProductsData: productsRu, productDetailsData: productDetailsRu }
      : { currentProductsData: productsEn, productDetailsData: productDetailsEn };
  }, [locale]);

  // Статичный список нутриентов для селекта
  const nutrientsList = useMemo(() => {
    return generateNutrientsList(productDetailsData);
  }, [productDetailsData]);

  // Оптимизация 3: Сборка карты продуктов с деталями (делаем ОДИН раз при смене языка)
  const productsWithDetails = useMemo(() => {
    return currentProductsData.map((product) => {
      // Быстрое извлечение slug без лишних split, если структура ссылки предсказуема
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

  // Функция переключения избранного работает напрямую со стейтом ID
  const toggleFavorite = (id: number) => {
    const store = toggleProductFavorite(id);
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  };

  // Оптимизация 4: Единый цикл фильтрации, сортировки и группировки
  const groupedProducts = useMemo(() => {
    const localeKey = locale === "ru" ? "ru" : "en";
    const allowedCategories = activeCategory
      ? FAVORITE_CATEGORY_FILTERS[activeCategory][localeKey]
      : null;

    const query = search.trim().toLowerCase();

    // 1. Фильтруем базовый массив
    let filtered = productsWithDetails.map(p => ({
      ...p,
      favorite: favoriteIds.includes(p.id) // Накладываем актуальный статус избранного на лету
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

    if (selectedNutrient) {
      filtered = filtered
        .filter((p) => p.nutrientsMap[selectedNutrient])
        .sort(
          (a, b) =>
            b.nutrientsMap[selectedNutrient].numericAmount -
            a.nutrientsMap[selectedNutrient].numericAmount
        );
    }

    // 2. Группируем за один проход
    const groups: Record<string, typeof filtered> = {};
    for (let i = 0; i < filtered.length; i++) {
      const product = filtered[i];
      if (!groups[product.category]) {
        groups[product.category] = [];
      }
      groups[product.category].push(product);
    }

    return groups;
  }, [productsWithDetails, search, selectedNutrient, activeCategory, locale, favoriteIds]);

  const categories = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

  return (
    <div className={styles["main-layout"]}>
      {/* 🔍 Поиск */}
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

      {/* 🔽 Фильтр */}
      {showFilter && (
        <div className={styles["filter-bar"]}>
          <select
            className={styles["filter-select"]}
            value={selectedNutrient || ""}
            onChange={(e) => {
              setSelectedNutrient(e.target.value || null);
              setShowFilter(false);
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

      {/* 📦 Контент */}
      <div className={styles["content"]}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className={styles["category-group"]}>
              <h3 className={styles["category-title"]}>{category}</h3>

              {groupedProducts[category].map((product: any) => (
                <div className={styles["product"]} key={product.id}>
                  <Link
                    href={product.link}
                    prefetch={false}
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
                    prefetch={false}
                    className={styles["product-details"]}
                  >
                    <div className={styles["product-name"]}>{product.name}</div>
                    <div className={styles["product-category"]}>{product.category}</div>
                    <div className={styles["product-calories"]}>
                      {selectedNutrient
                        ? `${product.nutrientsMap[selectedNutrient]?.name}: ${
                            product.nutrientsMap[selectedNutrient]?.amount || "-"
                          }`
                        : `${t("calories")}: ${product.calories}`}
                    </div>
                  </Link>

                  <div
                    className={styles["put-to-favorite"]}
                    onClick={() => toggleFavorite(product.id)}
                  >
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

      {/* 🔽 Навигация */}
      <div className={styles["navigation"]}>
        <Link prefetch={false} className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>
        <Link
          className={styles["nav-link"]}
          href="/products"
          aria-current="page"
          prefetch={false}
        >
          <Image
            src="/main/products-green.svg"
            alt="products"
            width={48}
            height={48}
          />
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