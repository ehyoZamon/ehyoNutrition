"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
import styles from "./foodDiary.module.css";
import DailyValueModule from "@/components/daily-value/dailyValueModule";


// ---- Types ----
type DayTone = "green" | "coral" | "muted";

type FoodEntry = {
  id: string;
  emoji: string;
  label: string;
  amount: string;
};

// ---- Demo data: entries keyed by yyyy-MM-dd ----
const DEMO_ENTRIES: Record<string, FoodEntry[]> = {
  "2026-08-20": [
    { id: "1", emoji: "/products/apple.png", label: "Apples", amount: "100g" },
    { id: "2", emoji: "/products/egg.png", label: "Eggs", amount: "2 pieces (100 g)" },
    { id: "3", emoji: "/products/broccoli.png", label: "Boy chock", amount: "150 g" },
    { id: "4", emoji: "/products/arugula.png", label: "Arugula", amount: "75 g" },
  ],
};

// ---- Demo tone data: which days are "complete" (green) vs "missed" (coral) ----
// В реальном проекте это будет приходить с бэкенда (наличие записей за день,
// выполнение нормы и т.п.) — просто подмени этот объект своей выборкой.
const DEMO_TONES: Record<string, DayTone> = {
  "2026-08-01": "coral",
  "2026-08-02": "green",
  "2026-08-03": "green",
  "2026-08-04": "green",
  "2026-08-05": "green",
  "2026-08-06": "green",
  "2026-08-07": "coral",
  "2026-08-08": "green",
  "2026-08-09": "green",
  "2026-08-10": "coral",
  "2026-08-11": "green",
  "2026-08-12": "green",
  "2026-08-13": "green",
  "2026-08-14": "green",
  "2026-08-15": "coral",
  "2026-08-16": "green",
  "2026-08-17": "green",
  "2026-08-18": "green",
  "2026-08-19": "green",
};

function getDayTone(date: Date, viewMonth: Date): DayTone {
  if (!isSameMonth(date, viewMonth)) return "muted";
  const key = format(date, "yyyy-MM-dd");
  return DEMO_TONES[key] ?? "muted";
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];


async function getDailyValueData() {
  // return await fetch(`${API_URL}/daily-value?date=...`).then(r => r.json());
  return {
    vitaminsOverallPercent: 50,
    vitaminPercents: {
      a: 78.6,
      c: 50,
      d: 25,
      k: 30,
      e: 82.2,
      b1: 62,
      b2: 20,
      b3: 77,
      b5: 54,
      b6: 70,
      b7: 40,
      b9: 20,
      b12: 20,
    },
    caloriesPercent: 75,
    macrosOverallPercent: 25,
    macroPercents: { fat: 25, fiber: 25, protein: 25, carbs: 25 },
    mineralsOverallPercent: 25,
    mineralPercents: {
      sodium: 12,
      potassium: 10,
      calcium: 14,
      iron: 9,
      magnesium: 11,
      phosphorus: 13,
      zinc: 10,
      copper: 12,
    },
  };
}


const foodDiaryClient = () => {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date(2026, 7, 20)));
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 7, 20));
  const [dailyValueData, setDailyValueData] = useState<Awaited<ReturnType<typeof getDailyValueData>> | null>(null);
  
  useEffect(() => {
    getDailyValueData().then(setDailyValueData);
  }, []);

  // Строим сетку недель для текущего месяца: Пн-старт, полные недели
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

  const entries = DEMO_ENTRIES[format(selectedDate, "yyyy-MM-dd")] ?? [];
  const [entryList, setEntryList] = useState(entries);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setEntryList(DEMO_ENTRIES[format(date, "yyyy-MM-dd")] ?? []);
    if (!isSameMonth(date, viewMonth)) {
      setViewMonth(startOfMonth(date));
    }
  };

  const goPrevMonth = () => setViewMonth((m) => subMonths(m, 1));
  const goNextMonth = () => setViewMonth((m) => addMonths(m, 1));

  const removeEntry = (id: string) => {
    setEntryList((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["content"]}>
        <h1 className={styles["page-title"]}>Food Diary</h1>

        {/* Calendar */}
        <div className={styles["calendar"]}>
          <div className={styles["calendar-header"]}>
            <span className={styles["calendar-month-label"]}>
              {format(viewMonth, "LLLL yyyy")}
            </span>
            <div className={styles["calendar-nav"]}>
              <button
                type="button"
                aria-label="Previous month"
                className={styles["calendar-nav-btn"]}
                onClick={goPrevMonth}
              >
                <Image src="/food-diary/chevron-left.svg" alt="" width={20} height={20} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                className={styles["calendar-nav-btn"]}
                onClick={goNextMonth}
              >
                <Image src="/food-diary/chevron-right.svg" alt="" width={20} height={20} />
              </button>
            </div>
          </div>

          <div className={styles["calendar-weekdays"]}>
            {WEEKDAYS.map((wd) => (
              <span key={wd} className={styles["calendar-weekday"]}>
                {wd}
              </span>
            ))}
          </div>

          <div className={styles["calendar-grid"]}>
            {weeks.map((week, i) => (
              <div key={i} className={styles["calendar-row"]}>
                {week.map((date) => {
                  const inMonth = isSameMonth(date, viewMonth);
                  const today = isToday(date);
                  const selected = isSameDay(date, selectedDate);
                  const tone = getDayTone(date, viewMonth);

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
                        today ? styles["calendar-day--today"] : "",
                        selected && !today ? styles["calendar-day--selected"] : "",
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
          {isToday(selectedDate) ? "Today\u2019s Intake" : `Intake — ${format(selectedDate, "d MMM")}`}
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
            <p className={styles["intake-empty"]}>No entries for this day.</p>
          )}
        </div>

        <button type="button" className={styles["add-button"]}>
          Add to Daily Intake
        </button>

        {dailyValueData && <DailyValueModule {...dailyValueData} />}
      </div>

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

export default foodDiaryClient;
