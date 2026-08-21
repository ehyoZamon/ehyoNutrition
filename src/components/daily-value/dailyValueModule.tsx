"use client";

import React from "react";
import styles from "./dailyValue.module.css";

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

export type DailyValueModuleProps = {
  vitaminsOverallPercent?: number;
  vitaminPercents?: PercentMap; // keyed by VITAMIN_PRIMARY/SECONDARY .key
  caloriesPercent?: number;
  macrosOverallPercent?: number;
  macroPercents?: PercentMap; // keyed by MACRO_ITEMS .key
  mineralsOverallPercent?: number;
  mineralPercents?: PercentMap; // keyed by MINERAL_ITEMS .key
};

/* ============================================================
   Color logic
   ============================================================ */

function ringColor(percent: number): string {
  if (percent >= 70) return "var(--dv-green)";
  if (percent >= 50) return "var(--dv-orange)";
  return "var(--dv-coral)";
}

/* ============================================================
   Primitives
   ============================================================ */

function CircleRing({percent,label,size,}: {percent: number; label: string; size: number | "sm" | "lg" | "glg";}) {
  const dimension = typeof size === "number" ? size : size === "lg" ? 56 : 46;
  const stroke = typeof size === "number" ? size * 0.09 : size === "lg" ? 5 : 4;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);
  const color = ringColor(clamped);

  return (
    <div className={styles["ring"]}>
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
          y={size === "lg" ? "68%" : "70%"}
          textAnchor="middle"
          dominantBaseline="middle"
          className={size === "lg" ? styles["ring-percent-lg"] : styles["ring-percent-sm"]}
        >
          {Math.round(clamped)}%
        </text>
      </svg>
    </div>
  );
}

function LinearBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={styles["linear-track"]}>
      <div
        className={styles["linear-fill"]}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

function VerticalBar({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const maxHeight = 130; // px, matches the track height in CSS
  const fillHeight = clamped === 0 ? 0 : Math.max(6, (clamped / 100) * maxHeight);

  return (
    <div className={styles["vbar"]}>
      <span className={styles["vbar-label"]}>{label}</span>
      <div className={styles["vbar-track"]} style={{ height: maxHeight }}>
        <div className={styles["vbar-fill"]} style={{ height: fillHeight }} />
      </div>
    </div>
  );
}

function SectionHeader({ title, percent }: { title: string; percent: number }) {
  return (
    <div className={styles["section-header"]}>
      <h2 className={styles["section-title"]}>{title}</h2>
      <span className={styles["section-percent"]}>{Math.round(percent)}%</span>
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
}: DailyValueModuleProps) {
  return (
    <div className={styles["dashboard"]}>
      <h1 className={styles["dashboard-title"]}>Daily value</h1>

      {/* Vitamins */}
      <section className={styles["section"]}>
        <SectionHeader title="Vitamins" percent={vitaminsOverallPercent} />
        <LinearBar percent={vitaminsOverallPercent} color="var(--dv-orange)" />

        <div className={styles["ring-row-lg"]}>
          {VITAMIN_PRIMARY.map((v) => (
            <CircleRing
              key={v.key}
              label={v.label}
              percent={vitaminPercents[v.key] ?? 0}
              size="lg"
            />
          ))}
        </div>

        <div className={styles["ring-row-sm"]}>
          {VITAMIN_SECONDARY.map((v) => (
            <CircleRing
              key={v.key}
              label={v.label}
              percent={vitaminPercents[v.key] ?? 0}
              size="sm"
            />
          ))}
        </div>
      </section>

      {/* Calories */}
      <section className={styles["section"]}>
        <SectionHeader title="Calories" percent={caloriesPercent} />
        <LinearBar percent={caloriesPercent} color="var(--dv-green)" />
      </section>

      {/* Macronutrients */}
      <section className={`${styles["section"]} ${styles["macronutrients-section"]}`}>
        <SectionHeader title="Macronutrients" percent={macrosOverallPercent} />
        <LinearBar percent={macrosOverallPercent} color="var(--dv-coral)" />

        <div className={styles["ring-row-lg"]}>
          {MACRO_ITEMS.map((m) => (
            <CircleRing
              key={m.key}
              label={m.label}
              percent={macroPercents[m.key] ?? 0}
              size={64}
            />
          ))}
        </div>
      </section>

      {/* Minerals */}
      <section className={styles["section"]}>
        <SectionHeader title="Minerals" percent={mineralsOverallPercent} />
        <LinearBar percent={mineralsOverallPercent} color="var(--dv-coral)" />

        <div className={styles["vbar-row"]}>
          {MINERAL_ITEMS.map((m) => (
            <VerticalBar key={m.key} label={m.label} percent={mineralPercents[m.key] ?? 0} />
          ))}
        </div>
      </section>
    </div>
  );
}
