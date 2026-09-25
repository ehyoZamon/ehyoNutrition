// components/food-diary/QuantitySheet.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import styles from "./quantitySheet.module.css";
import { DiaryProduct } from "./addFoodSheet";

// productDetails is now one file per product slug (see lib/productDetail.ts)
// instead of a single productDetails.json — loaded on demand below.
import { loadProductDetail, ProductDetail } from "@/lib/productDetail";
// components/food-diary/QuantitySheet.tsx
import { parseServingInfo, ServingInfo } from "@/lib/servingInfo";
import { parseAmount } from "@/lib/nutrientFormat";

// Same math used for the "Today's intake" dashboard (foodDiaryClient.tsx),
// just fed a single synthetic entry — {this product, the grams currently
// selected in the sheet} — instead of the whole day's entries. That keeps
// the %DV logic (DRI lookup, mg conversion, per-item vs. section-overall
// averaging) defined in exactly one place.
import { computeDailyValueData, emptyDailyValueData } from "@/lib/dailyValue";
import { SimpleUserProfile } from "@/lib/nutritionDRI";

const VISIBLE_ROWS = 5;

type DVRow = {
  key: string;
  name: string;
  amount: string;
  percent: number;
};

// Scales a per-100g amount string (e.g. "8 mg", "1.2g") by `factor` and
// keeps the original unit. Only touches the leading numeric part — any
// trailing "(x% DV)" segment has already been stripped out by parseAmount
// before this runs, since that static %DV is being replaced by the
// personalized one computed from the user's age/gender DRI.
function scaleAmountString(value: string, factor: number): string {
  const match = value.trim().match(/^(-?[\d.]+)\s*(.*)$/);
  if (!match) return value;

  const num = parseFloat(match[1]);
  if (Number.isNaN(num)) return value;

  const unit = match[2].trim();
  const scaled = num * factor;
  const rounded = Math.round(scaled * 10) / 10;
  const numStr = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);

  return unit ? `${numStr} ${unit}` : numStr;
}

type QuantitySheetProps = {
  open: boolean;
  product: DiaryProduct | null;
  onClose: () => void;
  onAdd: (
    product: DiaryProduct,
    amountLabel: string,
    grams: number,
    status?: "consumed" | "planned"
  ) => void;
  /**
   * "add" (default) — сумма по умолчанию берётся из base serving продукта,
   * кнопка подтверждения подписана как "Add".
   * "edit" — используется для редактирования уже существующей записи:
   * количество предзаполняется из initialGrams, кнопка подписана как "Save".
   */
  mode?: "add" | "edit";
  /**
   * Текущее количество записи в граммах — используется только в mode="edit"
   * чтобы предзаполнить поле количества значением, которое уже сохранено.
   */
  initialGrams?: number;
  /**
   * Профиль пользователя (дата рождения + пол) — нужен, чтобы посчитать
   * персональный %DV (возраст/пол влияют на рекомендованную суточную норму).
   * Тот же объект, что foodDiaryClient.tsx уже получает через
   * getUserProfile() и передаёт в computeDailyValueData(). Если не
   * передан — %DV считается по дефолтному DRI-контексту.
   */
  userProfile?: SimpleUserProfile | null;
};

// Tracks how much of the viewport's bottom is currently covered by the
// on-screen keyboard, using visualViewport — this works regardless of
// whether the native side resizes the WebView (adjustResize) or not
// (adjustPan / edge-to-edge setups where resize is intentionally left
// alone), because visualViewport tracks the actually-visible area either
// way, not the layout viewport.
function useKeyboardInset(enabled: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) {
      setInset(0);
      return;
    }

    const handleChange = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setInset(covered > 0 ? covered : 0);
    };

    handleChange();
    vv.addEventListener("resize", handleChange);
    vv.addEventListener("scroll", handleChange);

    return () => {
      vv.removeEventListener("resize", handleChange);
      vv.removeEventListener("scroll", handleChange);
      setInset(0);
    };
  }, [enabled]);

  return inset;
}

const QuantitySheet = ({
  open,
  product,
  onClose,
  onAdd,
  mode = "add",
  initialGrams,
  userProfile = null,
}: QuantitySheetProps) => {
  const locale = useLocale();
  const t = useTranslations("FoodDiary");
  const isEdit = mode === "edit";

  // Falls back to the key itself's readable form if a translation isn't
  // defined yet — mirrors the try/catch pattern ProductDetailSheet uses for
  // unit labels, so this section degrades gracefully before messages/*.json
  // gets the new keys (dailyValue, vitamins, minerals, showLess).
  const tt = (key: string, fallback: string) => {
    try {
      const value = t(key);
      return value === key ? fallback : value;
    } catch {
      return fallback;
    }
  };

  const slug = product ? product.link.substring(product.link.lastIndexOf("/") + 1) : "";

  const [detail, setDetail] = useState<ProductDetail | null>(null);

  const keyboardInset = useKeyboardInset(open);

  // Fetch this one product's detail file whenever the sheet opens for a
  // (possibly new) product — per-slug files are cached in lib/productDetail,
  // so re-opening a product already seen this session resolves instantly.
  useEffect(() => {
    if (!open || !slug) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    loadProductDetail(locale === "ru" ? "ru" : "en", slug).then((d) => {
      if (!cancelled) setDetail(d);
    });
    return () => {
      cancelled = true;
    };
  }, [open, slug, locale]);

  const dailyVal=locale==="en" ? "DV": "CH";
  const servingInfo = useMemo(() => parseServingInfo(detail?.macroTitle), [detail]);

  const [quantity, setQuantity] = useState(servingInfo.baseAmount);

  // В режиме "add" количество сбрасывается на базовую порцию продукта.
  // В режиме "edit" количество восстанавливается из уже сохранённых граммов
  // (initialGrams), с пересчётом в штуки, если продукт мерится поштучно.
  useEffect(() => {
    if (!open) return;

    if (typeof initialGrams === "number") {
      if (servingInfo.mode === "count" && servingInfo.gramsPerUnit) {
        setQuantity(
          Math.round((initialGrams / servingInfo.gramsPerUnit) * 100) / 100
        );
      } else {
        setQuantity(initialGrams);
      }
    } else {
      setQuantity(servingInfo.baseAmount);
    }
  }, [
    open,
    product?.id,
    servingInfo.baseAmount,
    servingInfo.mode,
    servingInfo.gramsPerUnit,
    initialGrams,
  ]);

  const gramsTotal =
    servingInfo.mode === "count"
      ? Math.round(quantity * (servingInfo.gramsPerUnit ?? 0))
      : quantity;

  // Personalized %DV for exactly the amount currently dialed in. Reuses
  // computeDailyValueData with a single synthetic diary entry so the
  // vitamin/mineral/macro math (DRI lookup by age+gender, mg conversion,
  // per-section averaging) stays defined in one place (lib/dailyValue.ts)
  // instead of being duplicated here.
  const [dv, setDv] = useState(emptyDailyValueData());

  useEffect(() => {
    if (!open || !product || !detail) {
      setDv(emptyDailyValueData());
      return;
    }

    let cancelled = false;
    const entries = [{ productId: product.id, grams: gramsTotal || 0 }];
    const productMap = new Map([[product.id, { link: product.link }]]);

    computeDailyValueData(entries, productMap, userProfile).then((data) => {
      if (!cancelled) setDv(data);
    });

    return () => {
      cancelled = true;
    };
  }, [open, product, detail, gramsTotal, userProfile]);

  const factor = gramsTotal > 0 ? gramsTotal / 100 : 0;

  const macroRows = useMemo(() => {
    if (!detail) return [];
    const calories = detail.macroNutrients.find((n) => !n.slug);
    const macros = detail.macroNutrients.filter((n) => n.slug).slice(0, 3);
    return [...(calories ? [calories] : []), ...macros].map((n) => ({
      id: n.id,
      name: n.name,
      amount: scaleAmountString(parseAmount(n.amount).value, factor),
    }));
  }, [detail, factor]);

  const buildRows = (
    percents: Record<string, number> | undefined,
    resolveSlug: (key: string) => string
  ): DVRow[] => {
    if (!detail || !percents) return [];
    return Object.entries(percents)
      .map(([key, percent]) => {
        const targetSlug = resolveSlug(key);
        const nutrient = detail.microNutrients.find((n) => n.slug === targetSlug);
        if (!nutrient) return null;
        return {
          key,
          name: nutrient.name,
          amount: scaleAmountString(parseAmount(nutrient.amount).value, factor),
          percent: Math.round(percent),
        };
      })
      .filter((row): row is DVRow => row !== null);
  };

  const vitaminRows = useMemo(
    () => buildRows(dv.vitaminPercents ?? {}, (key) => `vitamin-${key}`),
    [dv.vitaminPercents, detail, factor]
  );
  const mineralRows = useMemo(
    () => buildRows(dv.mineralPercents ?? {}, (key) => key),
    [dv.mineralPercents, detail, factor]
  );

  const [vitaminsExpanded, setVitaminsExpanded] = useState(false);
  const [mineralsExpanded, setMineralsExpanded] = useState(false);

  // Collapse the "show more" state whenever a different product/quantity
  // sheet is opened, so it doesn't carry over from the previous product.
  useEffect(() => {
    setVitaminsExpanded(false);
    setMineralsExpanded(false);
  }, [open, product?.id]);

  const visibleVitaminRows = vitaminsExpanded ? vitaminRows : vitaminRows.slice(0, VISIBLE_ROWS);
  const visibleMineralRows = mineralsExpanded ? mineralRows : mineralRows.slice(0, VISIBLE_ROWS);

  if (!open || !product) return null;

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    setQuantity(isNaN(num) ? 0 : num);
  };

  const unitLabel =
    servingInfo.mode === "count"
      ? `${servingInfo.unit} (${gramsTotal} g)`
      : servingInfo.unit;

  const handleAdd = (status: "consumed" | "planned" = "consumed") => {
    const amountLabel =
      servingInfo.mode === "count"
        ? `${quantity} ${servingInfo.unit} (${gramsTotal} g)`
        : `${quantity}${servingInfo.unit}`;

    onAdd(product, amountLabel, gramsTotal, status);
  };

  const actionLabel = isEdit ? t("saveBtn") : t("addBtn");

  const renderDVSection = (
    titleKey: string,
    fallbackTitle: string,
    overallPercent: number | undefined,
    rows: DVRow[],
    visibleRows: DVRow[],
    expanded: boolean,
    onToggle: () => void
  ) => {
    if (rows.length === 0) return null;

    const safeOverallPercent = overallPercent ?? 0;

    return (
      <div className={styles["dv-section"]}>
        <div className={styles["dv-section-header"]}>
          <span className={styles["dv-section-title"]}>{tt(titleKey, fallbackTitle)}</span>
          <span className={styles["dv-section-percent"]}>{Math.round(safeOverallPercent)}%</span>
        </div>

        {visibleRows.map((row) => (
          <div className={styles["dv-row"]} key={row.key}>
            <span className={styles["dv-row-name"]}>
              {row.name} <span className={styles["dv-row-amount"]}>{row.amount}</span>
            </span>
            <span className={styles["dv-row-percent"]}>{row.percent}% {dailyVal}</span>
          </div>
        ))}

        {rows.length > VISIBLE_ROWS && (
          <button type="button" className={styles["dv-show-more"]} onClick={onToggle}>
            {expanded ? tt("showLess", "Show less") : tt("showMore", "Show More")}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles["overlay"]} onClick={onClose}>
      <div
        className={styles["sheet"]}
        onClick={(e) => e.stopPropagation()}
        style={{ transform: keyboardInset ? `translateY(-${keyboardInset}px)` : undefined }}
      >
        <div className={styles["image-wrap"]}>
          <div className={styles["image-circle"]}>
            <Image src={product.image} alt={product.name} width={96} height={96} />
          </div>
        </div>

        <div className={styles["quantity-row"]}>
          <input
            type="number"
            min={0}
            className={styles["quantity-input"]}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
          />
          <span className={styles["quantity-unit"]}>{unitLabel}</span>
        </div>

        <div className={styles["details-scroll"]}>
          {macroRows.length > 0 && (
            <div className={styles["macro-band"]}>
              {macroRows.map((row) => (
                <div className={styles["macro-col"]} key={row.id}>
                  <span className={styles["macro-label"]}>
                    {row.name === "Carbohydrates" ? "Carbs" : row.name}
                  </span>
                  <span className={styles["macro-value"]}>{row.amount}</span>
                </div>
              ))}
            </div>
          )}

          
          {renderDVSection(
            "vitamins",
            "Vitamins",
            dv.vitaminsOverallPercent,
            vitaminRows,
            visibleVitaminRows,
            vitaminsExpanded,
            () => setVitaminsExpanded((v) => !v)
          )}

          {renderDVSection(
            "minerals",
            "Minerals",
            dv.mineralsOverallPercent,
            mineralRows,
            visibleMineralRows,
            mineralsExpanded,
            () => setMineralsExpanded((v) => !v)
          )}
        </div>

        <div className={styles["actions"]}>
          <button type="button" className={styles["cancel-btn"]} onClick={onClose}>
            {t("cancelBtn")}
          </button>
          {!isEdit && (
            <button
              type="button"
              className={styles["plan-btn"]}
              onClick={() => handleAdd("planned")}
            >
              {tt("planBtn", "Plan")}
            </button>
          )}
          <button type="button" className={styles["add-btn"]} onClick={() => handleAdd("consumed")}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantitySheet;