// lib/productDetail.ts
//
// productDetails is no longer one big productDetails.json per locale — it's
// one file per product slug, under public/data/en/productDetails/<slug>.json
// and public/data/ru/productDetails/<slug>.json (same layout as the almonds.json
// example: macroNutrients[] with a calories/protein/carbs/fats/fiber entry,
// microNutrients[] with everything else). Ids inside macroNutrients /
// microNutrients are stable across locales — only the display "name" and the
// section titles are translated — so any code that matches on `id` (like
// nutritionDRI's slug lookups) doesn't need to care which locale loaded.
//
// Loading is a per-slug fetch() of a static file from public/ (NOT a dynamic
// import): import(`@/data/${locale}/productDetails/${slug}.json`) makes webpack
// bundle EVERY file in that folder (~5500 x 2 locales), which made compilation
// ~100x slower. fetch() keeps these files out of the webpack module graph while
// still shipping them inside the Capacitor app (offline works).
// Results are cached, so re-opening the same product/day is instant and we never
// re-read a file we already have.

export type ProductNutrient = {
  // "calories" is the only nutrient with a string id; every other row uses a
  // plain numeric row id (14, 28, ...) — `slug` is the stable string
  // identifier that actually matches vitaminDRI.json / dailyValueModule keys.
  id: string | number;
  name: string;
  slug: string;
  amount: string;
};

export type ProductDetail = {
  slug: string;
  name: string;
  category: string;
  macroTitle: string;
  macroNutrients: ProductNutrient[];
  microTitle: string;
  microNutrients: ProductNutrient[];
};

export type ProductLocale = "en" | "ru";

/** Детали продуктов (нутриенты) ВСЕГДА читаются из английской папки —
 *  независимо от выбранного языка интерфейса. Список продуктов (products.json)
 *  при этом по-прежнему грузится по локали. */
const DETAILS_LOCALE: ProductLocale = "en";

// Кеш ключится только по slug: язык интерфейса на загрузку не влияет.
const cache = new Map<string, Promise<ProductDetail | null>>();

export function loadProductDetail(
  // Параметр оставлен для совместимости с существующими вызовами и больше
  // НЕ влияет на то, какой файл грузится.
  _locale: ProductLocale,
  slug: string
): Promise<ProductDetail | null> {
  const key = slug;
  let cached = cache.get(key);

  if (!cached) {
    cached = fetch(`/data/${DETAILS_LOCALE}/productDetails/${encodeURIComponent(slug)}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ProductDetail>;
      })
      .catch((err) => {
        console.error(`Failed to load product detail for "${slug}"`, err);
        // не держим в кеше неудачу, чтобы следующая попытка могла сработать
        cache.delete(key);
        return null;
      });
    cache.set(key, cached);
  }

  return cached;
}

/** Loads several slugs in parallel, deduped, and returns them keyed by slug. */
export async function loadProductDetails(
  locale: ProductLocale,
  slugs: Iterable<string>
): Promise<Map<string, ProductDetail | null>> {
  const uniqueSlugs = Array.from(new Set(slugs));
  const entries = await Promise.all(
    uniqueSlugs.map(async (slug) => [slug, await loadProductDetail(locale, slug)] as const)
  );
  return new Map(entries);
}

/** Looks a nutrient up by its stable `slug` (e.g. "vitamin-a", "protein") — not
 *  `id`, which is just a numeric row id and isn't stable/meaningful to match on. */
export function findNutrientAmount(
  detail: ProductDetail | null | undefined,
  slug: string
): string | undefined {
  if (!detail) return undefined;
  return (
    detail.macroNutrients.find((n) => n.slug === slug)?.amount ??
    detail.microNutrients.find((n) => n.slug === slug)?.amount
  );
}