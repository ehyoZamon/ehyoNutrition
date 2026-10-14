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
  
  // Достаем из локальных файлов данные для обеих локалей
  const vitaminEn = getVitaminDetail(slug, "en");
  const vitaminRu = getVitaminDetail(slug, "ru");

  // Если информации нет ни на одном языке — 404
  if (!vitaminEn && !vitaminRu) {
    notFound();
  }

  return (
    <VitaminInfoClient 
      vitaminEn={vitaminEn || vitaminRu!} 
      vitaminRu={vitaminRu || vitaminEn!} 
    />
  );
}