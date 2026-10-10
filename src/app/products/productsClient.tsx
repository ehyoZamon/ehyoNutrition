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
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import styles from "./products.module.css";
import { loadFavorites, toggleProductFavorite } from "@/lib/favorites";
import {
  FAVORITE_CATEGORY_FILTERS,
  isFavoriteCategory,
} from "@/lib/productCategories";
import {
  getSlug,
  loadProductsIndex,
  searchProducts,
  type CatalogProduct,
  type ProductIndex,
} from "@/lib/productsIndex";
import ProductDetailSheet from "@/components/ProductDetailSheet/ProductDetailSheet";
import BottomNav from "@/components/bottomNav/BottomNav";
import ProductMacros from "@/components/productMacros/ProductMacros";
import { useCategoryName } from "@/lib/categoryName";

/** Сколько продуктов дорисовываем за один раз при прокрутке. */
const PAGE_SIZE = 100;

// memo: при подгрузке следующих 100 и при смене избранного перерисовываются
// только изменившиеся строки, а не весь список.
const ProductRow = memo(function ProductRow({
  product,
  isFavorite,
  caloriesLabel,
  onOpen,
  onToggleFavorite,
}: {
  product: CatalogProduct;
  isFavorite: boolean;
  caloriesLabel: string;
  onOpen: (slug: string) => void;
  onToggleFavorite: (id: number) => void;
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
        <div className={styles["product-calories"]}>
          <div className={styles["calories-label"]}>{caloriesLabel}: {product.calories}</div>
          <ProductMacros slug={slug} />
        </div>
      </div>

      <div className={styles["put-to-favorite"]} onClick={() => onToggleFavorite(product.id)}>
        <Image
          src={isFavorite ? "/heart-filled.svg" : "/heart.svg"}
          alt="favorite"
          width={27}
          height={27}
        />
      </div>
    </div>
  );
});

const ProductsClient = () => {
  const t = useTranslations("Products");
  const categoryName = useCategoryName();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const activeCategory = isFavoriteCategory(categoryParam) ? categoryParam : null;

  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loaded, setLoaded] = useState<{ locale: string; index: ProductIndex } | null>(null);

  // slug of the product whose detail sheet is currently open, if any
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);

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

  useEffect(() => {
    const store = loadFavorites();
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  }, []);

  // Set вместо favoriteIds.includes(...) на каждый продукт: O(1) и без пересборки всего списка
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const toggleFavorite = useCallback((id: number) => {
    const store = toggleProductFavorite(id);
    if (store?.products) {
      setFavoriteIds(store.products);
    }
  }, []);

  // useDeferredValue: ввод в поле остаётся отзывчивым, тяжёлая фильтрация идёт с низким приоритетом
  const deferredSearch = useDeferredValue(search);

  const localeKey = locale === "ru" ? "ru" : "en";
  const allowedCategories = activeCategory
    ? FAVORITE_CATEGORY_FILTERS[activeCategory][localeKey]
    : null;

  // Фильтр + поиск + группировка по категориям (порядок групп — по первому появлению)
  const groups = useMemo(() => {
    if (!index) return [];
    const filtered = searchProducts(index, deferredSearch, allowedCategories);
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
  }, [index, deferredSearch, allowedCategories]);

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

  // Новый запрос / категория / язык -> снова первые 100 и прокрутка наверх
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    contentRef.current?.scrollTo({ top: 0 });
  }, [deferredSearch, activeCategory, index]);

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
      </div>

      {/* 📦 Контент */}
      <div className={styles["content-container"]} ref={contentRef}>
        <div className={styles["content"]}>
          {!index ? (
            <div className={styles["loader"]}>
              <div className={styles["spinner"]} />
            </div>
          ) : visibleGroups.length > 0 ? (
            <>
              {visibleGroups.map(([category, items]) => (
                <div key={category} className={styles["category-group"]}>
                  <h3 className={styles["category-title"]}>{categoryName(category)}</h3>

                  {items.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      isFavorite={favoriteSet.has(product.id)}
                      caloriesLabel={caloriesLabel}
                      onOpen={setOpenedSlug}
                      onToggleFavorite={toggleFavorite}
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

      <BottomNav />

      {/* 🧾 Вкладка с составом продукта */}
      {openedProduct && (
        <ProductDetailSheet
          slug={getSlug(openedProduct.link)}
          basicInfo={{ name: openedProduct.name, image: openedProduct.image }}
          fullInfoHref={openedProduct.link}
          onClose={() => setOpenedSlug(null)}
        />
      )}
    </div>
  );
};

export default ProductsClient;