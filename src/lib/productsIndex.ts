// lib/productsIndex.ts
// Общий каталог продуктов для AddFoodSheet и страницы products.
//
// JSON грузится динамически (отдельным чанком) и только для нужной локали, а не
// статическим import: иначе ~6000 продуктов × 2 локали попадают в основной бандл.
// Промис кешируется на модульном уровне — AddFoodSheet и страница products
// используют один и тот же индекс, файл читается и обрабатывается один раз.

export type CatalogProduct = {
  id: number;
  name: string;
  category: string;
  calories: number;
  image: string;
  link: string;
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

export function loadProductsIndex(locale: string): Promise<ProductIndex> {
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
