"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import styles from "./ProductDetailSheet.module.css";
import { parseAmount } from "@/lib/nutrientFormat";
import { loadProductDetail, type ProductDetail } from "@/lib/productDetail";
import { useNutrientName } from "@/lib/useNutrientName";

type Props = {
  slug: string;
  /** Shown immediately, before the full per-product file has loaded. */
  basicInfo: { name: string; image: string };
  /** Optional — link to the full product page, if you still want one. */
  fullInfoHref?: string;
  onClose: () => void;
};

// Unit abbreviations that show up inside nutrient amounts (e.g. "16 g",
// "230 mg"). \b-bounded so "mg" inside "mg/kg" is matched on its own and a
// bare "g" never matches the "g" inside "mg"/"kg". Same set/approach as
// VitaminDetailSheet's localizeDRIValue — kept local to this file rather
// than a shared util, on purpose.
const UNIT_KEYS = ["mg", "mcg", "kg", "g", "kcal"] as const;

const localizeUnits = (
  raw: string,
  translateUnit: (unit: (typeof UNIT_KEYS)[number]) => string
): string => {
  let result = raw;
  for (const unit of UNIT_KEYS) {
    const translated = translateUnit(unit);
    result = result.replace(new RegExp(`\\b${unit}\\b`, "g"), () => translated);
  }
  return result;
};

const ProductDetailSheet = ({ slug, basicInfo, fullInfoHref, onClose }: Props) => {
  const t = useTranslations("Products");
  const nutrientName = useNutrientName();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const translateUnit = (unit: (typeof UNIT_KEYS)[number]) => {
    try {
      return t(`units.${unit}`);
    } catch {
      return unit;
    }
  };

  // Load only this product's file when the sheet opens.
  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setLoading(true);

    // Детали всегда из en-папки (см. lib/productDetail.ts); при ошибке придёт null.
    loadProductDetail("en", slug).then((data) => {
      if (cancelled) return;
      setDetail(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Slide-up animation + body scroll lock + Escape to close.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleClose = () => {
    setVisible(false);
    // let the slide-down transition finish before unmounting
    setTimeout(onClose, 200);
  };

  const macro = detail?.macroNutrients?.filter((n) => n.slug) ?? [];
  const macroCalories = detail?.macroNutrients?.find((n) => !n.slug); // the "calories" row has slug: ""
  const listNutrients = [...macro, ...(detail?.microNutrients ?? [])];

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.sheet} ${visible ? styles.sheetVisible : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={basicInfo.name}
      >
        <div className={styles.grabber} />

        <div className={styles.scrollArea}>
        <div className={styles.container}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarCircle}>
              <Image
                src={basicInfo.image}
                alt={basicInfo.name}
                width={64}
                height={64}
              />
            </div>
          </div>

          {/* Заголовок — локализованное имя из products.json, а не английское из detail */}
          <h2 className={styles.title}>{basicInfo.name}</h2>

          {(macroCalories || macro.length > 0) && (
            <div className={styles.macroBand}>
              {macroCalories && (
                <div className={styles.macroCol}>
                  <span className={styles.macroLabel}>{nutrientName(macroCalories)}</span>
                  <span className={styles.macroValue}>
                    {localizeUnits(parseAmount(macroCalories.amount).value, translateUnit)}
                  </span>
                </div>
              )}
              {macro.slice(0, 3).map((n) => {
                const { value } = parseAmount(n.amount);
                return (
                  <div className={styles.macroCol} key={n.id}>
                    <span className={styles.macroLabel}>{nutrientName(n)}</span>
                    <span className={styles.macroValue}>{localizeUnits(value, translateUnit)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {loading && !detail && (
            <div className={styles.loadingRows}>
              {[...Array(6)].map((_, i) => (
                <div className={styles.skeletonRow} key={i} />
              ))}
            </div>
          )}

          <div className={styles.list}>
            {listNutrients.map((n) => {
              const { value, dv } = parseAmount(n.amount);
              return (
                <div className={styles.row} key={`${n.id}-${n.slug}`}>
                  <span className={styles.rowName}>
                    {nutrientName(n)}
                  </span>
                  <span className={styles.rowValue}>{localizeUnits(value, translateUnit)}</span>
                </div>
              );
            })}
          </div>


        </div>
        </div>

        <div className={styles.closeButtonWrap}>
          <button type="button" className={styles.closeButton} onClick={handleClose}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSheet;