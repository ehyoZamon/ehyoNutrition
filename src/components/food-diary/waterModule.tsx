"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import styles from "./waterModule.module.css";
import { WATER_GLASS_ML } from "@/lib/water";

type WaterModuleProps = {
  amountMl: number;
  goalMl: number;
  // Изменять воду можно только за сегодня (как и записи в дневнике)
  editable: boolean;
  // Изменение объёма в мл (положительное — добавить, отрицательное — убрать)
  onChange: (deltaMl: number) => void;
};

const GLASS_BODY = "M4 8 L32 8 L29.5 54 Q29.4 55 28.4 55 L7.6 55 Q6.6 55 6.5 54 Z";

// Размеры совпадают с .glass и .glasses в waterModule.module.css —
// по ним считается, сколько стаканов помещается в один ряд.
const GLASS_WIDTH = 34;
const GLASS_GAP_X = 6;

// Кнопки быстрого добавления, мл
const QUICK_AMOUNTS_ML = [50, 100, 150];
const CUSTOM_MAX_ML = 2000;

const RING_SIZE = 84;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const Glass = ({
  index,
  fill,
  symbol,
  label,
  onClick,
}: {
  index: number;
  // 0..1 — насколько заполнен стакан
  fill: number;
  symbol: "plus" | "minus" | null;
  label: string;
  onClick: () => void;
}) => {
  const clipId = `water-glass-clip-${index}`;
  // Вода занимает область от y=12 (полный) до y=58 (пустой)
  const waterTop = 58 - 46 * fill;
  // Белый "−" виден только на достаточно высоком слое воды
  const minusColor = fill > 0.7 ? "#fff" : "#7f7f7f";

  return (
    <button
      type="button"
      className={styles["glass"]}
      disabled={!symbol}
      aria-label={symbol ? label : undefined}
      aria-hidden={symbol ? undefined : true}
      tabIndex={symbol ? 0 : -1}
      onClick={onClick}
    >
      <svg viewBox="0 0 36 58" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}>
            <path d={GLASS_BODY} />
          </clipPath>
        </defs>
        <path d={GLASS_BODY} fill="#eaf7fd" />
        {fill > 0 && (
          <rect
            x="0"
            y={waterTop}
            width="36"
            height={58 - waterTop}
            fill="#8bd3fb"
            clipPath={`url(#${clipId})`}
          />
        )}
        <path d={GLASS_BODY} fill="none" stroke="#9a9a9a" strokeWidth="1.8" strokeLinejoin="round" />
        <rect x="3" y="3" width="30" height="5" rx="1.2" fill="#fff" stroke="#9a9a9a" strokeWidth="1.6" />
        {symbol === "plus" && (
          <path d="M18 26v10M13 31h10" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" />
        )}
        {symbol === "minus" && (
          <path d="M13 31h10" stroke={minusColor} strokeWidth="2.4" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
};

const WaterModule = ({ amountMl, goalMl, editable, onChange }: WaterModuleProps) => {
  const locale = useLocale();
  const t = useTranslations("FoodDiary");

  const tt = (key: string, fallback: string) => {
    try {
      const value = t(key);
      return value === key || value.endsWith(`.${key}`) ? fallback : value;
    } catch {
      return fallback;
    }
  };

  const [customValue, setCustomValue] = useState("");
  const customMl = Number(customValue);
  const customValid = customMl > 0 && customMl <= CUSTOM_MAX_ML;

  const submitCustom = () => {
    if (!customValid) return;
    onChange(customMl);
    setCustomValue("");
  };

  // Сколько стаканов помещается в один ряд при текущей ширине карточки
  const glassesRef = useRef<HTMLDivElement>(null);
  const [rowCapacity, setRowCapacity] = useState(8);
  useEffect(() => {
    const el = glassesRef.current;
    if (!el) return;
    const update = () =>
      setRowCapacity(
        Math.max(1, Math.floor((el.clientWidth + GLASS_GAP_X) / (GLASS_WIDTH + GLASS_GAP_X)))
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Ряды всегда полные и одинаковые: в каждом columnCount стаканов. Виден
  // один ряд; когда все его стаканы полные — появляется следующий такой же,
  // и так пока не наберётся столько рядов, сколько нужно для нормы.
  const glassCount = Math.max(1, Math.ceil(goalMl / WATER_GLASS_ML));
  const columnCount = Math.min(rowCapacity, glassCount);
  const rowsNeeded = Math.ceil(glassCount / columnCount);
  const fullCount = Math.floor(amountMl / WATER_GLASS_ML); // полные стаканы
  const rowsShown = Math.min(rowsNeeded, Math.floor(fullCount / columnCount) + 1);
  const visibleCount = rowsShown * columnCount;

  // Стаканы, в которых есть хоть сколько-то воды (последний может быть неполным)
  const touchedCount = Math.min(Math.ceil(amountMl / WATER_GLASS_ML), visibleCount);
  // Сколько мл лежит в последнем неполном стакане (0 — если он полный)
  const partialMl = amountMl % WATER_GLASS_ML;

  const progress = goalMl > 0 ? Math.min(1, amountMl / goalMl) : 0;

  const goalLiters = (goalMl / 1000).toLocaleString(locale, { maximumFractionDigits: 2 });
  const mlUnit = tt("waterMl", "ml");
  const summary = `${amountMl} ${mlUnit} / ${goalLiters} ${tt("waterL", "L")}`;

  return (
    <div className={styles["water"]}>
      <h2 className={styles["water-title"]}>{tt("waterTitle", "Water Consumption")}</h2>

      <div className={styles["water-card"]}>
        <div
          ref={glassesRef}
          className={styles["glasses"]}
          style={{ gridTemplateColumns: `repeat(${columnCount}, ${GLASS_WIDTH}px)` }}
        >
          {Array.from({ length: visibleCount }, (_, i) => {
            // Заполненность стакана: вода "переливается" из одного в следующий
            const fill = Math.min(1, Math.max(0, (amountMl - i * WATER_GLASS_ML) / WATER_GLASS_ML));

            // "−" — на последнем стакане с водой, "+" — на следующем за ним
            let symbol: "plus" | "minus" | null = null;
            if (editable) {
              if (i === touchedCount - 1) symbol = "minus";
              else if (i === touchedCount) symbol = "plus";
            }

            return (
              <Glass
                key={i}
                index={i}
                fill={fill}
                symbol={symbol}
                label={
                  symbol === "minus"
                    ? tt("waterRemoveGlass", "Remove water")
                    : tt("waterAddGlass", "Add a glass of water")
                }
                // "−" убирает содержимое последнего стакана (неполного — целиком
                // то, что в нём налито; полного — 250 мл), "+" добавляет стакан
                onClick={() =>
                  symbol === "minus"
                    ? onChange(-(partialMl || WATER_GLASS_ML))
                    : onChange(WATER_GLASS_ML)
                }
              />
            );
          })}
        </div>

        <div className={styles["ring"]}>
          <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="#d2ecf8"
              strokeWidth={RING_STROKE}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="#8bd3fb"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${RING_LENGTH * progress} ${RING_LENGTH}`}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              style={{ transition: "stroke-dasharray 0.25s ease" }}
            />
            <g transform="translate(26.4 26.4) scale(1.3)">
              <path
                d="M12 2.5C12 2.5 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5Z"
                fill="#8bd3fb"
              />
              <path
                d="M8.6 15a3.6 3.6 0 0 0 2.6 3"
                fill="none"
                stroke="#fff"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>
          </svg>
          <span className={styles["ring-label"]}>{summary}</span>
        </div>
      </div>

      {/* Свой объём: быстрые кнопки + произвольное значение в мл */}
      {editable && (
        <div className={styles["quick-row"]}>
          {QUICK_AMOUNTS_ML.map((ml) => (
            <button
              key={ml}
              type="button"
              className={styles["chip"]}
              onClick={() => onChange(ml)}
            >
              +{ml} {mlUnit}
            </button>
          ))}

          <div className={styles["custom"]}>
            <input
              type="text"
              inputMode="numeric"
              className={styles["custom-input"]}
              placeholder={mlUnit}
              aria-label={tt("waterCustomLabel", "Custom amount, ml")}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitCustom();
              }}
            />
            <button
              type="button"
              className={styles["custom-add"]}
              disabled={!customValid}
              aria-label={tt("waterAddCustom", "Add")}
              onClick={submitCustom}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterModule;