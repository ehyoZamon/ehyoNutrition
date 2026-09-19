"use client";

import React, { useEffect, useState } from "react";
import styles from "./dailyValue.module.css";
import {useTranslations} from "next-intl";

/* ============================================================
   Fixed structure — which nutrients exist never changes,
   only their percentages do. This lives in the module so the
   page never has to repeat labels/keys, only supply numbers.
   ============================================================ */

export const VITAMIN_PRIMARY = [
  { key: "a", label: "A" },
  { key: "c", label: "C" },
  { key: "d", label: "D" },
  { key: "k", label: "K" },
  { key: "e", label: "E" },
] as const;

export const VITAMIN_SECONDARY = [
  { key: "b1", label: "B1" },
  { key: "b2", label: "B2" },
  { key: "b3", label: "B3" },
  { key: "b5", label: "B5" },
  { key: "b6", label: "B6" },
  { key: "b7", label: "B7" },
  { key: "b9", label: "B9" },
  { key: "b12", label: "B12" },
] as const;

export const MACRO_ITEMS = [
  { key: "fat", label: "Fat" },
  { key: "fiber", label: "Fiber" },
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbs" },
] as const;

export const MINERAL_ITEMS = [
  { key: "sodium", label: "Sodium" },
  { key: "potassium", label: "Potassium" },
  { key: "calcium", label: "Calcium" },
  { key: "iron", label: "Iron" },
  { key: "magnesium", label: "Magnesium" },
  { key: "phosphorus", label: "Phosphorus" },
  { key: "zinc", label: "Zinc" },
  { key: "copper", label: "Copper" },
  { key: "chloride", label: "Chloride" },
  { key: "manganese", label: "Manganese" },
  { key: "selenium", label: "Selenium" },
] as const;

/* ============================================================
   Types — this is the contract between the page and the module.
   Every *Percents map is optional; missing keys render as 0%.
   ============================================================ */

export type PercentMap = Record<string, number>;

// Emitted when the user taps a ring (vitamin/macro) or bar (mineral).
// `key` is the module's own short key (e.g. "a", "carbs", "sodium");
// pair it with `section` and lib/dailyValue.ts's slugForNutrientKey() to
// resolve the canonical nutrient slug for a breakdown lookup. `label` is
// already-localized display text (the letter/word rendered inside the
// ring/next to the bar), so callers can build a sheet title without a
// second translation lookup. `percent` is the value already on screen,
// handy for an instant first paint before a fresh breakdown loads.
export type NutrientClickInfo = {
  section: "vitamin" | "macro" | "mineral";
  key: string;
  label: string;
  percent: number;
};

export type DailyValueModuleProps = {
  vitaminsOverallPercent?: number;
  vitaminPercents?: PercentMap; // keyed by VITAMIN_PRIMARY/SECONDARY .key
  caloriesPercent?: number;
  macrosOverallPercent?: number;
  macroPercents?: PercentMap; // keyed by MACRO_ITEMS .key
  mineralsOverallPercent?: number;
  mineralPercents?: PercentMap; // keyed by MINERAL_ITEMS .key
  onNutrientClick?: (info: NutrientClickInfo) => void;
};

/* ============================================================
   Color logic — a continuous red -> orange -> green gradient
   driven by the actual percent, instead of 3 hard thresholds.
   0% = --dv-coral, 50% = --dv-orange, 100%+ = --dv-green, with
   everything in between linearly blended. Reads the real colors
   from CSS custom properties (so it always matches the design
   system / theme) with hardcoded fallbacks for SSR, where
   getComputedStyle isn't available.
   ============================================================ */

type RGB = [number, number, number];

const FALLBACK_STOPS: { coral: RGB; orange: RGB; green: RGB } = {
  coral: [255, 107, 107],
  orange: [255, 169, 77],
  green: [81, 207, 102],
};

function parseColorToRgb(raw: string): RGB | null {
  const value = raw.trim();
  if (!value) return null;

  const hexMatch = value.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }

  return null;
}

function mixRgb(a: RGB, b: RGB, t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * Reads --dv-coral / --dv-orange / --dv-green from the document once on
 * mount (client-only), falling back to fixed hex values until then / on the
 * server, so this never breaks SSR. Exported so other components (e.g. the
 * nutrient-detail sheet) can render a ring with the exact same gradient
 * without duplicating this logic.
 */
export function useGradientStops() {
  const [stops, setStops] = useState(FALLBACK_STOPS);

  useEffect(() => {
    const computed = getComputedStyle(document.documentElement);
    const coral = parseColorToRgb(computed.getPropertyValue("--dv-coral")) ?? FALLBACK_STOPS.coral;
    const orange = parseColorToRgb(computed.getPropertyValue("--dv-orange")) ?? FALLBACK_STOPS.orange;
    const green = parseColorToRgb(computed.getPropertyValue("--dv-green")) ?? FALLBACK_STOPS.green;
    setStops({ coral, orange, green });
  }, []);

  return stops;
}

function gradientColor(percent: number, stops: typeof FALLBACK_STOPS): string {
  const clamped = Math.min(100, Math.max(0, percent));
  if (clamped <= 50) {
    return mixRgb(stops.coral, stops.orange, clamped / 50);
  }
  return mixRgb(stops.orange, stops.green, (clamped - 50) / 50);
}

/* ============================================================
   Primitives
   ============================================================ */

// Exported so the nutrient-detail sheet (opened when one of these is
// clicked) can render the same ring, at a larger size, as its header —
// instead of re-implementing the SVG.
export function CircleRing({
  percent,
  label,
  size,
  stops,
  onClick,
}: {
  percent: number;
  label: string;
  size: number | "sm" | "lg" | "glg" | "glge";
  stops: typeof FALLBACK_STOPS;
  onClick?: () => void;
}) {
  const dimension = typeof size === "number" ? size : size === "lg" ? 56 : 46;
  const stroke = typeof size === "number" ? size * 0.09 : size === "lg" ? 5 : 4;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const sizeKey=size;
  // The arc itself can never physically exceed a full circle, so it's
  // clamped — but the label text shows the real percent (e.g. "281%" for
  // vitamin A in liver) so nothing gets hidden, only the drawing.
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);
  const color = gradientColor(percent, stops);
  // Soft ceiling purely so an extreme outlier (a mega-dose supplement, say)
  // can't blow out the ring's layout with a 5-digit number.
  const displayPercent = Math.min(999, Math.max(0, Math.round(percent)));

  
  return (
    <div
      className={styles["ring"]}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="var(--dv-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
        />
        <text
          x="50%"
          y={size === "lg" ? "46%" : "48%"}
          textAnchor="middle"
          dominantBaseline="middle"
          className={size === "lg" ? styles["ring-label-lg"] : styles["ring-label-sm"]}
        >
          {label}
        </text>
        <text
          x="50%"
          y={sizeKey === "glge" ? "55%" : size === "lg" ? "68%" : "70%"}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles[`ring-percent-${sizeKey}`] ?? styles["ring-percent-sm"]}
        >
          {displayPercent}%
        </text>
      </svg>
    </div>
  );
}

function LinearBar({ percent, stops }: { percent: number; stops: typeof FALLBACK_STOPS }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color = gradientColor(percent, stops);
  return (
    <div className={styles["linear-track"]}>
      <div
        className={styles["linear-fill"]}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

function VerticalBar({
  percent,
  label,
  stops,
  onClick,
}: {
  percent: number;
  label: string;
  stops: typeof FALLBACK_STOPS;
  onClick?: () => void;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const maxHeight = 130; // px, matches the track height in CSS
  const fillHeight = clamped === 0 ? 0 : Math.max(6, (clamped / 100) * maxHeight);
  const color = gradientColor(percent, stops);

  return (
    <div
      className={styles["vbar"]}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <span className={styles["vbar-label"]}>{label}</span>
      <div className={styles["vbar-track"]} style={{ height: maxHeight }}>
        <div className={styles["vbar-fill"]} style={{ height: fillHeight, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SectionHeader({ title, percent }: { title: string; percent: number }) {
  // Overall section percent is already capped per-nutrient before averaging
  // (see computeDailyValueData), so this should never exceed 100 — clamped
  // here too purely as a display safety net.
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={styles["section-header"]}>
      <h2 className={styles["section-title"]}>{title}</h2>
      <span className={styles["section-percent"]}>{Math.round(clamped)}%</span>
    </div>
  );
}

/* ============================================================
   Module — no data of its own. Every number defaults to 0,
   so with no props at all the whole dashboard renders "empty"
   (all rings/bars at 0%) while keeping the exact layout.
   ============================================================ */

export default function DailyValueModule({
  vitaminsOverallPercent = 0,
  vitaminPercents = {},
  caloriesPercent = 0,
  macrosOverallPercent = 0,
  macroPercents = {},
  mineralsOverallPercent = 0,
  mineralPercents = {},
  onNutrientClick,
}: DailyValueModuleProps) {
  const t = useTranslations("FoodDiary");
  const stops = useGradientStops();
  return (
    <div className={styles["dashboard"]}>
      <h1 className={styles["dashboard-title"]}>{t("dailyValue")}</h1>

      {/* Vitamins */}
      <section className={styles["section"]}>
        <SectionHeader title={t("vitaminsSection")} percent={vitaminsOverallPercent} />
        <LinearBar percent={vitaminsOverallPercent} stops={stops} />

        <div className={styles["ring-row-lg"]}>
          {VITAMIN_PRIMARY.map((v) => {
            const percent = vitaminPercents[v.key] ?? 0;
            return (
              <CircleRing
                key={v.key}
                label={v.label}
                percent={percent}
                size="lg"
                stops={stops}
                onClick={
                  onNutrientClick
                    ? () => onNutrientClick({ section: "vitamin", key: v.key, label: v.label, percent })
                    : undefined
                }
              />
            );
          })}
        </div>

        <div className={styles["ring-row-sm"]}>
          {VITAMIN_SECONDARY.map((v) => {
            const percent = vitaminPercents[v.key] ?? 0;
            return (
              <CircleRing
                key={v.key}
                label={v.label}
                percent={percent}
                size="sm"
                stops={stops}
                onClick={
                  onNutrientClick
                    ? () => onNutrientClick({ section: "vitamin", key: v.key, label: v.label, percent })
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>

      {/* Calories */}
      <section className={styles["section"]}>
        <SectionHeader title={t("calories")} percent={caloriesPercent} />
        <LinearBar percent={caloriesPercent} stops={stops} />
      </section>

      {/* Macronutrients */}
      <section className={`${styles["section"]} ${styles["macronutrients-section"]}`}>
        <SectionHeader title={t("macronutrientsSection")} percent={macrosOverallPercent} />
        <LinearBar percent={macrosOverallPercent} stops={stops} />

        <div className={styles["ring-row-lg"]}>
          {MACRO_ITEMS.map((m) => {
            const percent = macroPercents[m.key] ?? 0;
            const label = t(m.key);
            return (
              <CircleRing
                key={m.key}
                label={label}
                percent={percent}
                size={64}
                stops={stops}
                onClick={
                  onNutrientClick
                    ? () => onNutrientClick({ section: "macro", key: m.key, label, percent })
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>

      {/* Minerals */}
      <section className={styles["section"]}>
        <SectionHeader title={t("mineralsSection")} percent={mineralsOverallPercent} />
        <LinearBar percent={mineralsOverallPercent} stops={stops} />

        <div className={styles["vbar-row"]}>
          {MINERAL_ITEMS.map((m) => {
            const percent = mineralPercents[m.key] ?? 0;
            const label = t(m.key);
            return (
              <VerticalBar
                key={m.key}
                label={label}
                percent={percent}
                stops={stops}
                onClick={
                  onNutrientClick
                    ? () => onNutrientClick({ section: "mineral", key: m.key, label, percent })
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
