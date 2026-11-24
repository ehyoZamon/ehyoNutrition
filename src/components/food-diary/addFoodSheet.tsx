// components/food-diary/AddFoodSheet.tsx
"use client";

import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import styles from "./addFoodSheet.module.css";
import ProductMacros from "@/components/productMacros/ProductMacros";
import {
  getSlug,
  loadProductsIndex,
  searchProducts,
  type CatalogProduct,
  type ProductIndex,
} from "@/lib/productsIndex";
import { getRecentSlugs } from "@/lib/recentProducts";
import NutritionStars from "@/components/nutritionStars/NutritionStars";
import { CUSTOM_CATEGORY, useCustomFoodsVersion } from "@/lib/customFoods";

// `source` — откуда взяты данные о продукте (например "USDA"); у части
// продуктов поля нет.
export type DiaryProduct = CatalogProduct & { source?: string };

type AddFoodSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: DiaryProduct) => void;
  /** Если передан — рядом с Close появляется кнопка "Create Food". */
  onCreateFood?: () => void;
  /** Заголовок над поиском (например, "Select ingredient"). */
  title?: string;
  /** Свой z-index, когда список открывается поверх другой шторки. */
  zIndex?: number;
  /** Не показывать блюда пользователя (нужно при выборе ингредиентов). */
  hideCustom?: boolean;
};

const CreateFoodIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** Сколько продуктов дорисовываем за один раз при прокрутке. */
const PAGE_SIZE = 100;

// ---------------------------------------------------------------------------
// Строка списка (memo: при подгрузке следующих 100 уже показанные не перерисовываются)
// ---------------------------------------------------------------------------
const ProductRow = memo(function ProductRow({
  product,
  caloriesLabel,
  onSelect,
}: {
  product: DiaryProduct;
  caloriesLabel: string;
  onSelect: (product: DiaryProduct) => void;
}) {
  return (
    <div className={styles["item"]}>
      <div className={styles["item-details"]}>
        <div className={styles["item-name"]}>{product.name} </div>
        {product.category !== CUSTOM_CATEGORY && <NutritionStars stars={product.nutritionStars} />}
        <div className={styles["item-calories"]}>
          <div className={styles["calories-label"]}>
            {caloriesLabel}: <span className={styles["calories-value"]}>{product.calories}</span>
          </div>
          <ProductMacros slug={getSlug(product.link)} />
        </div>
        {product.source && <div className={styles["item-source"]}>{product.source}</div>}
      </div>

      <button
        type="button"
        className={styles["add-btn"]}
        aria-label={`Add ${product.name}`}
        onClick={() => onSelect(product)}
      >
        +
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Компонент
// ---------------------------------------------------------------------------
const AddFoodSheet = ({
  open,
  onClose,
  onSelectProduct,
  onCreateFood,
  title,
  zIndex,
  hideCustom = false,
}: AddFoodSheetProps) => {
  const locale = useLocale();
  const t = useTranslations("FoodDiary");
  // ключ "calories" в FoodDiary необязателен: без него остаётся "Calories"
  const caloriesLabel = t.has("calories") ? t("calories") : "Calories";
  // ключ "createFood" тоже необязателен
  const createLabel = t.has("createFood")
    ? t("createFood")
    : locale === "ru"
      ? "Cоздать"
      : "Create Food";

  // Меняется после создания блюда / импорта бэкапа — тогда индекс (в нём лежат и свои блюда) грузим заново
  const customVersion = useCustomFoodsVersion();

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loaded, setLoaded] = useState<{ locale: string; index: ProductIndex } | null>(null);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecentSlugs(getRecentSlugs());
  }, [open]);

  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Индекс нужен только для текущей локали; если локаль сменилась — старый не используем.
  const index = loaded?.locale === locale ? loaded.index : null;

  // Загрузка: в фоне через 1.5 с после старта приложения (чтобы первое открытие
  // шторки было мгновенным), а если шторку открыли раньше — сразу.
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      loadProductsIndex(locale)
        .then((idx) => {
          if (cancelled) return;
          setLoaded((prev) => (prev?.index === idx ? prev : { locale, index: idx }));
        })
        .catch((e) => console.error("Не удалось загрузить продукты:", e));
    };

    if (open) {
      run();
      return () => {
        cancelled = true;
      };
    }
    const id = setTimeout(run, 1500);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [locale, open, customVersion]);

  // Сбрасываем поиск при закрытии, чтобы не тащить старый запрос в следующее открытие
  useEffect(() => {
    if (!open) {
      setSearch("");
      setVisibleCount(PAGE_SIZE);
    }
  }, [open]);

  // useDeferredValue: ввод в поле остаётся отзывчивым, тяжёлая фильтрация идёт с низким приоритетом
  const deferredSearch = useDeferredValue(search);

  const filteredProducts = useMemo(() => {
    if (!index) return [];
    const searched = searchProducts(index, deferredSearch);
    // При выборе ингредиентов свои блюда прячем (блюдо внутри блюда не поддерживается)
    const found = hideCustom ? searched.filter((p) => p.category !== CUSTOM_CATEGORY) : searched;

    // Недавние — наверх только когда поле поиска пустое
    if (deferredSearch.trim() !== "" || recentSlugs.length === 0) return found;

    const recent: DiaryProduct[] = [];
    const seen = new Set<DiaryProduct>();
    for (const slug of recentSlugs) {
      const p = index.bySlug.get(slug);
      if (p && !(hideCustom && p.category === CUSTOM_CATEGORY) && !seen.has(p)) {
        seen.add(p);
        recent.push(p);
      }
    }
    return recent.concat(found.filter((p) => !seen.has(p)));
  }, [index, deferredSearch, recentSlugs, hideCustom]);

  // Новый запрос -> снова первые 100 и прокрутка наверх
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    listRef.current?.scrollTo({ top: 0 });
  }, [deferredSearch]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );
  const hasMore = visibleCount < filteredProducts.length;

  // Lazy loading: когда маркер в конце списка подходит к экрану — показываем ещё 100
  useEffect(() => {
    const root = listRef.current;
    const el = sentinelRef.current;
    if (!open || !root || !el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { root, rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, hasMore, visibleCount]);

  if (!open) return null;

  return (
    <div
      className={styles["overlay"]}
      style={zIndex ? { zIndex } : undefined}
      onClick={onClose}
    >
      <div
        className={`${styles["sheet"]} ${title ? styles["has-title"] : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <div className={styles["title"]}>{title}</div>}

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

        <div className={styles["list"]} ref={listRef}>
          {!index ? (
            <div className={styles["loader"]}>
              <div className={styles["spinner"]} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {visibleProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  caloriesLabel={caloriesLabel}
                  onSelect={onSelectProduct}
                />
              ))}
              {hasMore && <div ref={sentinelRef} className={styles["sentinel"]} />}
            </>
          ) : (
            <div className={styles["empty-state"]}>
              <Image src="/nothing-found.svg" alt="nothing-found" width={48} height={48} />
              {t("nothingFound")}
            </div>
          )}
        </div>

        <div className={styles["actions"]}>
          <button type="button" className={styles["close-btn"]} onClick={onClose}>
            {t("closeBtn")}
          </button>
          {onCreateFood && (
            <button type="button" className={styles["create-btn"]} onClick={onCreateFood}>
              {createLabel}
              <CreateFoodIcon />
            </button>
          )}
        </div>
        <div className={styles["bottom-shade"]}></div>
      </div>
    </div>
  );
};

export default AddFoodSheet;