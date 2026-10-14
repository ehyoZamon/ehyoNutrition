// src/app/vitamininfo/[slug]/page.tsx
import { notFound } from "next/navigation";
import VitaminInfoClient from "./VitaminInfoClient";
import { getVitaminDetail, getVitaminSlugs } from "@/lib/details";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Обязательно для статического экспорта (output: 'export') под Capacitor
export function generateStaticParams() {
  return getVitaminSlugs().map((slug) => ({ slug }));
}

export default async function VitaminInfoPage({ params }: PageProps) {
  const { slug } = await params;

  const vitaminEn = getVitaminDetail(slug, "en");
  const vitaminRu = getVitaminDetail(slug, "ru");

  const fallback = vitaminEn ?? vitaminRu;
  if (!fallback) notFound();

  return (
    <VitaminInfoClient
      vitaminEn={vitaminEn ?? fallback}
      vitaminRu={vitaminRu ?? fallback}
    />
  );
}