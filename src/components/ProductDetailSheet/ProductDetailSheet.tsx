"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import styles from "./ProductDetailSheet.module.css";
import { parseAmount } from "@/lib/nutrientFormat";

type Nutrient = {
  id: string | number;
  slug: string;
  name: string;
  amount: string;
  description?: string;
};

type ProductDetail = {
  slug: string;
  name: string;
  category: string;
  image: string;
  description?: string;
  macroNutrients: Nutrient[];
  microNutrients: Nutrient[];
};

type Props = {
  slug: string;
  locale: string;
  /** Shown immediately, before the full per-product file has loaded. */
  basicInfo: { name: string; image: string };
  /** Optional — link to the full product page, if you still want one. */
  fullInfoHref?: string;
  onClose: () => void;
};

// One dynamic import per (locale, slug) — webpack code-splits every file
// under data/<locale>/productDetails/ into its own chunk, so this only
// ever fetches the ONE file for the product that was clicked, not the
// whole productDetails.json.
async function loadProductDetail(locale: string, slug: string): Promise<ProductDetail> {
  const mod =
    locale === "ru"
      ? await import(`@/data/ru/productDetails/${slug}.json`)
      : await import(`@/data/en/productDetails/${slug}.json`);
  return (mod.default ?? mod) as ProductDetail;
}

const ProductDetailSheet = ({ slug, locale, basicInfo, fullInfoHref, onClose }: Props) => {
  const t = useTranslations("Products");
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  // Load only this product's file when the sheet opens.
  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setLoading(true);

    loadProductDetail(locale, slug)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        console.error(`Failed to load product detail for "${slug}"`, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, slug]);

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
        aria-label={detail?.name ?? basicInfo.name}
      >
        <div className={styles.grabber} />

        <div className={styles.scrollArea}>
        <div className={styles.container}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarCircle}>
              <Image
                src={basicInfo.image}
                alt={detail?.name ?? basicInfo.name}
                width={64}
                height={64}
              />
            </div>
          </div>

          <h2 className={styles.title}>{detail?.name ?? basicInfo.name}</h2>

          {(macroCalories || macro.length > 0) && (
            <div className={styles.macroBand}>
              {macroCalories && (
                <div className={styles.macroCol}>
                  <span className={styles.macroLabel}>{macroCalories.name}</span>
                  <span className={styles.macroValue}>{parseAmount(macroCalories.amount).value}</span>
                </div>
              )}
              {macro.slice(0, 3).map((n) => {
                const { value } = parseAmount(n.amount);
                return (
                  <div className={styles.macroCol} key={n.id}>
                    <span className={styles.macroLabel}>{n.name}</span>
                    <span className={styles.macroValue}>{value}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.listHeader}>
            <span>Daily value</span>
          </div>

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
                    {n.name} 
                  </span>
                  <span className={styles.rowValue}>{value}</span>
                </div>
              );
            })}
          </div>


        </div>
        </div>

        <div className={styles.closeButtonWrap}>
          <button type="button" className={styles.closeButton} onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSheet;
