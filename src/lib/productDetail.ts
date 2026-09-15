// lib/productDetail.ts
//
// productDetails is no longer one big productDetails.json per locale — it's
// one file per product slug, under /src/data/en/productDetails/<slug>.json
// and /src/data/ru/productDetails/<slug>.json (same layout as the almonds.json
// example: macroNutrients[] with a calories/protein/carbs/fats/fiber entry,
// microNutrients[] with everything else). Ids inside macroNutrients /
// microNutrients are stable across locales — only the display "name" and the
// section titles are translated — so any code that matches on `id` (like
// nutritionDRI's slug lookups) doesn't need to care which locale loaded.
//
// Loading is a per-slug dynamic import (same pattern VitaminDetailSheet.tsx
// uses for vitaminDRI.json), cached so re-opening the same product/day is
// instant and we never re-fetch a chunk we already have.

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

const cache = new Map<string, Promise<ProductDetail | null>>();

export function loadProductDetail(
  locale: ProductLocale,
  slug: string
): Promise<ProductDetail | null> {
  const key = `${locale}/${slug}`;
  let cached = cache.get(key);

  if (!cached) {
    cached = import(`@/data/${locale}/productDetails/${slug}.json`)
      .then((mod) => (mod.default ?? mod) as ProductDetail)
      .catch((err) => {
        console.error(`Failed to load product detail for "${slug}" (${locale})`, err);
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
