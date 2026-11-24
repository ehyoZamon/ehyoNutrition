// lib/productsIndex.ts
// Общий каталог продуктов для AddFoodSheet и страницы products.
//
// JSON грузится динамически (отдельным чанком) и только для нужной локали, а не
// статическим import: иначе ~6000 продуктов × 2 локали попадают в основной бандл.
// Промис кешируется на модульном уровне — AddFoodSheet и страница products
// используют один и тот же индекс, файл читается и обрабатывается один раз.

import { getCustomFoodsVersion, loadCustomFoods } from "@/lib/customFoods";

export type CatalogProduct = {
  id: number;
  name: string;
  category: string;
  calories: number;
  image: string;
  link: string;
  nutritionPercentile?: number;
  nutritionStars?: 1 | 2 | 3 | 4 | 5;
};
type IndexEntry = {
  product: CatalogProduct;
  /** название в нижнем регистре */
  name: string;
  /** название + категория в нижнем регистре (по ней идёт поиск) */
  hay: string;
};

export type ProductIndex = {
  all: CatalogProduct[];
  entries: IndexEntry[];
  /** slug из link ("/productinfo/soy-sauce" -> "soy-sauce") -> продукт */
  bySlug: Map<string, CatalogProduct>;
};

export const getSlug = (link: string) => link.substring(link.lastIndexOf("/") + 1);

// ё -> е, чтобы "мёд" находился по запросу "мед" (и наоборот)
const normalize = (s: string) => s.toLowerCase().replace(/ё/g, "е");

const cache = new Map<string, Promise<ProductIndex>>();

// Чистый каталог (products.json) — грузится и обрабатывается один раз на локаль.
function loadCatalogIndex(locale: string): Promise<ProductIndex> {
  let cached = cache.get(locale);
  if (!cached) {
    cached = (
      locale === "ru"
        ? import("@/data/ru/products.json")
        : import("@/data/en/products.json")
    ).then((mod) => {
      const all = mod.default as unknown as CatalogProduct[];
      const bySlug = new Map<string, CatalogProduct>();
      // lowercase и slug считаем один раз, а не при каждом нажатии клавиши / рендере
      const entries = all.map((product) => {
        const slug = getSlug(product.link);
        if (!bySlug.has(slug)) bySlug.set(slug, product);
        const name = normalize(product.name);
        return { product, name, hay: `${name} ${normalize(product.category)}` };
      });
      return { all, entries, bySlug };
    });
    // при ошибке загрузки не кешируем, чтобы можно было повторить
    cached.catch(() => cache.delete(locale));
    cache.set(locale, cached);
  }
  return cached;
}

/**
 * Поиск: все слова запроса должны встретиться в названии или категории.
 * Порядок результатов: название начинается с запроса -> слова есть в названии ->
 * совпадение только по категории (внутри групп сохраняется исходный порядок).
 * `categories` — необязательный фильтр по точному названию категории.
 */
export function searchProducts(
  index: ProductIndex,
  query: string,
  categories?: readonly string[] | null
): CatalogProduct[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const allow = categories ? new Set(categories) : null;

  if (tokens.length === 0) {
    return allow ? index.all.filter((p) => allow.has(p.category)) : index.all;
  }

  const starts: CatalogProduct[] = [];
  const inName: CatalogProduct[] = [];
  const inCategory: CatalogProduct[] = [];

  for (const e of index.entries) {
    if (allow && !allow.has(e.product.category)) continue;
    if (!tokens.every((t) => e.hay.includes(t))) continue;
    if (e.name.startsWith(tokens[0])) starts.push(e.product);
    else if (tokens.every((t) => e.name.includes(t))) inName.push(e.product);
    else inCategory.push(e.product);
  }
  return starts.concat(inName, inCategory);
}

// ---------------------------------------------------------------------------
// Блюда пользователя (Create Food) подмешиваются в индекс, поэтому все, кто
// ищет продукт по id/slug или показывает список — AddFoodSheet, Products,
// дневник, расчёт %DV — видят их без отдельной логики.
// Индекс с блюдами кешируется по версии списка блюд: создали блюдо / импортировали
// бэкап -> версия выросла -> следующий loadProductsIndex() соберёт его заново
// (экраны вызывают его повторно через useCustomFoodsVersion()).
// ---------------------------------------------------------------------------
const mergedCache = new Map<string, { version: number; promise: Promise<ProductIndex> }>();

function withCustomFoods(base: ProductIndex, custom: CatalogProduct[]): ProductIndex {
  if (custom.length === 0) return base;

  const bySlug = new Map(base.bySlug);
  const entries: IndexEntry[] = custom.map((product) => {
    bySlug.set(getSlug(product.link), product);
    const name = normalize(product.name);
    const source = normalize((product as { source?: string }).source ?? "");
    return { product, name, hay: `${name} ${source}` };
  });

  // свои блюда — в начале, чтобы они шли выше каталога при пустом поиске и при равной релевантности
  return {
    all: [...custom, ...base.all],
    entries: [...entries, ...base.entries],
    bySlug,
  };
}

export function loadProductsIndex(locale: string): Promise<ProductIndex> {
  const version = getCustomFoodsVersion();
  const hit = mergedCache.get(locale);
  if (hit && hit.version === version) return hit.promise;

  let customFailed = false;
  const promise = Promise.all([
    loadCatalogIndex(locale),
    // если БД ещё недоступна — каталог всё равно показываем, блюда подтянутся при следующей попытке
    loadCustomFoods(locale).catch((e) => {
      customFailed = true;
      console.error("Не удалось загрузить свои блюда:", e);
      return [] as CatalogProduct[];
    }),
  ]).then(([base, custom]) => {
    if (customFailed) mergedCache.delete(locale);
    return withCustomFoods(base, custom);
  });

  mergedCache.set(locale, { version, promise });
  // при ошибке загрузки каталога не кешируем, чтобы можно было повторить
  promise.catch(() => mergedCache.delete(locale));
  return promise;
}