// components/productMacros/ProductMacros.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import styles from "./ProductMacros.module.css";
import { loadProductDetail, type ProductDetail, type ProductNutrient } from "@/lib/productDetail";
import { parseAmount } from "@/lib/nutrientFormat";
import { useNutrientName } from "@/lib/useNutrientName";
import { useLocalizeUnits } from "@/lib/useLocalizeUnits";

// Порядок вывода: белки, жиры, углеводы. В списках — запасные slug'и на случай,
// если в productDetails жиры/углеводы названы иначе ("fat" вместо "fats" и т.п.).
const MACRO_SLUGS: string[][] = [["protein"], ["fats", "fat"]];

/**
 * Дописывает в строке списка после калорий: "Белки: 3.79 г", "Жиры: 1.02 г", "Карб: 4.77 г".
 *
 * Названия здесь КОРОТКИЕ и берутся из отдельного блока messages "NutrientsShort"
 * (ключ = slug), чтобы не менять полные названия "Углеводы"/"Carbohydrates" в шторках.
 * Нет короткого названия -> полное из "Nutrients" -> английское из productDetails.
 */
const ProductMacros = ({ slug }: { slug: string }) => {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const nutrientName = useNutrientName();
  const localizeUnits = useLocalizeUnits();
  const tShort = useTranslations("NutrientsShort");

  useEffect(() => {
    let cancelled = false;
    loadProductDetail("en", slug).then((d) => {
      if (!cancelled) setDetail(d);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!detail) return null;

  const items = MACRO_SLUGS.map((candidates) =>
    detail.macroNutrients.find((n) => candidates.includes(n.slug))
  ).filter((n): n is ProductNutrient => Boolean(n));

  const shortName = (n: ProductNutrient) =>
    tShort.has(n.slug) ? tShort(n.slug) : nutrientName(n);

  return (
    <>
      {items.map((n) => (
        <div className={styles["macro-item"]} key={`${n.id}-${n.slug}`}>
          {shortName(n)}:&nbsp;
          <span className={styles["macro-value"]}>
            {localizeUnits(parseAmount(n.amount).value)}
          </span>
        </div>
        
      ))}
    </>
  );
};

export default ProductMacros;