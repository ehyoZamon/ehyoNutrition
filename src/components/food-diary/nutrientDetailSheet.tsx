// components/food-diary/NutrientDetailSheet.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./nutrientDetailSheet.module.css";
import { CircleRing, useGradientStops } from "@/components/daily-value/dailyValueModule";
import { NutrientBreakdownRow, TopProductForNutrient } from "@/lib/dailyValue";

export type NutrientDetailInfo = {
  section: "vitamin" | "macro" | "mineral";
  ringLabel: string; // short label shown inside the ring, e.g. "A", "Fat", "Sodium"
  title: string; // full display title, e.g. "Vitamin A", "Fat", "Sodium"
};

type NutrientDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  info: NutrientDetailInfo | null;
  percent: number;
  rows: NutrientBreakdownRow[];
  /**
   * True while computeNutrientBreakdown() is still resolving for the
   * current nutrient. The sheet opens immediately on click (with the
   * percent already known from the dashboard) and the row list fills in
   * once the per-product breakdown finishes loading.
   */
  loading?: boolean;
  /**
   * The user's personal daily norm for this nutrient (from vitaminDRI.json,
   * resolved for their age + gender), already localized for display, e.g.
   * "900 mcg" / "900 мкг". Null while still loading or when no DRI data
   * exists for this nutrient/age bracket.
   */
  recommendedLabel?: string | null;
  /**
   * The upper limit (UL) for this nutrient/age bracket, already localized
   * for display. Null while still loading or when vitaminDRI.json has no
   * UL data for this nutrient/age bracket.
   */
  ulLabel?: string | null;
  /**
   * Today's total intake as a % of the UL (e.g. 133 = 33% over the limit).
   * Null when there's no UL to compare against.
   */
  ulPercent?: number | null;
  /**
   * Today's total intake of this nutrient, localized and in the same unit
   * as ulLabel (e.g. "5 mg" next to a "3 mg" limit). Null when there's no
   * UL to express it against, or nothing logged yet.
   */
  consumedLabel?: string | null;
  /**
   * True once today's intake has actually crossed the UL — drives the
   * overdose warning shown below the daily norm and the ring's color.
   * Kept for backwards compatibility with callers that haven't been
   * updated yet; when `ulSeverity` is also passed, it takes priority (see
   * `ulSeverity` below for why the two can disagree).
   */
  isOverLimit?: boolean;
  /**
   * Whether this nutrient's UL applies to total intake from any source
   * ("total") or was set specifically for synthetic/supplemental/fortified
   * intake ("supplement_only") — see vitaminDRI.json's per-entry ulMode.
   * Not used directly for rendering (ulSeverity already encodes the
   * distinction that matters here); kept on the props for callers/analytics
   * that want the raw classification.
   */
  ulMode?: "total" | "supplement_only";
  /**
   * "none" — not over the UL. "danger" — over the UL and it's a real,
   * total-intake risk: shown as the red "⚠" warning, same as `isOverLimit`
   * always meant. "info" — over the UL, but only from whole-food sources of
   * a nutrient whose UL was written for supplements (folate, niacin,
   * vitamin E, calcium, iron, magnesium); shown as a calmer blue "ℹ" note
   * instead of an alarm. Falls back to `isOverLimit ? "danger" : "none"`
   * when omitted, so older callers keep working unchanged.
   */
  ulSeverity?: "none" | "info" | "danger";
  /**
   * Short, user-facing explanation of the nuance above (from
   * vitaminDRI.json's ulNote, already resolved to the active locale). Shown
   * under the daily norm whenever this nutrient has a UL, whether or not
   * today's intake is currently over it — so the context is there before it
   * becomes relevant. Null when there's no UL or no note configured for it.
   */
  ulNote?: string | null;
  /**
   * Top products from the whole catalog ranked by how much of this
   * nutrient they carry per 100g (independent of what's logged today) —
   * powers the "Foods rich in this nutrient" section below the breakdown.
   */
  topProducts?: TopProductForNutrient[];
  /**
   * True while getTopProductsForNutrient() is still resolving. Kept
   * separate from `loading` because the two lists load independently and
   * one can finish before the other.
   */
  topProductsLoading?: boolean;
};

const NutrientDetailSheet = ({
  open,
  onClose,
  info,
  percent,
  rows,
  loading,
  recommendedLabel,
  ulLabel,
  ulPercent,
  consumedLabel,
  isOverLimit,
  ulSeverity,
  ulNote,
  topProducts = [],
  topProductsLoading,
}: NutrientDetailSheetProps) => {
  const t = useTranslations("FoodDiary");
  const stops = useGradientStops();

  // Prefer the richer ulSeverity when the caller passes it; older callers
  // that only pass isOverLimit still get the same "danger" behavior they
  // always had.
  const severity: "none" | "info" | "danger" =
    ulSeverity ?? (isOverLimit ? "danger" : "none");

  // Same graceful-fallback pattern QuantitySheet uses for its own
  // not-yet-translated keys, so this ships before messages/*.json is
  // updated with the new FoodDiary keys this sheet needs. `values` lets a
  // key carry an interpolated number (e.g. "{percent}") instead of gluing
  // two separately-translated fragments around it — word order and number
  // agreement differ per language, so the whole sentence has to be one
  // translatable unit.
  const tt = (key: string, fallback: string, values?: Record<string, string | number>) => {
    try {
      const value = t(key, values as never);
      return value === key ? fallback : value;
    } catch {
      if (!values) return fallback;
      return Object.entries(values).reduce(
        (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
        fallback
      );
    }
  };

  if (!open || !info) return null;

  return (
    <div className={styles["overlay"]} onClick={onClose}>
      <div className={styles["sheet"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["ring-wrap"]}>
          <CircleRing
            percent={percent}
            label={""}
            size={"glge"}
            stops={stops}
            overLimit={severity === "danger"}
            overLimitInfo={severity === "info"}
          />
        </div>

        <h2 className={styles["title"]}>{info.title}</h2>

       

        <div className={styles["list"]}>
           {!loading && recommendedLabel && (
              <p className={styles["daily-norm"]}>
                {tt("dailyNorm", "Your daily value")}: {recommendedLabel}
                {ulLabel && ` - ${ulLabel}`}
              </p>
            )}

            {/* Shown whenever this nutrient has a UL and a configured note,
                regardless of whether today's intake is currently over it — the
                nuance (e.g. "this limit is about supplements, not food") is
                useful context before it becomes relevant, not just after. */}
            {!loading && ulLabel && ulNote && <p className={styles["ul-note"]}>{ulNote}</p>}

            {!loading && severity !== "none" && ulPercent !== null && ulPercent !== undefined && (
              <p
                className={styles["warning"]}
                style={
                  severity === "danger"
                    ? { color: "rgb(217, 33, 33)", fontWeight: 600 }
                    : { color: "#F59E0B", fontWeight: 600 }
                }
              >
                {severity === "danger" ? "⚠" : <span className={styles['info-circle']}>ℹ</span>}{" "}
                {severity === "danger"
                  ? tt(
                      "overLimitWarning",
                      "Limit {ulLabel}, consumed {consumedLabel} — {percent}% over",
                      {
                        ulLabel: ulLabel ?? "",
                        consumedLabel: consumedLabel ?? "",
                        percent: Math.round(ulPercent - 100),
                      }
                    )
                  : tt(
                      "overLimitWarning",
                      "{percent}% over the supplement limit {ulLabel} — from whole food, not considered a risk",
                      {
                        ulLabel: ulLabel ?? "",
                        consumedLabel: consumedLabel ?? "",
                        percent: Math.round(ulPercent - 100),
                      }
                    )}
              </p>
            )}
            
          <div className={styles["divider"]} />

          <h3 className={styles["section-title"]}>
            {tt("consumption", "Consumption")}
          </h3>

          {loading && <p className={styles["empty"]}>{tt("loading", "Loading...")}</p>}

          {!loading && rows.length === 0 && (
            <p className={styles["empty"]}>
              {tt("noContribution", "No foods logged yet contribute to this nutrient")}
            </p>
          )}

          {!loading &&
            rows.map((row) => (
              <div className={styles["row"]} key={`${row.productId}-${row.grams}`}>
                <div className={styles["row-left"]}>
                  <Image src={row.image} alt={row.name} width={32} height={32} />
                  <span className={styles["row-name"]}>
                    {row.name} ({row.grams}g)
                  </span>
                </div>
                <span className={styles["row-value"]}>
                  {row.amountLabel}/{row.percent}% {tt("dvSuffix", "DV")}
                </span>
              </div>
            ))}

          <div className={styles["divider"]} />

          <h3 className={styles["section-title"]}>
            {tt("topProductsTitle", "Foods rich in this nutrient")}
          </h3>

          {topProductsLoading && <p className={styles["empty"]}>{tt("loading", "Loading...")}</p>}

          {!topProductsLoading && topProducts.length === 0 && (
            <p className={styles["empty"]}>{tt("noTopProducts", "No data available")}</p>
          )}

          {!topProductsLoading &&
            topProducts.map((product) => (
              <div className={styles["row"]} key={product.productId}>
                <div className={styles["row-left"]}>
                  <Image src={product.image} alt={product.name} width={32} height={32} />
                  <span className={styles["row-name"]}>{product.name}</span>
                </div>
                <span className={styles["row-value"]}>
                  {product.amountLabel} {tt("per100g", "/ 100g")}
                </span>
              </div>
            ))}
        </div>

        <button type="button" className={styles["close-btn"]} onClick={onClose}>
          {tt("closeBtn", "Close")}
        </button>
      </div>
    </div>
  );
};

export default NutrientDetailSheet;