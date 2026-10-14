import type { VitaminDetail } from "@/types/details";

import vitaminsEn from "@/data/en/vitaminDetails.json";
import vitaminsRu from "@/data/ru/vitaminDetails.json";

type Locale = "en" | "ru";

const vitaminDetailsMap = {
  en: vitaminsEn,
  ru: vitaminsRu,
} as unknown as Record<Locale, Record<string, VitaminDetail>>;

export function getVitaminSlugs(): string[] {
  return Object.keys(vitaminDetailsMap.en);
}

export function getVitaminDetail(
  slug: string,
  locale: string = "en"
): VitaminDetail | undefined {
  return (vitaminDetailsMap[locale as Locale] ?? vitaminDetailsMap.en)[slug];
}