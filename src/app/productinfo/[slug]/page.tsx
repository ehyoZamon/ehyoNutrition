// src/app/productinfo/[slug]/page.tsx
import { notFound } from "next/navigation";
import ProductInfoClient from "./ProductInfoClient";
import { getProductDetail, getProductSlugs } from "@/lib/details";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Обязательная функция для сборки в статическое мобильное приложение (output: 'export')
export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export default async function ProductInfoPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Извлекаем из локальных JSON обе версии данных продукта
  const productEn = getProductDetail(slug, "en");
  const productRu = getProductDetail(slug, "ru");

  // Если продукт вообще не найден ни в одном файле — отдаем 404
  if (!productEn && !productRu) {
    notFound();
  }

  // Передаем обе языковые версии в клиентский компонент
  return (
    <ProductInfoClient 
      productEn={productEn || productRu!} 
      productRu={productRu || productEn!} 
    />
  );
}