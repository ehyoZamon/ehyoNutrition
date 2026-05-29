import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server"; // Импортируем получение локали на сервере
import ProductInfoClient from "./ProductInfoClient";
import { getProductDetail, getProductSlugs } from "@/lib/details";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Next.js сгенерирует статические страницы для всех slug
export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export default async function ProductInfoPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Получаем текущую локаль сборки/запроса ("ru" или "en")
  const locale = await getLocale();
  
  // Передаем локаль в функцию получения данных
  const product = getProductDetail(slug, locale);

  if (!product) {
    notFound();
  }

  return <ProductInfoClient product={product} />;
}