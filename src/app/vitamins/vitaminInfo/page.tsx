import { Suspense } from "react";
import VitaminInfoClient, { type VitaminInfoMap } from "./VitaminInfoClient";
import { getVitaminDetail, getVitaminSlugs } from "@/lib/details";

// Одна статическая страница: /vitamins/vitaminInfo?slug=<slug>
// Данные читаются на сборке через getVitaminDetail (как раньше), а выбор витамина
// по ?slug= делает клиент. useSearchParams() требует Suspense при статическом экспорте.
export default function VitaminInfoPage() {
  const vitamins: VitaminInfoMap = {};

  for (const slug of getVitaminSlugs()) {
    const en = getVitaminDetail(slug, "en");
    const ru = getVitaminDetail(slug, "ru");

    const fallback = en ?? ru;
    if (!fallback) continue;

    vitamins[slug] = { en: en ?? fallback, ru: ru ?? fallback };
  }

  return (
    <Suspense fallback={null}>
      <VitaminInfoClient vitamins={vitamins} />
    </Suspense>
  );
}