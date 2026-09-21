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
   */
  isOverLimit?: boolean;
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
  topProducts = [],
  topProductsLoading,
}: NutrientDetailSheetProps) => {
  const t = useTranslations("FoodDiary");
  const stops = useGradientStops();

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
            overLimit={!!isOverLimit}
          />
        </div>

        <h2 className={styles["title"]}>{info.title}</h2>

        {!loading && recommendedLabel && (
          <p className={styles["daily-norm"]}>
            {tt("dailyNorm", "Your daily value")}: {recommendedLabel}
            {ulLabel && ` - ${ulLabel}`}
          </p>
        )}

        {!loading && isOverLimit && ulPercent !== null && ulPercent !== undefined && (
          <p
            className={styles["warning"]}
            style={{ color: "rgb(217, 33, 33)", fontWeight: 600 }}
          >
            ⚠{" "}
            {tt(
              "overLimitWarning",
              "Limit {ulLabel}, consumed {consumedLabel} — {percent}% over",
              {
                ulLabel: ulLabel ?? "",
                consumedLabel: consumedLabel ?? "",
                percent: Math.round(ulPercent - 100),
              }
            )}
          </p>
        )}

        <div className={styles["list"]}>
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