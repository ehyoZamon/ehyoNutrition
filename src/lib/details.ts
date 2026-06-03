import type {
  ProductDetail,
  VitaminDetail,
  VitaminFoodSourceProduct,
} from "@/types/details";

// 1. Импортируем английские и русские версии всех JSON-файлов данных
import productDetailsEn from "@/data/en/productDetails.json";
import productDetailsRu from "@/data/ru/productDetails.json";

import productsCatalogEn from "@/data/en/products.json";
import productsCatalogRu from "@/data/ru/products.json";

import vitaminDetailsEn from "@/data/en/vitaminDetails.json";
import vitaminDetailsRu from "@/data/ru/vitaminDetails.json";

// Маппинг для быстрого доступа к данным в зависимости от локали
const productDetailsMap = {
  en: productDetailsEn as unknown as Record<string, ProductDetail>,
  ru: productDetailsRu as unknown as Record<string, ProductDetail>,
};

const vitaminDetailsMap = {
  en: vitaminDetailsEn as unknown as Record<string, VitaminDetail>,
  ru: vitaminDetailsRu as unknown as Record<string, VitaminDetail>,
};

type CatalogItem = { name: string; image: string; link: string };
const productsCatalogMap = {
  en: productsCatalogEn as unknown as CatalogItem[],
  ru: productsCatalogRu as unknown as CatalogItem[],
};

// 2. Кэшируем Catalog по Slug для каждой локали по отдельности
const catalogBySlugEn = new Map(
  productsCatalogMap.en.map((item) => [item.link.replace("/productinfo/", ""), item] as const)
);
const catalogBySlugRu = new Map(
  productsCatalogMap.ru.map((item) => [item.link.replace("/productinfo/", ""), item] as const)
);

const catalogBySlugMap = {
  en: catalogBySlugEn,
  ru: catalogBySlugRu,
};

// --- ФУНКЦИИ ---

// Слагов в обеих базах одинаковое количество, берем дефолтный en
export function getProductSlugs(): string[] {
  return Object.keys(productDetailsEn);
}

export function getVitaminSlugs(): string[] {
  return Object.keys(vitaminDetailsEn);
}

// Добавляем аргумент locale со значением по умолчанию 'en'
export function getProductDetail(slug: string, locale: string = "en"): ProductDetail | undefined {
  const source = productDetailsMap[locale as keyof typeof productDetailsMap] || productDetailsMap.en;
  return source[slug];
}

export function getVitaminDetail(slug: string, locale: string = "en"): VitaminDetail | undefined {
  const source = vitaminDetailsMap[locale as keyof typeof vitaminDetailsMap] || vitaminDetailsMap.en;
  return source[slug];
}

function productContainsVitamin(
  product: ProductDetail,
  vitaminSlug: string
): string | null {
  // Безопасно получаем массивы, если они undefined, используем пустой массив []
  const macroNutrients = product.macroNutrients || [];
  const microNutrients = product.microNutrients || [];
  
  const nutrients = [...macroNutrients, ...microNutrients];

  for (const nutrient of nutrients) {
    if (nutrient.slug === vitaminSlug) {
      return nutrient.amount;
    }
  }

  return null;
}

// Самая важная функция: собирает продукты на нужном языке
export function getProductsByVitaminSlug(
  vitaminSlug: string,
  locale: string = "en"
): VitaminFoodSourceProduct[] {
  // Выбираем правильные источники данных под текущий язык
  const productDetails = productDetailsMap[locale as keyof typeof productDetailsMap] || productDetailsMap.en;
  const catalogBySlug = catalogBySlugMap[locale as keyof typeof catalogBySlugMap] || catalogBySlugMap.en;

  return Object.values(productDetails)
    .map((product) => {
      const amount = productContainsVitamin(product, vitaminSlug);
      if (!amount) return null;

      const catalogItem = catalogBySlug.get(product.slug);

      return {
        slug: product.slug,
        name: product.name,
        image: catalogItem?.image ?? product.image,
        link: `/productinfo/${product.slug}`,
        amount,
      };
    })
    .filter((item): item is VitaminFoodSourceProduct => item !== null)
    // Сортировка будет работать корректно для алфавита выбранной локали (включая кириллицу)
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}