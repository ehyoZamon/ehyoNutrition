// lib/micronutrientStats.ts
//
// Средний % от суточной нормы (DRI) по каждому витамину/минералу за период
// (7 или 30 дней) + сравнение с предыдущим периодом такой же длины.
//
// Правила расчёта:
//  - учитываются только дни, где есть хотя бы одна запись со статусом
//    "consumed" (пустые дни не занижают среднее — так же считает
//    "Avg. calories" в statsSummary);
//  - процент за день по нутриенту ограничен 100%: один день с 300% витамина A
//    не "компенсирует" три дня без него (та же логика, что и в
//    buildSection из lib/dailyValue.ts);
//  - процент за период = среднее дневных (ограниченных) процентов;
//  - общий процент секции = среднее по нутриентам, у которых есть норма;
//  - математика всегда на EN productDetails (см. комментарий в dailyValue.ts).

import { format, subDays } from "date-fns";

import { getDatesWithEntriesInRange, getDiaryEntriesByDate } from "@/lib/diary";
import {
  accumulateNutrients,
  DiaryEntryInput,
  ProductLinkLookup,
  productSlugFromLink,
} from "@/lib/dailyValue";
import {
  DRIData,
  getRecommendedMg,
  loadVitaminDRI,
  resolveDRIContext,
  SimpleUserProfile,
} from "@/lib/nutritionDRI";
import { loadProductDetails, ProductDetail } from "@/lib/productDetail";
import {
  MINERAL_ITEMS,
  VITAMIN_PRIMARY,
  VITAMIN_SECONDARY,
} from "@/components/daily-value/dailyValueModule";

export type NutrientGroup = "vitamins" | "minerals";

export type NutrientStat = {
  key: string; // короткий ключ из dailyValueModule ("a", "iron", ...)
  label: string; // короткая подпись из dailyValueModule ("A", "B12", "Iron")
  slug: string; // канонический slug ("vitamin-a", "iron", ...)
  title: string; // англ. название из vitaminDRI.json — запасной вариант для подписи
  percent: number; // средний % нормы за период, 0..100
  delta: number | null; // изменение в п.п. к предыдущему периоду (null — нет данных)
};

export type GroupStats = {
  overall: number; // 0..100
  overallDelta: number | null;
  items: NutrientStat[]; // отсортированы по убыванию percent
};

export type MicronutrientStats = {
  loggedDays: number;
  totalDays: number;
  vitamins: GroupStats;
  minerals: GroupStats;
};

type PeriodAverages = {
  loggedDays: number;
  percentBySlug: Map<string, number>;
};

const vitaminItems = [...VITAMIN_PRIMARY, ...VITAMIN_SECONDARY].map((v) => ({
  key: v.key,
  label: v.label,
  slug: `vitamin-${v.key}`,
}));
const mineralItems = MINERAL_ITEMS.map((m) => ({ key: m.key, label: m.label, slug: m.key }));

const ALL_SLUGS = [...vitaminItems, ...mineralItems].map((i) => i.slug);

async function computePeriod(
  keys: string[],
  productMap: Map<number, ProductLinkLookup>,
  driData: DRIData,
  profile: SimpleUserProfile | null
): Promise<PeriodAverages> {
  const withEntries = await getDatesWithEntriesInRange(keys[0], keys[keys.length - 1]);

  // Последовательно: SQLite-соединение одно, так надёжнее в WebView.
  const perDay: DiaryEntryInput[][] = [];
  for (const key of keys) {
    if (!withEntries.has(key)) continue;
    const rows = await getDiaryEntriesByDate(key);

    const entries: DiaryEntryInput[] = [];
    for (const row of rows) {
      if ((row.status || "consumed") !== "consumed") continue;
      if (!productMap.has(row.product_id)) continue;
      entries.push({ productId: row.product_id, grams: row.amount });
    }
    if (entries.length > 0) perDay.push(entries);
  }

  if (perDay.length === 0) return { loggedDays: 0, percentBySlug: new Map() };

  const slugByProductId = new Map<number, string>();
  for (const day of perDay) {
    for (const e of day) {
      if (slugByProductId.has(e.productId)) continue;
      const product = productMap.get(e.productId);
      if (product) slugByProductId.set(e.productId, productSlugFromLink(product.link));
    }
  }

  const detailsBySlug = await loadProductDetails("en", slugByProductId.values());
  const detailsByProductId = new Map<number, ProductDetail | null>();
  slugByProductId.forEach((slug, productId) => {
    detailsByProductId.set(productId, detailsBySlug.get(slug) ?? null);
  });

  const ctx = resolveDRIContext(profile);
  const recommendedBySlug = new Map<string, number>();
  for (const slug of ALL_SLUGS) {
    const rec = getRecommendedMg(driData, slug, ctx);
    if (rec !== null && rec > 0) recommendedBySlug.set(slug, rec);
  }

  const sumBySlug = new Map<string, number>();
  for (const day of perDay) {
    const { mgById } = accumulateNutrients(day, detailsByProductId, slugByProductId);
    recommendedBySlug.forEach((rec, slug) => {
      const pct = Math.min(100, ((mgById.get(slug) ?? 0) / rec) * 100);
      sumBySlug.set(slug, (sumBySlug.get(slug) ?? 0) + pct);
    });
  }

  const percentBySlug = new Map<string, number>();
  sumBySlug.forEach((sum, slug) => percentBySlug.set(slug, sum / perDay.length));

  return { loggedDays: perDay.length, percentBySlug };
}

function average(values: number[]): number {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
}

export async function computeMicronutrientStats(params: {
  range: number;
  profile: SimpleUserProfile | null;
  productMap: Map<number, ProductLinkLookup>;
}): Promise<MicronutrientStats> {
  const { range, profile, productMap } = params;

  const today = new Date();
  const keyAt = (offset: number) => format(subDays(today, offset), "yyyy-MM-dd");
  // от старого дня к новому
  const currentKeys = Array.from({ length: range }, (_, i) => keyAt(range - 1 - i));
  const previousKeys = Array.from({ length: range }, (_, i) => keyAt(2 * range - 1 - i));

  const driData = await loadVitaminDRI();

  const current = await computePeriod(currentKeys, productMap, driData, profile);
  const previous = await computePeriod(previousKeys, productMap, driData, profile);
  const hasPrevious = previous.loggedDays > 0;

  const buildGroup = (items: { key: string; label: string; slug: string }[]): GroupStats => {
    const rows: NutrientStat[] = [];
    const currentValues: number[] = [];
    const previousValues: number[] = [];

    for (const { key, label, slug } of items) {
      const cur = current.percentBySlug.get(slug);
      if (cur === undefined) continue; // для этого нутриента нет нормы

      const prev = previous.percentBySlug.get(slug);
      currentValues.push(cur);
      if (prev !== undefined) previousValues.push(prev);

      rows.push({
        key,
        label,
        slug,
        title: driData[slug]?.title ?? key,
        percent: Math.round(cur),
        delta: hasPrevious && prev !== undefined ? Math.round(cur) - Math.round(prev) : null,
      });
    }

    rows.sort((a, b) => b.percent - a.percent);

    const overall = average(currentValues);
    const overallDelta = hasPrevious
      ? Math.round(overall) - Math.round(average(previousValues))
      : null;

    return { overall: Math.round(overall), overallDelta, items: rows };
  };

  return {
    loggedDays: current.loggedDays,
    totalDays: range,
    vitamins: buildGroup(vitaminItems),
    minerals: buildGroup(mineralItems),
  };
}