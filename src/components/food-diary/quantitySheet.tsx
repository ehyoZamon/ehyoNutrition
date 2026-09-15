// components/food-diary/QuantitySheet.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations} from "next-intl";
import styles from "./quantitySheet.module.css";
import { DiaryProduct } from "./addFoodSheet";

// productDetails is now one file per product slug (see lib/productDetail.ts)
// instead of a single productDetails.json — loaded on demand below.
import { loadProductDetail, ProductDetail } from "@/lib/productDetail";
// components/food-diary/QuantitySheet.tsx
import { parseServingInfo, ServingInfo } from "@/lib/servingInfo";



type QuantitySheetProps = {
  open: boolean;
  product: DiaryProduct | null;
  onClose: () => void;
  onAdd: (product: DiaryProduct, amountLabel: string, grams: number) => void;
};

const QuantitySheet = ({ open, product, onClose, onAdd }: QuantitySheetProps) => {
  const locale = useLocale();
  const t = useTranslations("FoodDiary");

  const slug = product ? product.link.substring(product.link.lastIndexOf("/") + 1) : "";

  const [detail, setDetail] = useState<ProductDetail | null>(null);

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

  const servingInfo = useMemo(() => parseServingInfo(detail?.macroTitle), [detail]);

  const [quantity, setQuantity] = useState(servingInfo.baseAmount);

  useEffect(() => {
    if (open) {
      setQuantity(servingInfo.baseAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id, servingInfo.baseAmount]);

  if (!open || !product) return null;

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    setQuantity(isNaN(num) ? 0 : num);
  };

  const gramsTotal =
    servingInfo.mode === "count"
      ? Math.round(quantity * (servingInfo.gramsPerUnit ?? 0))
      : quantity;

  const unitLabel =
    servingInfo.mode === "count"
      ? `${servingInfo.unit} (${gramsTotal} g)`
      : servingInfo.unit;

  const handleAdd = () => {
    const amountLabel =
      servingInfo.mode === "count"
        ? `${quantity} ${servingInfo.unit} (${gramsTotal} g)`
        : `${quantity}${servingInfo.unit}`;

    onAdd(product, amountLabel, gramsTotal);
  };

  return (
    <div className={styles["overlay"]} onClick={onClose}>
      <div className={styles["sheet"]} onClick={(e) => e.stopPropagation()}>
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

        <div className={styles["actions"]}>
          <button type="button" className={styles["cancel-btn"]} onClick={onClose}>
            {t("cancelBtn")}
          </button>
          <button type="button" className={styles["add-btn"]} onClick={handleAdd}>
            {t("addBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantitySheet;