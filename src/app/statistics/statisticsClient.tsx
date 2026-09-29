"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { format, subDays } from "date-fns";
import { ru, enUS } from "date-fns/locale";

import styles from "./statistics.module.css";
import BottomNav from "@/components/bottomNav/BottomNav";
import { useAddFood } from "@/components/food-diary/addFoodProvider";
import StatsSummary, { SummaryItem } from "@/components/statistics/statsSummary";
import CaloriesChart from "@/components/statistics/caloriesChart";
import MealsBreakdown, { MealSlice } from "@/components/statistics/mealsBreakdown";
import WaterChart from "@/components/statistics/waterChart";
import TopProducts, { TopProductItem } from "@/components/statistics/topProducts";

import { getDiaryEntriesByDate, getDatesWithEntriesInRange } from "@/lib/diary";
import { getUserProfile, UserProfile } from "@/lib/userProfile";
import { calcWaterGoalMl, getWaterByDate } from "@/lib/water";
import {
  DayStat,
  MEAL_KEYS,
  MealKey,
  estimateDailyKcal,
  summarize,
} from "@/lib/statistics";

import productsRu from "@/data/ru/products.json";
import productsEn from "@/data/en/products.json";

const RANGES = [7, 30] as const;
type Range = (typeof RANGES)[number];

const MEAL_COLORS: Record<MealKey, string> = {
  breakfast: "#f5b971",
  lunch: "#91c788",
  dinner: "#8b85d6",
  snacks: "#ff8a70",
  uncategorized: "#c9c5bd",
};

const TOP_PRODUCTS_LIMIT = 5;

type LoadedStats = {
  days: DayStat[];
  mealKcal: Record<MealKey, number>;
  topProducts: { id: number; kcal: number; grams: number; count: number }[];
};

const StatisticsClient = () => {
  const t = useTranslations("Statistics");
  const locale = useLocale();
  const { diaryVersion } = useAddFood();

  const [range, setRange] = useState<Range>(7);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LoadedStats | null>(null);
  const [loading, setLoading] = useState(true);

  const dateLocale = locale === "ru" ? ru : enUS;

  const productMap = useMemo(() => {
    const list = (locale === "ru" ? productsRu : productsEn) as typeof productsEn;
    return new Map(list.map((p) => [p.id, p]));
  }, [locale]);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch((e) => console.error("Не удалось загрузить профиль:", e));
  }, []);

  // ---- Загрузка данных за период (страница владеет данными, модули только рисуют) ----
  // diaryVersion меняется, когда запись добавили через кнопку "Add" в навбаре.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const dates = Array.from({ length: range }, (_, i) => subDays(today, range - 1 - i));
        const keys = dates.map((d) => format(d, "yyyy-MM-dd"));

        // Один запрос вместо N: пропускаем дни, в которых записей нет.
        const withEntries = await getDatesWithEntriesInRange(keys[0], keys[keys.length - 1]);

        const mealKcal: Record<MealKey, number> = {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snacks: 0,
          uncategorized: 0,
        };
        const productTotals = new Map<number, { kcal: number; grams: number; count: number }>();
        const days: DayStat[] = [];

        // Последовательно: SQLite-соединение одно, так надёжнее в WebView.
        for (let i = 0; i < dates.length; i++) {
          const key = keys[i];
          let dayKcal = 0;
          let consumedCount = 0;

          if (withEntries.has(key)) {
            const rows = await getDiaryEntriesByDate(key);

            for (const row of rows) {
              // "planned" в статистику не идёт, пока не подтверждён
              if ((row.status || "consumed") !== "consumed") continue;

              const product = productMap.get(row.product_id);
              if (!product) continue;

              const kcal = (product.calories * row.amount) / 100;
              const meal: MealKey = MEAL_KEYS.includes(row.meal as MealKey)
                ? (row.meal as MealKey)
                : "uncategorized";

              dayKcal += kcal;
              consumedCount += 1;
              mealKcal[meal] += kcal;

              const prev = productTotals.get(row.product_id) ?? { kcal: 0, grams: 0, count: 0 };
              productTotals.set(row.product_id, {
                kcal: prev.kcal + kcal,
                grams: prev.grams + row.amount,
                count: prev.count + 1,
              });
            }
          }

          const waterMl = await getWaterByDate(key);

          days.push({
            date: key,
            label: format(dates[i], range === 7 ? "EEEEEE" : "d", { locale: dateLocale }),
            fullLabel: format(dates[i], "d MMMM", { locale: dateLocale }),
            kcal: Math.round(dayKcal),
            waterMl: waterMl || 0,
            logged: consumedCount > 0,
          });
        }

        const topProducts = Array.from(productTotals.entries())
          .map(([id, v]) => ({ id, ...v }))
          .sort((a, b) => b.kcal - a.kcal)
          .slice(0, TOP_PRODUCTS_LIMIT);

        if (!cancelled) setStats({ days, mealKcal, topProducts });
      } catch (e) {
        console.error("Не удалось загрузить статистику:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [range, productMap, dateLocale, diaryVersion]);

  // ---- Производные значения для модулей ----
  const waterGoalMl = useMemo(() => {
    const goal = calcWaterGoalMl(profile);
    return typeof goal === "number" && Number.isFinite(goal) && goal > 0 ? goal : null;
  }, [profile]);

  const referenceKcal = useMemo(() => estimateDailyKcal(profile), [profile]);

  const summary = useMemo(
    () => (stats ? summarize(stats.days, waterGoalMl) : null),
    [stats, waterGoalMl]
  );

  const fmt = (n: number) => n.toLocaleString(locale);
  const tickInterval = range === 7 ? 0 : 2;
  const hasData = !!stats && stats.days.some((d) => d.logged || d.waterMl > 0);

  const summaryItems: SummaryItem[] = summary
    ? [
        {
          label: t("avgCalories"),
          value: `${fmt(summary.avgKcal)} ${t("kcalUnit")}`,
          accent: "green",
        },
        {
          label: t("loggedDays"),
          value: `${summary.loggedDays}/${range}`,
          accent: "purple",
        },
        {
          label: t("avgWater"),
          value: `${fmt(summary.avgWaterMl)} ${t("mlUnit")}`,
          accent: "blue",
        },
        ...(waterGoalMl
          ? [
              {
                label: t("waterGoalDays"),
                value: `${summary.waterGoalDays}/${range}`,
                accent: "coral" as const,
              },
            ]
          : []),
      ]
    : [];

  const mealTotal = stats ? MEAL_KEYS.reduce((sum, k) => sum + stats.mealKcal[k], 0) : 0;
  const mealSlices: MealSlice[] = stats
    ? MEAL_KEYS.filter((k) => stats.mealKcal[k] > 0).map((k) => ({
        key: k,
        label: t(`meal_${k}`),
        kcal: Math.round(stats.mealKcal[k]),
        percent: mealTotal ? Math.round((stats.mealKcal[k] / mealTotal) * 100) : 0,
        color: MEAL_COLORS[k],
      }))
    : [];

  const topItems: TopProductItem[] = stats
    ? stats.topProducts.flatMap((p) => {
        const product = productMap.get(p.id);
        if (!product) return [];
        const max = stats.topProducts[0]?.kcal || 1;
        return [
          {
            id: p.id,
            name: product.name,
            image: product.image,
            value: `${fmt(Math.round(p.kcal))} ${t("kcalUnit")}`,
            subtitle: `${p.count}× · ${fmt(Math.round(p.grams))} ${t("gramsUnit")}`,
            ratio: p.kcal / max,
          },
        ];
      })
    : [];

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["header"]}>
        <h1 className={styles["page-title"]}>{t("title")}</h1>

        <div className={styles["period-tabs"]} role="tablist">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={range === r}
              className={`${styles["period-tab"]} ${
                range === r ? styles["period-tab--active"] : ""
              }`}
              onClick={() => setRange(r)}
            >
              {t(r === 7 ? "period7" : "period30")}
            </button>
          ))}
        </div>
      </div>

      <div className={styles["content-container"]}>
        <div className={styles["content"]}>
          {loading && !stats && <div className={styles["loading"]}>{t("loading")}</div>}

          {stats && !hasData && (
            <div className={styles["empty-state"]}>
              <Image src="/nothing-found.svg" alt="" width={40} height={40} />
              <span>{t("emptyTitle")}</span>
              <span className={styles["empty-hint"]}>{t("emptyHint")}</span>
            </div>
          )}

          {stats && hasData && (
            <>
              <StatsSummary items={summaryItems} />

              <CaloriesChart
                title={t("caloriesTitle")}
                seriesName={t("caloriesTitle")}
                unit={t("kcalUnit")}
                locale={locale}
                data={stats.days}
                referenceKcal={referenceKcal}
                referenceLabel={t("reference")}
                tickInterval={tickInterval}
              />

              {mealSlices.length > 0 && (
                <MealsBreakdown
                  title={t("mealsTitle")}
                  unit={t("kcalUnit")}
                  locale={locale}
                  totalKcal={Math.round(mealTotal)}
                  slices={mealSlices}
                />
              )}

              <WaterChart
                title={t("waterTitle")}
                seriesName={t("waterTitle")}
                unit={t("mlUnit")}
                locale={locale}
                data={stats.days}
                goalMl={waterGoalMl}
                goalLabel={t("goal")}
                tickInterval={tickInterval}
              />

              {topItems.length > 0 && (
                <TopProducts title={t("topTitle")} items={topItems} />
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default StatisticsClient;