import { notFound } from "next/navigation";
import ProductInfoClient from "./ProductInfoClient";
import { getProductDetail, getProductSlugs } from "@/lib/details";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export default async function ProductInfoPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductDetail(slug);

  if (!product) {
    notFound();
  }

  return <ProductInfoClient product={product} />;
}
