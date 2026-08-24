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
import DailyValueModule from "@/components/daily-value/dailyValueModule";
import AddFoodSheet, { DiaryProduct } from "@/components/food-diary/addFoodSheet";
import QuantitySheet from "@/components/food-diary/quantitySheet";
import { computeDailyValueData } from "@/lib/dailyValue";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

import {
  addDiaryEntry,
  deleteDiaryEntry,
  getDiaryEntriesByDate,
  getDatesWithEntriesInRange,
} from "@/lib/diary";
import { parseServingInfo, formatAmountLabel } from "@/lib/servingInfo";

import productsRu from "@/data/ru/products.json";
import productsEn from "@/data/en/products.json";
import productDetailsRu from "@/data/ru/productDetails.json";
import productDetailsEn from "@/data/en/productDetails.json";

// ---- Types ----
type DayTone = "green" | "coral" | "muted";

type FoodEntry = {
  id: number; // id строки в diary
  productId: number;
  emoji: string;
  label: string;
  amount: string;
  grams: number;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];


const FoodDiaryClient = () => {
  const locale = useLocale();

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => format(today, "yyyy-MM-dd"), [today]);

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(() => today);
  const [entryList, setEntryList] = useState<FoodEntry[]>([]);
  const [datesWithEntries, setDatesWithEntries] = useState<Set<string>>(new Set());

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isQuantitySheetOpen, setIsQuantitySheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DiaryProduct | null>(null);
const dateFnsLocale = useMemo(() => (locale === "ru" ? ru : enUS), [locale]);
  // ---- Локализованные данные продуктов ----
  const productMap = useMemo(() => {
    const list = (locale === "ru" ? productsRu : productsEn) as DiaryProduct[];
    const map = new Map<number, DiaryProduct>();
    list.forEach((p) => map.set(p.id, p));
    return map;
  }, [locale]);

  const productDetailsData = useMemo(() => {
    return locale === "ru" ? productDetailsRu : productDetailsEn;
  }, [locale]);

  const dailyValueData = useMemo(() => {
    return computeDailyValueData(
      entryList.map((e) => ({ productId: e.productId, grams: e.grams })),
      productMap,
      productDetailsData
    );
  }, [entryList, productMap, productDetailsData]);

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

      const mapped: FoodEntry[] = rows.map((row) => {
        const product = productMap.get(row.product_id);

        if (!product) {
          return {
            id: row.id,
            productId: row.product_id,
            emoji: "/nothing-found.svg",
            label: "Unknown product",
            amount: `${row.amount}g`,
            grams: row.amount,
          };
        }

        const slug = product.link.substring(product.link.lastIndexOf("/") + 1);
        const detail = (productDetailsData as any)[slug];
        const servingInfo = parseServingInfo(detail?.macroTitle);

        return {
          id: row.id,
          productId: row.product_id,
          emoji: product.image,
          label: product.name,
          amount: formatAmountLabel(row.amount, servingInfo),
          grams: row.amount,
        };
      });

      setEntryList(mapped);
    },
    [productMap, productDetailsData]
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
  };

  const goPrevMonth = () => setViewMonth((m) => subMonths(m, 1));
  const goNextMonth = () => setViewMonth((m) => addMonths(m, 1));

  const removeEntry = async (id: number) => {
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

  const handleQuantityAdd = async (product: DiaryProduct, _amountLabel: string, grams: number) => {
    const dateStr = format(new Date(), "yyyy-MM-dd"); // всегда текущий день

    try {
      await addDiaryEntry(product.id, grams, dateStr);

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

  const t = useTranslations("FoodDiary");
  return (
    <div className={styles["main-layout"]}>
      <h1 className={styles["page-title"]}>{t("title")}</h1>
      <div className={styles["content"]}>

        {/* Calendar */}
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

        {/* Today's / selected day intake */}
        <h2 className={styles["intake-title"]}>
          {isToday(selectedDate) ? t("todaysIntake") : `${t("intake")} — ${format(selectedDate, "d MMM")}`}
        </h2>

        <div className={styles["intake-list"]}>
          {entryList.map((entry) => (
            <div key={entry.id} className={styles["intake-item"]}>
              <div className={styles["intake-item-left"]}>
                <Image src={entry.emoji} alt="" width={32} height={32} />
                <span className={styles["intake-label"]}>
                  {entry.label} - {entry.amount}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${entry.label}`}
                className={styles["intake-remove-btn"]}
                onClick={() => removeEntry(entry.id)}
              >
                <Image src="/food-diary/trash.svg" alt="" width={22} height={22} />
              </button>
            </div>
          ))}
          {entryList.length === 0 && (
            <p className={styles["intake-empty"]}>{t("noEntries")}</p>
          )}
        </div>

        {isToday(selectedDate) && (
          <button
            type="button"
            className={styles["add-button"]}
            onClick={() => setIsAddSheetOpen(true)}
          >
            {t("addFoodButton")}
          </button>
        )}

        {dailyValueData && <DailyValueModule {...dailyValueData} />}
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
      />

      {/* 🔽 Навигация */}
      <div className={styles["navigation"]}>
        <Link prefetch={false} className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/products" aria-current="page" prefetch={false}>
          <Image src="/main/products.svg" alt="products" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/food-diary" aria-current="page" prefetch={false}>
          <Image src="/main/food-diary-green.svg" alt="food-diary" width={48} height={48} />
        </Link>
        <Link prefetch={false} className={styles["nav-link"]} href="/vitamins">
          <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
        </Link>
        <Link prefetch={false} className={styles["nav-link"]} href="/favorites">
          <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
        </Link>
      </div>
    </div>
  );
};

export default FoodDiaryClient;