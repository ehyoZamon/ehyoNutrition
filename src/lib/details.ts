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

// --- ВСПОМОГАТЕЛЬНЫЕ УТИЛИТЫ ---

// Извлекает число из строк вида "158 mg", "9.5 g", "40 kcal". Если "present" или пусто — возвращает 0.
function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.toLowerCase() === "present") return 0;
  const match = amountStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// --- ФУНКЦИИ ---

export function getProductSlugs(): string[] {
  return Object.keys(productDetailsEn);
}

export function getVitaminSlugs(): string[] {
  return Object.keys(vitaminDetailsEn);
}

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

// ОБНОВЛЕННАЯ ФУНКЦИЯ: Сортирует продукты по убыванию количества нутриента
export function getProductsByVitaminSlug(
  vitaminSlug: string,
  locale: string = "en"
): VitaminFoodSourceProduct[] {
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
        amount, // Сохраняем оригинальную строку (например, "158 mg") для рендеринга
      };
    })
    .filter((item): item is VitaminFoodSourceProduct => item !== null)
    // Сортируем по убыванию числового значения из строки amount
    .sort((a, b) => parseAmount(b.amount) - parseAmount(a.amount));
}