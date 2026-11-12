"use client";

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useBackHandler } from "@/lib/backHandler";
import { getUserProfile, type UserProfile } from "@/lib/userProfile";

import styles from "./products.module.css";
import {
  getSlug,
  loadProductsIndex,
  searchProducts,
  type CatalogProduct,
  type ProductIndex,
} from "@/lib/productsIndex";
import ProductDetailSheet from "@/components/ProductDetailSheet/ProductDetailSheet";
import ProductMacros from "@/components/productMacros/ProductMacros";
import { useCategoryName } from "@/lib/categoryName";
import NutritionStars from "@/components/nutritionStars/NutritionStars";
import { AnalyticsEvent, track } from "@/lib/analytics";

/** Сколько продуктов дорисовываем за один раз при прокрутке. */
const PAGE_SIZE = 100;

// memo: при подгрузке следующих 100 перерисовываются только новые строки,
// а не весь список.
const ProductRow = memo(function ProductRow({
  product,
  caloriesLabel,
  onOpen,
}: {
  product: CatalogProduct;
  caloriesLabel: string;
  onOpen: (slug: string) => void;
}) {
  const slug = getSlug(product.link);
  const open = () => onOpen(slug);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <div className={styles["product"]}>
      <div
        className={styles["product-details"]}
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={onKeyDown}
      >
        <div className={styles["product-name"]}>{product.name}</div>
        <NutritionStars stars={product.nutritionStars}/>
        <div className={styles["product-calories"]}>
          <div className={styles["calories-label"]}>{caloriesLabel}: {product.calories}</div>
          <ProductMacros slug={slug} />
        </div>
      </div>
    </div>
  );
});

const ProductsClient = () => {
  const t = useTranslations("Products");
  const categoryName = useCategoryName();
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loaded, setLoaded] = useState<{ locale: string; index: ProductIndex } | null>(null);
  // категория, выбранная в горизонтальном меню под поиском (null = «Все»)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // slug of the product whose detail sheet is currently open, if any
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);

  // профиль (возраст/пол) — для персонального %DV в шторке продукта
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch((e) => console.error("Не удалось загрузить профиль:", e));
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Индекс нужен только для текущей локали; если локаль сменилась — старый не используем.
  const index = loaded?.locale === locale ? loaded.index : null;

  useEffect(() => {
    let cancelled = false;
    loadProductsIndex(locale)
      .then((idx) => {
        if (cancelled) return;
        setLoaded((prev) => (prev?.index === idx ? prev : { locale, index: idx }));
      })
      .catch((e) => console.error("Не удалось загрузить продукты:", e));
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // useDeferredValue: ввод в поле остаётся отзывчивым, тяжёлая фильтрация идёт с низким приоритетом
  const deferredSearch = useDeferredValue(search);

  // Категории для меню: из каталога, по убыванию числа продуктов
  const categoryOptions = useMemo(() => {
    if (!index) return [];
    const counts = new Map<string, number>();
    for (const p of index.all) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
  }, [index]);

  // Выбранная категория действительна, только если она есть в текущем списке (например, после смены языка)
  const activeChip =
    selectedCategory && categoryOptions.includes(selectedCategory) ? selectedCategory : null;

  const effectiveCategories = useMemo(() => (activeChip ? [activeChip] : null), [activeChip]);

  // повторный клик по активной категории сбрасывает выбор
  const handleChipClick = useCallback((category: string | null, el: HTMLElement) => {
    track(AnalyticsEvent.CategoryChipSelect, { category: category ?? "all" });
    setSelectedCategory((prev) => (category === prev ? null : category));
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  // Фильтр + поиск + группировка по категориям (порядок групп — по первому появлению)
  const groups = useMemo(() => {
    if (!index) return [];
    const filtered = searchProducts(index, deferredSearch, effectiveCategories);
    const map = new Map<string, CatalogProduct[]>();
    for (const product of filtered) {
      let arr = map.get(product.category);
      if (!arr) {
        arr = [];
        map.set(product.category, arr);
      }
      arr.push(product);
    }
    return Array.from(map.entries());
  }, [index, deferredSearch, effectiveCategories]);

  const total = useMemo(() => groups.reduce((sum, [, items]) => sum + items.length, 0), [groups]);

  // Показываем только первые visibleCount продуктов (по порядку групп);
  // заголовок категории выводится один раз, следующая порция продолжает ту же группу.
  const visibleGroups = useMemo(() => {
    let left = visibleCount;
    const out: [string, CatalogProduct[]][] = [];
    for (const [category, items] of groups) {
      if (left <= 0) break;
      const slice = items.length <= left ? items : items.slice(0, left);
      out.push([category, slice]);
      left -= slice.length;
    }
    return out;
  }, [groups, visibleCount]);

  const hasMore = visibleCount < total;

  // Аналитика поиска: шлём после паузы в наборе, один раз на запрос.
  // Текст запроса не отправляем — только длину и число найденных продуктов.
  const lastTrackedSearch = useRef("");
  useEffect(() => {
    const q = deferredSearch.trim();
    if (!index || q.length < 2 || q === lastTrackedSearch.current) return;
    const id = setTimeout(() => {
      lastTrackedSearch.current = q;
      track(AnalyticsEvent.SearchProducts, {
        query_length: q.length,
        results_count: total,
        has_results: total > 0,
      });
    }, 800);
    return () => clearTimeout(id);
  }, [deferredSearch, index, total]);

  // Новый запрос / категория / язык -> снова первые 100 и прокрутка наверх
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    contentRef.current?.scrollTo({ top: 0 });
  }, [deferredSearch, activeChip, index]);

  // Lazy loading: когда маркер в конце списка подходит к экрану — показываем ещё 100
  useEffect(() => {
    const root = contentRef.current;
    const el = sentinelRef.current;
    if (!root || !el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { root, rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visibleCount]);

  // "Назад" закрывает шторку с составом продукта
  useBackHandler(() => { setOpenedSlug(null); return true; }, openedSlug !== null);

  const handleOpen = useCallback((slug: string) => {
    setOpenedSlug(slug);
    track(AnalyticsEvent.ProductSheetOpen, { slug });
  }, []);

  const openedProduct = openedSlug && index ? index.bySlug.get(openedSlug) : undefined;
  const caloriesLabel = t("calories");

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

        {/* 🏷️ Меню категорий */}
        {index && categoryOptions.length > 1 && (
          <div className={styles["organs-scroll"]}>
            <button
              type="button"
              aria-pressed={activeChip === null}
              className={`${styles["organ-chip"]} ${activeChip === null ? styles["organ-chip-active"] : ""}`}
              onClick={(e) => handleChipClick(null, e.currentTarget)}
            >
              <span className={styles["organ-label"]}>{t("all")}</span>
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeChip === category}
                className={`${styles["organ-chip"]} ${activeChip === category ? styles["organ-chip-active"] : ""}`}
                onClick={(e) => handleChipClick(category, e.currentTarget)}
              >
                <span className={styles["organ-label"]}>{categoryName(category)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 📦 Контент */}
      <div className={styles["content-container"]} ref={contentRef}>
        <div className={styles["content"]}>
          {!index ? null : visibleGroups.length > 0 ? (
            <>
              {visibleGroups.map(([category, items]) => (
                <div key={category} className={styles["category-group"]}>
                  <h3 className={styles["category-title"]}>{categoryName(category)}</h3>

                  {items.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      caloriesLabel={caloriesLabel}
                      onOpen={handleOpen}
                    />
                  ))}
                </div>
              ))}
              {hasMore && <div ref={sentinelRef} className={styles["sentinel"]} />}
            </>
          ) : (
            <div className={styles["empty-state"]}>
              <Image src="/nothing-found.svg" alt="nothing-found" width={40} height={40} />
              {t("nothingFound")}
            </div>
          )}
        </div>
      </div>

      
      {/* 🧾 Вкладка с составом продукта */}
      {openedProduct && (
        <ProductDetailSheet
          slug={getSlug(openedProduct.link)}
          productId={openedProduct.id}
          userProfile={profile}
          basicInfo={{ name: openedProduct.name, image: openedProduct.image }}
          fullInfoHref={openedProduct.link}
          onClose={() => setOpenedSlug(null)}
        />
      )}
    </div>
  );
};

export default ProductsClient;