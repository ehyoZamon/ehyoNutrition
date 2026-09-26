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

// Keyed the same way as PercentMap (VITAMIN_PRIMARY/SECONDARY, MACRO_ITEMS,
// MINERAL_ITEMS .key) — true when today's consumed amount for that nutrient
// is above its upper limit (UL), so the ring/bar can flag an overdose
// instead of just showing "100%+" in green like a healthy excess.
export type OverLimitMap = Record<string, boolean>;

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
  vitaminOverLimit?: OverLimitMap; // keyed the same way — true = above UL today, real risk
  // Same keying as vitaminOverLimit, but for nutrients whose UL applies to
  // synthetic/supplemental intake specifically (see vitaminDRI.json's per-entry ulMode) — e.g.
  // folate/B9, niacin/B3. True here means "above UL today, but from
  // whole-food sources only, which isn't the risk the limit describes" —
  // rendered as a softer info badge instead of the danger one.
  vitaminOverLimitInfo?: OverLimitMap;
  // Additional %DV (delta, not absolute) each vitamin would reach if
  // today's *planned* (not-yet-eaten) meals were also consumed — keyed the
  // same way as vitaminPercents. Rendered as a translucent extension of the
  // ring's arc plus a small "+xy%" badge. 0/missing keys draw nothing extra.
  plannedVitaminPercents?: PercentMap;
  // Same delta, averaged across the section — extends the Vitamins linear
  // bar the same way the rings extend.
  vitaminsOverallPlannedPercent?: number;
  caloriesPercent?: number;
  // Raw kcal consumed today. When provided, the Calories section header
  // shows this amount instead of caloriesPercent's "%" value (the bar
  // fill itself still uses caloriesPercent).
  caloriesAmount?: number;
  // Optional daily kcal goal — when given alongside caloriesAmount, the
  // header shows "amount / goal" instead of just "amount".
  caloriesGoal?: number;
  // Delta %/kcal from today's planned meals — same idea as
  // vitaminsOverallPlannedPercent, for the Calories bar.
  caloriesPlannedPercent?: number;
  caloriesPlannedAmount?: number;
  macrosOverallPercent?: number;
  macroPercents?: PercentMap; // keyed by MACRO_ITEMS .key
  macroOverLimit?: OverLimitMap;
  macroOverLimitInfo?: OverLimitMap;
  plannedMacroPercents?: PercentMap;
  macrosOverallPlannedPercent?: number;
  mineralsOverallPercent?: number;
  mineralPercents?: PercentMap; // keyed by MINERAL_ITEMS .key
  mineralOverLimit?: OverLimitMap;
  mineralOverLimitInfo?: OverLimitMap;
  plannedMineralPercents?: PercentMap;
  mineralsOverallPlannedPercent?: number;
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

const FALLBACK_STOPS: { coral: RGB; orange: RGB; green: RGB; danger: RGB; info: RGB } = {
  coral: [255, 107, 107],
  orange: [255, 169, 77],
  green: [81, 207, 102],
  // Distinct from `coral` (which just means "low intake") — this flags an
  // actual overdose (consumed > UL), so it needs to read as a different,
  // more urgent signal even though both are "red-ish".
  danger: [217, 33, 33],
  // Used for "over UL, but only a supplement-only limit crossed from whole
  // food" (see vitaminDRI.json's per-entry ulMode) — worth noticing, not worth alarming over,
  // so it's a calm blue rather than red/orange.
  info: [74, 144, 217],
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

function rgbString(rgb: RGB): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
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
    const danger = parseColorToRgb(computed.getPropertyValue("--dv-danger")) ?? FALLBACK_STOPS.danger;
    const info = parseColorToRgb(computed.getPropertyValue("--dv-info")) ?? FALLBACK_STOPS.info;
    setStops({ coral, orange, green, danger, info });
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
  plannedPercent = 0,
  label,
  size,
  stops,
  overLimit,
  overLimitInfo,
  onClick,
}: {
  percent: number;
  /**
   * Additional %DV (delta, not absolute) that would be reached if today's
   * *planned* (not-yet-eaten) meals for this nutrient were also consumed.
   * Drawn as a translucent (opacity 0.5) extension of the ring's arc from
   * `percent` up to `percent + plannedPercent` (capped at a full circle),
   * plus a small "+xy%" pill at the bottom of the ring. 0/omitted draws
   * nothing extra — existing callers are unaffected.
   */
  plannedPercent?: number;
  label: string;
  size: number | "sm" | "lg" | "glg" | "glge";
  stops: typeof FALLBACK_STOPS;
  /**
   * True when today's consumed amount for this nutrient is above its
   * upper limit (UL) AND that UL is a real, any-source risk (see
   * vitaminDRI.json's per-entry ulMode) — an overdose, not just "over 100% of the target".
   * Overrides the normal green/orange/coral gradient with a fixed danger
   * color and adds a small "!" badge, so it reads as a distinct warning
   * rather than a healthy excess. Takes priority over `overLimitInfo` if
   * both are somehow true.
   */
  overLimit?: boolean;
  /**
   * True when today's consumed amount is above the UL, but that UL applies
   * to synthetic/supplemental intake specifically (folate, niacin, vitamin
   * E, calcium, iron, magnesium — see vitaminDRI.json's per-entry ulMode) and every gram
   * logged today came from whole food. Renders a calmer "i" badge instead
   * of the danger one — worth a look, not an alarm.
   */
  overLimitInfo?: boolean;
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
  // How far the translucent "if you also eat what's planned" arc reaches —
  // same clamp-at-a-full-circle logic, just measured from the projected
  // (consumed + planned) total instead of consumed alone.
  const projectedClamped = Math.min(100, Math.max(clamped, clamped + plannedPercent));
  const projectedOffset = circumference * (1 - projectedClamped / 100);
  const showPlanned = plannedPercent > 0.5;
  // Info-only crossings keep the normal healthy-excess gradient for the
  // ring fill itself (it's not a real overdose) — only the badge changes.
  const color = overLimit ? rgbString(stops.danger) : gradientColor(percent, stops);
  // Soft ceiling purely so an extreme outlier (a mega-dose supplement, say)
  // can't blow out the ring's layout with a 5-digit number.
  const displayPercent = Math.min(999, Math.max(0, Math.round(percent)));
  const badgeSize = Math.max(12, Math.round(dimension * 0.28));
  const plannedBadgeFontSize = Math.max(8, Math.round(dimension * 0.16));

  
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
      style={{ position: "relative", ...(onClick ? { cursor: "pointer" } : {}) }}
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
        {showPlanned && (
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={projectedOffset}
            opacity={0.5}
            transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
          />
        )}
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
      {overLimit && (
        <span
          aria-label="Above upper limit"
          title="Above upper limit"
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: badgeSize,
            height: badgeSize,
            borderRadius: "50%",
            background: rgbString(stops.danger),
            color: "#fff",
            fontSize: Math.max(9, Math.round(badgeSize * 0.7)),
            fontWeight: 700,
            lineHeight: `${badgeSize}px`,
            textAlign: "center",
            boxShadow: "0 0 0 2px var(--dv-track, #fff)",
          }}
        >
          !
        </span>
      )}
      {!overLimit && overLimitInfo && (
        <span
          aria-label="Above upper limit for supplements — not a concern from whole food"
          title="Above the supplement upper limit — from whole food alone, this isn't considered risky. Tap for details."
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: badgeSize,
            height: badgeSize,
            borderRadius: "50%",
            background: rgbString(stops.info),
            color: "#fff",
            fontSize: Math.max(9, Math.round(badgeSize * 0.7)),
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: `${badgeSize}px`,
            textAlign: "center",
            boxShadow: "0 0 0 2px var(--dv-track, #fff)",
          }}
        >
          i
        </span>
      )}
      {showPlanned && (
        <span
          className={styles["planned-badge"]}
          aria-label={`+${Math.round(plannedPercent)}% if planned meals are eaten`}
          title="Additional %DV if today's planned meals are also eaten"
          style={{ fontSize: plannedBadgeFontSize }}
        >
          +{Math.round(plannedPercent)}%
        </span>
      )}
    </div>
  );
}

function LinearBar({
  percent,
  plannedPercent = 0,
  stops,
}: {
  percent: number;
  // Delta — see CircleRing's plannedPercent doc. Drawn as a translucent
  // extension of the fill, from `percent` out to `percent + plannedPercent`.
  plannedPercent?: number;
  stops: typeof FALLBACK_STOPS;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const projectedClamped = Math.min(100, Math.max(clamped, clamped + plannedPercent));
  const color = gradientColor(percent, stops);
  const showPlanned = plannedPercent > 0.5;
  return (
    <div className={styles["linear-track"]} style={{ position: "relative" }}>
      {showPlanned && (
        <div
          className={styles["linear-fill"]}
          style={{
            position: "absolute",
            inset: 0,
            width: `${projectedClamped}%`,
            backgroundColor: color,
            opacity: 0.5,
          }}
        />
      )}
      <div
        className={styles["linear-fill"]}
        style={{ position: "absolute", inset: 0, width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

function VerticalBar({
  percent,
  plannedPercent = 0,
  label,
  stops,
  overLimit,
  overLimitInfo,
  onClick,
}: {
  percent: number;
  // Delta — see CircleRing's plannedPercent doc. Drawn as a translucent
  // extension of the bar's fill height, from `percent` out to
  // `percent + plannedPercent`.
  plannedPercent?: number;
  label: string;
  stops: typeof FALLBACK_STOPS;
  // Real, any-source UL risk — see CircleRing's overLimit doc.
  overLimit?: boolean;
  // Over a supplement-only UL, from whole food alone — see CircleRing's
  // overLimitInfo doc.
  overLimitInfo?: boolean;
  onClick?: () => void;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const maxHeight = 130; // px, matches the track height in CSS
  const fillHeight = clamped === 0 ? 0 : Math.max(6, (clamped / 100) * maxHeight);
  const projectedClamped = Math.min(100, Math.max(clamped, clamped + plannedPercent));
  const projectedFillHeight =
    projectedClamped === 0 ? 0 : Math.max(6, (projectedClamped / 100) * maxHeight);
  const showPlanned = plannedPercent > 0.5;
  const color = overLimit ? rgbString(stops.danger) : gradientColor(percent, stops);
  const showInfoBadge = !overLimit && overLimitInfo;

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
      <span className={styles["vbar-label"]}>
        {label}
        {overLimit && (
          <span
            aria-label="Above upper limit"
            title="Above upper limit"
            style={{ color: rgbString(stops.danger), fontWeight: 700, marginLeft: 3 }}
          >
            !
          </span>
        )}
        {showInfoBadge && (
          <span
            aria-label="Above upper limit for supplements — not a concern from whole food"
            title="Above the supplement upper limit — from whole food alone, this isn't considered risky. Tap for details."
            style={{ color: rgbString(stops.info), fontWeight: 700, fontStyle: "italic", marginLeft: 3 }}
          >
            i
          </span>
        )}
      </span>
      <div className={styles["vbar-track"]} style={{ height: maxHeight, position: "relative" }}>
        {showPlanned && (
          <div
            className={styles["vbar-fill"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: projectedFillHeight,
              backgroundColor: color,
              opacity: 0.5,
            }}
          />
        )}
        <div className={styles["vbar-fill"]} style={{ height: fillHeight, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  percent,
  valueLabel,
}: {
  title: string;
  percent: number;
  // When provided, rendered instead of the rounded percent — e.g. the raw
  // calorie count for the Calories section, where showing "1850" (or
  // "1850 / 2200") is more useful than "84%".
  valueLabel?: string;
}) {
  // Overall section percent is already capped per-nutrient before averaging
  // (see computeDailyValueData), so this should never exceed 100 — clamped
  // here too purely as a display safety net.
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={styles["section-header"]}>
      <h2 className={styles["section-title"]}>{title}</h2>
      <span className={styles["section-percent"]}>{valueLabel ?? `${Math.round(clamped)}%`}</span>
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
  vitaminOverLimit = {},
  vitaminOverLimitInfo = {},
  plannedVitaminPercents = {},
  vitaminsOverallPlannedPercent = 0,
  caloriesPercent = 0,
  caloriesAmount,
  caloriesGoal,
  caloriesPlannedPercent = 0,
  macrosOverallPercent = 0,
  macroPercents = {},
  macroOverLimit = {},
  macroOverLimitInfo = {},
  plannedMacroPercents = {},
  macrosOverallPlannedPercent = 0,
  mineralsOverallPercent = 0,
  mineralPercents = {},
  mineralOverLimit = {},
  mineralOverLimitInfo = {},
  plannedMineralPercents = {},
  mineralsOverallPlannedPercent = 0,
  onNutrientClick,
}: DailyValueModuleProps) {
  const t = useTranslations("FoodDiary");
  const stops = useGradientStops();

  // Same graceful-fallback pattern used elsewhere (QuantitySheet,
  // NutrientDetailSheet) for keys that may not exist in messages/*.json yet.
  const tt = (key: string, fallback: string) => {
    try {
      const value = t(key);
      return value === key ? fallback : value;
    } catch {
      return fallback;
    }
  };

  // Whether to show the "+xy% = planned meal" legend at all — only worth
  // showing when at least one section actually has something planned today.
  const hasAnyPlanned =
    vitaminsOverallPlannedPercent > 0.5 ||
    macrosOverallPlannedPercent > 0.5 ||
    mineralsOverallPlannedPercent > 0.5 ||
    caloriesPlannedPercent > 0.5;

  return (
    <div className={styles["dashboard"]}>
      <h1 className={styles["dashboard-title"]}>{t("dailyValue")}</h1>

      {hasAnyPlanned && (
        <div className={styles["planned-legend"]}>
          <span className={styles["planned-legend-badge"]}>+xy%</span>
          <span className={styles["planned-legend-text"]}>
            {tt("plannedLegend", "— planned meal, not yet eaten")}
          </span>
        </div>
      )}

      {/* Vitamins */}
      <section className={styles["section"]}>
        <SectionHeader title={t("vitaminsSection")} percent={vitaminsOverallPercent} />
        <LinearBar
          percent={vitaminsOverallPercent}
          plannedPercent={vitaminsOverallPlannedPercent}
          stops={stops}
        />

        <div className={styles["ring-row-lg"]}>
          {VITAMIN_PRIMARY.map((v) => {
            const percent = vitaminPercents[v.key] ?? 0;
            return (
              <CircleRing
                key={v.key}
                label={v.label}
                percent={percent}
                plannedPercent={plannedVitaminPercents[v.key] ?? 0}
                size="lg"
                stops={stops}
                overLimit={vitaminOverLimit[v.key] ?? false}
                overLimitInfo={vitaminOverLimitInfo[v.key] ?? false}
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
                plannedPercent={plannedVitaminPercents[v.key] ?? 0}
                size="sm"
                stops={stops}
                overLimit={vitaminOverLimit[v.key] ?? false}
                overLimitInfo={vitaminOverLimitInfo[v.key] ?? false}
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
        <SectionHeader
          title={t("calories")}
          percent={caloriesPercent}
          valueLabel={
            caloriesAmount != null
              ? caloriesGoal != null
                ? `${Math.round(caloriesAmount)} / ${Math.round(caloriesGoal)}`
                : `${Math.round(caloriesAmount)}`
              : undefined
          }
        />
        <LinearBar percent={caloriesPercent} plannedPercent={caloriesPlannedPercent} stops={stops} />
      </section>

      {/* Macronutrients */}
      <section className={`${styles["section"]} ${styles["macronutrients-section"]}`}>
        <SectionHeader title={t("macronutrientsSection")} percent={macrosOverallPercent} />
        <LinearBar
          percent={macrosOverallPercent}
          plannedPercent={macrosOverallPlannedPercent}
          stops={stops}
        />

        <div className={styles["ring-row-lg"]}>
          {MACRO_ITEMS.map((m) => {
            const percent = macroPercents[m.key] ?? 0;
            const label = t(m.key);
            return (
              <CircleRing
                key={m.key}
                label={label}
                percent={percent}
                plannedPercent={plannedMacroPercents[m.key] ?? 0}
                size={64}
                stops={stops}
                overLimit={macroOverLimit[m.key] ?? false}
                overLimitInfo={macroOverLimitInfo[m.key] ?? false}
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
        <LinearBar
          percent={mineralsOverallPercent}
          plannedPercent={mineralsOverallPlannedPercent}
          stops={stops}
        />

        <div className={styles["vbar-row"]}>
          {MINERAL_ITEMS.map((m) => {
            const percent = mineralPercents[m.key] ?? 0;
            const label = t(m.key);
            return (
              <VerticalBar
                key={m.key}
                label={label}
                percent={percent}
                plannedPercent={plannedMineralPercents[m.key] ?? 0}
                stops={stops}
                overLimit={mineralOverLimit[m.key] ?? false}
                overLimitInfo={mineralOverLimitInfo[m.key] ?? false}
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