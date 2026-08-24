// components/food-diary/QuantitySheet.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations} from "next-intl";
import styles from "./quantitySheet.module.css";
import { DiaryProduct } from "./addFoodSheet";

import productDetailsRu from "@/data/ru/productDetails.json";
import productDetailsEn from "@/data/en/productDetails.json";
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

  const productDetailsData = useMemo(() => {
    return locale === "ru" ? productDetailsRu : productDetailsEn;
  }, [locale]);

  const slug = product ? product.link.substring(product.link.lastIndexOf("/") + 1) : "";
  const detail = product ? (productDetailsData as any)[slug] : null;

  const servingInfo = useMemo(() => parseServingInfo(detail?.macroTitle), [detail]);

  const [quantity, setQuantity] = useState(servingInfo.baseAmount);

  useEffect(() => {
    if (open) {
      setQuantity(servingInfo.baseAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

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