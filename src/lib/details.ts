import productDetailsData from "@/data/productDetails.json";
import productsCatalogData from "@/data/products.json";
import vitaminDetailsData from "@/data/vitaminDetails.json";
import type {
  ProductDetail,
  VitaminDetail,
  VitaminFoodSourceProduct,
} from "@/types/details";

const productDetails = productDetailsData as Record<string, ProductDetail>;
const vitaminDetails = vitaminDetailsData as Record<string, VitaminDetail>;

const productsCatalog = productsCatalogData as Array<{
  name: string;
  image: string;
  link: string;
}>;

const catalogBySlug = new Map(
  productsCatalog.map((item) => {
    const slug = item.link.replace("/productinfo/", "");
    return [slug, item] as const;
  })
);

export function getProductSlugs(): string[] {
  return Object.keys(productDetails);
}

export function getVitaminSlugs(): string[] {
  return Object.keys(vitaminDetails);
}

export function getProductDetail(slug: string): ProductDetail | undefined {
  return productDetails[slug];
}

export function getVitaminDetail(slug: string): VitaminDetail | undefined {
  return vitaminDetails[slug];
}

function productContainsVitamin(
  product: ProductDetail,
  vitaminSlug: string
): string | null {
  const nutrients = [...product.macroNutrients, ...product.microNutrients];

  for (const nutrient of nutrients) {
    if (nutrient.slug === vitaminSlug) {
      return nutrient.amount;
    }
  }

  return null;
}

export function getProductsByVitaminSlug(
  vitaminSlug: string
): VitaminFoodSourceProduct[] {
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
    .sort((a, b) => a.name.localeCompare(b.name));
}
