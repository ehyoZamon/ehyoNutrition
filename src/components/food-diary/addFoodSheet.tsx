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

export type DiaryProduct = CatalogProduct;

type AddFoodSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: DiaryProduct) => void;
};

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
        <div className={styles["item-name"]}>{product.name}</div>
        <div className={styles["item-calories"]}>
          <div className={styles["calories-label"]}>
            {caloriesLabel}: <span className={styles["calories-value"]}>{product.calories}</span>
          </div>
          <ProductMacros slug={getSlug(product.link)} />
        </div>
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
const AddFoodSheet = ({ open, onClose, onSelectProduct }: AddFoodSheetProps) => {
  const locale = useLocale();
  const t = useTranslations("FoodDiary");
  // ключ "calories" в FoodDiary необязателен: без него остаётся "Calories"
  const caloriesLabel = t.has("calories") ? t("calories") : "Calories";

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
  }, [locale, open]);

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
    const found = searchProducts(index, deferredSearch);

    // Недавние — наверх только когда поле поиска пустое
    if (deferredSearch.trim() !== "" || recentSlugs.length === 0) return found;

    const recent: DiaryProduct[] = [];
    const seen = new Set<DiaryProduct>();
    for (const slug of recentSlugs) {
      const p = index.bySlug.get(slug);
      if (p && !seen.has(p)) {
        seen.add(p);
        recent.push(p);
      }
    }
    return recent.concat(found.filter((p) => !seen.has(p)));
  }, [index, deferredSearch, recentSlugs]);

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
    <div className={styles["overlay"]} onClick={onClose}>
      <div className={styles["sheet"]} onClick={(e) => e.stopPropagation()}>
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
            autoFocus
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

        <button type="button" className={styles["close-btn"]} onClick={onClose}>
          {t("closeBtn")}
        </button>
        <div className={styles["bottom-shade"]}></div>
      </div>
    </div>
  );
};

export default AddFoodSheet;