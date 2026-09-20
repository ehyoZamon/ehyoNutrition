// components/food-diary/NutrientDetailSheet.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./nutrientDetailSheet.module.css";
import { CircleRing, useGradientStops } from "@/components/daily-value/dailyValueModule";
import { NutrientBreakdownRow } from "@/lib/dailyValue";

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
};

const NutrientDetailSheet = ({
  open,
  onClose,
  info,
  percent,
  rows,
  loading,
  recommendedLabel,
}: NutrientDetailSheetProps) => {
  const t = useTranslations("FoodDiary");
  const stops = useGradientStops();

  // Same graceful-fallback pattern QuantitySheet uses for its own
  // not-yet-translated keys, so this ships before messages/*.json is
  // updated with the new FoodDiary keys this sheet needs.
  const tt = (key: string, fallback: string) => {
    try {
      const value = t(key);
      return value === key ? fallback : value;
    } catch {
      return fallback;
    }
  };

  if (!open || !info) return null;

  return (
    <div className={styles["overlay"]} onClick={onClose}>
      <div className={styles["sheet"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["ring-wrap"]}>
          <CircleRing  percent={percent} label={""} size={"glge"} stops={stops} />
        </div>

        <h2 className={styles["title"]}>{info.title}</h2>

        {!loading && recommendedLabel && (
          <p className={styles["daily-norm"]}>
            {tt("dailyNorm", "Your daily value")}: {recommendedLabel}
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
        </div>

        <button type="button" className={styles["close-btn"]} onClick={onClose}>
          {tt("closeBtn", "Close")}
        </button>
      </div>
    </div>
  );
};

export default NutrientDetailSheet;
