"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isToday,
  isSameMonth,
  format,
} from "date-fns";
import { ru, enUS } from "date-fns/locale";
import styles from "./foodDiary.module.css";
import DailyValueModule, { NutrientClickInfo } from "@/components/daily-value/dailyValueModule";
import AddFoodSheet, { DiaryProduct } from "@/components/food-diary/addFoodSheet";
import QuantitySheet from "@/components/food-diary/quantitySheet";
import DeleteConfirmSheet from "@/components/food-diary/deleteConfirmSheet";
import NutrientDetailSheet, { NutrientDetailInfo } from "@/components/food-diary/nutrientDetailSheet";
import {
  computeDailyValueData,
  computeNutrientBreakdown,
  emptyDailyValueData,
  getTopProductsForNutrient,
  NutrientBreakdownRow,
  slugForNutrientKey,
  TopProductForNutrient,
} from "@/lib/dailyValue";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import {
  addDiaryEntry,
  deleteDiaryEntry,
  updateDiaryEntry,
  getDiaryEntriesByDate,
  getDatesWithEntriesInRange,
} from "@/lib/diary";

import { parseServingInfo, formatAmountLabel } from "@/lib/servingInfo";
import { loadProductDetail } from "@/lib/productDetail";
import { getUserProfile, UserProfile } from "@/lib/userProfile";

import productsRu from "@/data/ru/products.json";
import productsEn from "@/data/en/products.json";
// productDetails is now one file per product slug (see lib/productDetail.ts)
// instead of a single productDetails.json — loaded on demand below.

// ---- Types ----
type DayTone = "green" | "coral" | "muted";

// "uncategorized" is never chosen by the user directly — it's only the
// fallback stored on an entry auto-added between 22:00–04:59 while on
// the "All" tab. It has no tab of its own but still shows up under "All".
type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "uncategorized";
type MealFilter = "all" | MealType;

type FoodEntry = {
  id: number; // id строки в diary
  productId: number;
  emoji: string;
  label: string;
  amount: string;
  grams: number;
  meal: MealType;
  calories: number; // kcal for this entry's amount (product.calories is per 100g)
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Tabs shown above the intake list, in display order. "all" has no
// time-based auto-assignment target of its own — see resolveMealForAdd.
const MEAL_TABS: { key: MealFilter; icon: string }[] = [
  { key: "all", icon: "/food-diary/meal.svg" },
  { key: "breakfast", icon: "/food-diary/breakfast.svg" },
  { key: "lunch", icon: "/food-diary/lunch.svg" },
  { key: "dinner", icon: "/food-diary/dinner.svg" },
  { key: "snacks", icon: "/food-diary/snacks.svg" },
];

const MEAL_FALLBACK_LABELS: Record<MealFilter, string> = {
  all: "All",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
  uncategorized: "Uncategorized",
};

// Time-of-day → meal, used only when a product is added while the "All"
// tab is active (so the app has to guess which meal it belongs to):
//   05:00–10:59 breakfast · 11:00–15:59 lunch · 16:00–21:59 dinner
//   snacks is never picked by time, only by the user selecting that tab
//   22:00–04:59 (or anything outside the windows above) → uncategorized
const resolveMealByTime = (date: Date): Exclude<MealType, "snacks"> => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 22) return "dinner";
  return "uncategorized";
};


const FoodDiaryClient = () => {
  const locale = useLocale();
  const t = useTranslations("FoodDiary");
  const navBar = useTranslations("navBar");

  // Same graceful-fallback pattern already used in QuantitySheet — lets
  // the nutrient-detail sheet's title text ship before messages/*.json
  // gets the new "vitaminSingular" key.
  const tt = (key: string, fallback: string) => {
    try {
      const value = t(key);
      return value === key ? fallback : value;
    } catch {
      return fallback;
    }
  };

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => today);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealFilter>("all");
  const [entryList, setEntryList] = useState<FoodEntry[]>([]);
  const [datesWithEntries, setDatesWithEntries] = useState<Set<string>>(new Set());

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isQuantitySheetOpen, setIsQuantitySheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DiaryProduct | null>(null);

  // Редактирование уже добавленной записи (клик по элементу intake-list)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);

  // Подтверждение удаления записи (клик по иконке корзины)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<FoodEntry | null>(null);

  // Разбивка нутриента по продуктам (клик по кольцу/бару в DailyValueModule)
  const [isNutrientSheetOpen, setIsNutrientSheetOpen] = useState(false);
  const [nutrientInfo, setNutrientInfo] = useState<NutrientDetailInfo | null>(null);
  const [nutrientPercent, setNutrientPercent] = useState(0);
  const [nutrientRows, setNutrientRows] = useState<NutrientBreakdownRow[]>([]);
  const [nutrientLoading, setNutrientLoading] = useState(false);
  const [nutrientRecommendedLabel, setNutrientRecommendedLabel] = useState<string | null>(null);
  const [nutrientUlLabel, setNutrientUlLabel] = useState<string | null>(null);
  const [nutrientUlPercent, setNutrientUlPercent] = useState<number | null>(null);
  const [nutrientConsumedLabel, setNutrientConsumedLabel] = useState<string | null>(null);
  // Replaces a plain isOverLimit boolean: "danger" is a real, any-source UL
  // risk; "info" is an over-UL flag for a nutrient whose limit applies to
  // supplements specifically (folate, niacin, ...) — see the ulMode comment
  // in lib/dailyValue.ts. nutrientUlNote is the short explanation shown
  // alongside it, resolved to the active locale by computeNutrientBreakdown.
  const [nutrientUlSeverity, setNutrientUlSeverity] = useState<"none" | "info" | "danger">("none");
  const [nutrientUlNote, setNutrientUlNote] = useState<string | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductForNutrient[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(false);

const dateFnsLocale = useMemo(() => (locale === "ru" ? ru : enUS), [locale]);
  // ---- Локализованные данные продуктов ----
  const productMap = useMemo(() => {
    const list = (locale === "ru" ? productsRu : productsEn) as DiaryProduct[];
    const map = new Map<number, DiaryProduct>();
    list.forEach((p) => map.set(p.id, p));
    return map;
  }, [locale]);

  // Personal info (birth date + gender) needed to resolve which DRI
  // bracket applies — loaded once, from the same storage onboarding writes to.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    let cancelled = false;
    getUserProfile().then((p) => {
      if (!cancelled) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // computeDailyValueData is now async (it loads per-product nutrient files
  // and the user's personal DRI), so its result lives in state instead of a
  // synchronous useMemo.
  const [dailyValueData, setDailyValueData] = useState(emptyDailyValueData());

  useEffect(() => {
    let cancelled = false;

    computeDailyValueData(
      entryList.map((e) => ({ productId: e.productId, grams: e.grams })),
      productMap,
      profile
    ).then((data) => {
      if (!cancelled) setDailyValueData(data);
    });

    return () => {
      cancelled = true;
    };
  }, [entryList, productMap, profile]);

  // ---- Сетка недель ----
  const weeks = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });

    const days: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }

    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [viewMonth]);

  // ---- Загрузка записей за выбранный день ----
  const loadEntriesForDate = useCallback(
    async (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const rows = await getDiaryEntriesByDate(dateStr);
      const productLocale = locale === "ru" ? "ru" : "en";

      const mapped: FoodEntry[] = await Promise.all(
        rows.map(async (row) => {
          const product = productMap.get(row.product_id);

          if (!product) {
            return {
              id: row.id,
              productId: row.product_id,
              emoji: "/nothing-found.svg",
              label: "Unknown product",
              amount: `${row.amount}g`,
              grams: row.amount,
              meal: (row.meal as MealType) || "uncategorized",
              calories: 0,
            };
          }

          const slug = product.link.substring(product.link.lastIndexOf("/") + 1);
          const detail = await loadProductDetail(productLocale, slug);
          const servingInfo = parseServingInfo(detail?.macroTitle);

          // product.calories — energy per 100g (same baseline shown in
          // AddFoodSheet's product list), scaled to the grams actually eaten.
          const kcal = Math.round((product.calories * row.amount) / 100);

          return {
            id: row.id,
            productId: row.product_id,
            emoji: product.image,
            label: product.name,
            amount: formatAmountLabel(row.amount, servingInfo),
            grams: row.amount,
            meal: (row.meal as MealType) || "uncategorized",
            calories: kcal,
          };
        })
      );

      setEntryList(mapped);
    },
    [productMap, locale]
  );

  // ---- Загрузка "покрашенных" дат для текущей сетки календаря ----
  const loadDatesWithEntries = useCallback(async () => {
    if (weeks.length === 0) return;
    const from = format(weeks[0][0], "yyyy-MM-dd");
    const lastWeek = weeks[weeks.length - 1];
    const to = format(lastWeek[lastWeek.length - 1], "yyyy-MM-dd");

    const set = await getDatesWithEntriesInRange(from, to);
    setDatesWithEntries(set);
  }, [weeks]);

  useEffect(() => {
    loadEntriesForDate(selectedDate);
  }, [selectedDate, loadEntriesForDate]);

  useEffect(() => {
    loadDatesWithEntries();
  }, [loadDatesWithEntries]);

  const getDayTone = (date: Date): DayTone => {
    if (!isSameMonth(date, viewMonth)) return "muted";

    const key = format(date, "yyyy-MM-dd");
    if (key > todayStr) return "muted"; // будущее — не красим

    return datesWithEntries.has(key) ? "green" : "coral";
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (!isSameMonth(date, viewMonth)) {
      setViewMonth(startOfMonth(date));
    }
    setIsCalendarOpen(false);
  };

  const goPrevMonth = () => setViewMonth((m) => subMonths(m, 1));
  const goNextMonth = () => setViewMonth((m) => addMonths(m, 1));

  const removeEntry = async (id: number) => {
    if (!isToday(selectedDate)) return; // страховка: удаление доступно только для сегодняшнего дня

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    try {
      await deleteDiaryEntry(id, dateStr);
      await loadEntriesForDate(selectedDate);
      await loadDatesWithEntries();
    } catch (e) {
      console.error("Не удалось удалить запись:", e);
    }
  };

  const handleSelectProduct = (product: DiaryProduct) => {
    setSelectedProduct(product);
    setIsAddSheetOpen(false);
    setIsQuantitySheetOpen(true);
  };

  // Пользователь стоит на конкретной вкладке (Breakfast/Lunch/Dinner/Snacks)
  // — продукт уходит именно туда. На вкладке "All" категория определяется
  // временем добавления (см. resolveMealByTime); "snacks" по времени никогда
  // не выбирается — только явным выбором вкладки пользователем.
  const resolveMealForAdd = (): MealType =>
    selectedMeal === "all" ? resolveMealByTime(new Date()) : selectedMeal;

  const handleQuantityAdd = async (product: DiaryProduct, _amountLabel: string, grams: number) => {
    const dateStr = format(new Date(), "yyyy-MM-dd"); // всегда текущий день
    const meal = resolveMealForAdd();

    try {
      await addDiaryEntry(product.id, grams, dateStr, meal);

      // Перезагружаем список только если пользователь смотрит на сегодня —
      // иначе новая запись не должна визуально появиться на просматриваемой дате.
      if (isToday(selectedDate)) {
        await loadEntriesForDate(selectedDate);
      }
      await loadDatesWithEntries();
    } catch (e) {
      console.error("Не удалось добавить запись:", e);
    } finally {
      setIsQuantitySheetOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleQuantityClose = () => {
    setIsQuantitySheetOpen(false);
    setSelectedProduct(null);
  };

  // ---- Редактирование существующей записи ----
  const handleEntryClick = (entry: FoodEntry) => {
    if (!isToday(selectedDate)) return; // редактирование доступно только для сегодняшнего дня
    if (!productMap.has(entry.productId)) return; // неизвестный продукт нечем редактировать
    setEditingEntry(entry);
    setIsEditSheetOpen(true);
  };

  const handleEditClose = () => {
    setIsEditSheetOpen(false);
    setEditingEntry(null);
  };

  const handleEditSave = async (_product: DiaryProduct, _amountLabel: string, grams: number) => {
    if (!editingEntry) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      await updateDiaryEntry(editingEntry.id, grams, dateStr);
      await loadEntriesForDate(selectedDate);
      await loadDatesWithEntries();
    } catch (e) {
      console.error("Не удалось обновить запись:", e);
    } finally {
      setIsEditSheetOpen(false);
      setEditingEntry(null);
    }
  };

  // ---- Подтверждение удаления записи ----
  const handleTrashClick = (entry: FoodEntry) => {
    setDeletingEntry(entry);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingEntry(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;
    await removeEntry(deletingEntry.id);
    setIsDeleteConfirmOpen(false);
    setDeletingEntry(null);
  };

  // ---- Список записей, видимых под выбранной вкладкой (All/Breakfast/...) ----
  // "Daily value" ниже всегда считается по entryList целиком (весь день),
  // фильтр влияет только на то, что показано в списке intake-list.
  const visibleEntries = useMemo(
    () => (selectedMeal === "all" ? entryList : entryList.filter((e) => e.meal === selectedMeal)),
    [entryList, selectedMeal]
  );

  const mealLabel = (key: MealFilter) => tt(`meals.${key}`, MEAL_FALLBACK_LABELS[key]);

  const addButtonLabel =
    selectedMeal === "all"
      ? t("addFoodButton")
      : `${tt("addToMealPrefix", "Add to")} ${mealLabel(selectedMeal)}`;

  const entriesCountLabel = `${visibleEntries.length} ${
    visibleEntries.length === 1 ? tt("entrySingular", "entry") : tt("entriesPlural", "entries")
  }`;

  // ---- Разбивка нутриента по продуктам ----
  // Открывает сразу (с процентом, уже известным дашборду, чтобы кольцо не
  // "мигало" пустым), затем догружает точную разбивку по каждому продукту.
  const handleNutrientClick = async ({ section, key, label, percent }: NutrientClickInfo) => {
    const title = section === "vitamin" ? `${tt("vitaminSingular", "Vitamin")} ${label}` : label;

    setNutrientInfo({ section, ringLabel: label, title });
    setNutrientPercent(percent);
    setNutrientRows([]);
    setNutrientRecommendedLabel(null);
    setNutrientUlLabel(null);
    setNutrientUlPercent(null);
    setNutrientConsumedLabel(null);
    setNutrientUlSeverity("none");
    setNutrientUlNote(null);
    setTopProducts([]);
    setIsNutrientSheetOpen(true);
    setNutrientLoading(true);
    setTopProductsLoading(true);

    const slug = slugForNutrientKey(section, key);
    const loc = locale === "ru" ? "ru" : "en";

    try {
      // Кольцо в шите должно показывать ровно тот же %, что уже нарисован в
      // DailyValueModule (пришёл выше как `percent`, из dailyValueData) —
      // поэтому здесь его не трогаем. computeNutrientBreakdown считает
      // "overall" по своей собственной формуле (сумма мг / рекомендуемая
      // норма), которая может на доли процента разойтись с тем, что
      // усредняет buildSection в computeDailyValueData — а нам нужна
      // визуальная идентичность, а не отдельный источник правды. Из
      // разбивки используем список продуктов и персональную суточную норму
      // (recommendedLabel), которую дашборд не считает вообще.
      const { rows, recommendedLabel, ulLabel, ulPercent, consumedLabel, ulSeverity, ulNote } =
        await computeNutrientBreakdown(
          slug,
          entryList.map((e) => ({ productId: e.productId, grams: e.grams })),
          productMap,
          profile,
          loc
        );
      setNutrientRows(rows);
      setNutrientRecommendedLabel(recommendedLabel);
      setNutrientUlLabel(ulLabel);
      setNutrientUlPercent(ulPercent);
      setNutrientConsumedLabel(consumedLabel);
      setNutrientUlSeverity(ulSeverity);
      setNutrientUlNote(ulNote);
    } catch (e) {
      console.error("Не удалось посчитать разбивку нутриента:", e);
    } finally {
      setNutrientLoading(false);
    }

    // Отдельно от разбивки за сегодня — топ продуктов по всему каталогу,
    // не зависит от того, что уже съедено сегодня, поэтому грузится и
    // ошибается независимо (одно не должно блокировать другое).
    try {
      const catalog = Array.from(productMap.values());
      const top = await getTopProductsForNutrient(slug, catalog, loc, 10);
      setTopProducts(top);
    } catch (e) {
      console.error("Не удалось посчитать топ продуктов по нутриенту:", e);
    } finally {
      setTopProductsLoading(false);
    }
  };

  const handleNutrientClose = () => {
    setIsNutrientSheetOpen(false);
    setNutrientInfo(null);
    setNutrientRows([]);
    setNutrientRecommendedLabel(null);
    setNutrientUlLabel(null);
    setNutrientUlPercent(null);
    setNutrientConsumedLabel(null);
    setNutrientUlSeverity("none");
    setNutrientUlNote(null);
    setTopProducts([]);
  };

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["header"]}>
        <div className={styles["header-row"]}>
          <h1 className={styles["page-title"]}>{t("title")}</h1>
          <button
            type="button"
            className={styles["header-date-btn"]}
            aria-expanded={isCalendarOpen}
            onClick={() => setIsCalendarOpen((v) => !v)}
          >
            <span className={styles["header-date-text"]}>
              {format(selectedDate, "d, MMM yyyy", { locale: dateFnsLocale })}
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.8" />
              <path d="M8 3V6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 3V6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Collapsible calendar panel — opens when the date button is clicked, closes on Close/date pick */}
        {isCalendarOpen && (
          <div className={styles["calendar-overlay"]}>
            <div className={styles["calendar"]}>
              <div className={styles["calendar-header"]}>
                <span className={styles["calendar-month-label"]}>
                  {format(viewMonth, "LLLL yyyy", { locale: dateFnsLocale })}
                </span>
                <div className={styles["calendar-nav"]}>
                  <button type="button" aria-label="Previous month" className={styles["calendar-nav-btn"]} onClick={goPrevMonth}>
                    <Image src="/food-diary/chevron-left.svg" alt="" width={20} height={20} />
                  </button>
                  <button type="button" aria-label="Next month" className={styles["calendar-nav-btn"]} onClick={goNextMonth}>
                    <Image src="/food-diary/chevron-right.svg" alt="" width={20} height={20} />
                  </button>
                </div>
              </div>

              <div className={styles["calendar-weekdays"]}>
                {WEEKDAYS.map((wd) => (
                  <span key={wd} className={styles["calendar-weekday"]}>{t(`weekdays.${wd}`)}</span>
                ))}
              </div>

              <div className={styles["calendar-grid"]}>
                {weeks.map((week, i) => (
                  <div key={i} className={styles["calendar-row"]}>
                    {week.map((date) => {
                      const inMonth = isSameMonth(date, viewMonth);
                      const todayFlag = isToday(date);
                      const selected = isSameDay(date, selectedDate);
                      const tone = getDayTone(date);

                      return (
                        <button
                          type="button"
                          key={date.toISOString()}
                          onClick={() => handleSelectDate(date)}
                          disabled={!inMonth}
                          aria-current={selected ? "date" : undefined}
                          className={[
                            styles["calendar-day"],
                            !inMonth ? styles["calendar-day--outside"] : "",
                            todayFlag ? styles["calendar-day--today"] : "",
                            selected && !todayFlag ? styles["calendar-day--selected"] : "",
                            styles[`calendar-day--${tone}`],
                          ].join(" ")}
                        >
                          {format(date, "d")}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles["calendar-close-btn"]}
              onClick={() => setIsCalendarOpen(false)}
            >
              {tt("close", "Close")}
            </button>
          </div>
        )}
      </div>

      <div className={styles["content-container"]}>
        <div className={styles["content"]}>

          {/* Today's / selected day intake */}
          <div className={styles["intake-title"]}>
            <h2>{isToday(selectedDate) ? t("todaysIntake") : t("intake")}</h2>            
            <p className={styles["intake-count"]}>{entriesCountLabel}</p>
          </div>
          

          

          <div className={styles["intake-list"]}>
            {/* Meal tabs: All / Breakfast / Lunch / Dinner / Snacks */}
            <div className={styles["meal-tabs"]}>
              {MEAL_TABS.map(({ key, icon }) => (
                <button
                  type="button"
                  key={key}
                  className={[
                    styles["meal-tab"],
                    selectedMeal === key ? styles["meal-tab--selected"] : "",
                  ].join(" ")}
                  aria-pressed={selectedMeal === key}
                  onClick={() => setSelectedMeal(key)}
                >
                  <Image src={icon} alt="" width={50} height={50} className={styles["meal-tab-icon"]} />
                  <span className={styles["meal-tab-label"]}>{mealLabel(key)}</span>
                </button>
              ))}
            </div>
            {visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className={styles["intake-item"]}
                onClick={() => handleEntryClick(entry)}
                role={isToday(selectedDate) ? "button" : undefined}
                style={isToday(selectedDate) ? { cursor: "pointer" } : undefined}
              >
                <div className={styles["intake-item-left"]}>
                  <Image src={entry.emoji} alt="" width={32} height={32} />
                  <div className={styles["intake-label"]}>
                    <span className={styles["intake-name"]}>{entry.label}</span>{" "}
                    <span className={styles["intake-amount"]}>
                      {entry.amount}/{entry.calories}{tt("kcalUnit", "kcal")}
                    </span>
                  </div>
                </div>
                {isToday(selectedDate) && (
                  <button
                    type="button"
                    aria-label={`Remove ${entry.label}`}
                    className={styles["intake-remove-btn"]}
                    onClick={(e) => {
                      e.stopPropagation(); // не открывать окно редактирования при клике по корзине
                      handleTrashClick(entry);
                    }}
                  >
                    <Image src="/food-diary/trash.svg" alt="" width={22} height={22} />
                  </button>
                )}
              </div>
            ))}
            {visibleEntries.length === 0 && (
              <p className={styles["intake-empty"]}>{t("noEntries")}</p>
            )}
            
            {isToday(selectedDate) && (
              <button
                type="button"
                className={styles["add-button"]}
                onClick={() => setIsAddSheetOpen(true)}
              >
                {addButtonLabel}
              </button>
            )}

          </div>

          <DailyValueModule {...dailyValueData} onNutrientClick={handleNutrientClick} />
        </div>
      </div>

      <AddFoodSheet
        open={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      <QuantitySheet
        open={isQuantitySheetOpen}
        product={selectedProduct}
        onClose={handleQuantityClose}
        onAdd={handleQuantityAdd}
        userProfile={profile}
      />

      {/* Редактирование количества уже добавленной записи */}
      <QuantitySheet
        open={isEditSheetOpen}
        product={editingEntry ? productMap.get(editingEntry.productId) ?? null : null}
        mode="edit"
        initialGrams={editingEntry?.grams}
        onClose={handleEditClose}
        onAdd={handleEditSave}
        userProfile={profile}
      />

      {/* Подтверждение удаления записи */}
      <DeleteConfirmSheet
        open={isDeleteConfirmOpen}
        entry={
          deletingEntry
            ? {
                emoji: deletingEntry.emoji,
                label: deletingEntry.label,
                amount: deletingEntry.amount,
              }
            : null
        }
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />

      {/* Разбивка нутриента по продуктам (клик по кольцу/бару в DailyValueModule) */}
      <NutrientDetailSheet
        open={isNutrientSheetOpen}
        onClose={handleNutrientClose}
        info={nutrientInfo}
        percent={nutrientPercent}
        rows={nutrientRows}
        loading={nutrientLoading}
        recommendedLabel={nutrientRecommendedLabel}
        ulLabel={nutrientUlLabel}
        ulPercent={nutrientUlPercent}
        consumedLabel={nutrientConsumedLabel}
        ulSeverity={nutrientUlSeverity}
        ulNote={nutrientUlNote}
        topProducts={topProducts}
        topProductsLoading={topProductsLoading}
      />

      <div className={styles["navigation-container"]}>
        <div className={styles["navigation"]}>
          <Link className={styles["nav-link"]} href="/products" aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/products.svg" alt="products" width={48} height={48} />
            </div>
            {navBar("foods")}
          </Link>
          <Link  className={styles["nav-link"]} href="/vitamins">
            <div className={styles["nav-bar"]}>
                <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
            </div>
            {navBar("nutrients")}
          </Link>
          <Link className={`${styles["nav-link"]} ${styles["selected"]}`} href="/food-diary" aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/food-diary-green.svg" alt="food-diary" width={48} height={48} />
            </div>
            {navBar("foodDiary")}
          </Link>
          <Link  className={styles["nav-link"]} href="/favorites">
            <div className={styles["nav-bar"]}>
              <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
            </div>
            {navBar("favourites")}
          </Link>
          <Link  className={styles["nav-link"]} href="/settings">
            <div className={styles["nav-bar"]}>
              <Image src="/main/settings.svg" alt="heart" width={48} height={48} />
            </div>
            {navBar("settings")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryClient;