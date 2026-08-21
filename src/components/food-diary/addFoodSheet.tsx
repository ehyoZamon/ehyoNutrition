// components/food-diary/AddFoodSheet.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import styles from "./addFoodSheet.module.css";

import productsRu from "@/data/ru/products.json";
import productsEn from "@/data/en/products.json";

export type DiaryProduct = {
  id: number;
  name: string;
  category: string;
  calories: number;
  image: string;
  link: string;
};

type AddFoodSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: DiaryProduct) => void;
};

const AddFoodSheet = ({ open, onClose, onSelectProduct }: AddFoodSheetProps) => {
  const locale = useLocale();
  const [search, setSearch] = useState("");

  const productsData = useMemo(() => {
    return (locale === "ru" ? productsRu : productsEn) as DiaryProduct[];
  }, [locale]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return productsData;

    return productsData.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
  }, [productsData, search]);

  // Сбрасываем поиск при каждом открытии, чтобы не тащить старый запрос
  if (!open) return null;

  return (
    <div className={styles["overlay"]} onClick={onClose}>
      <div className={styles["sheet"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["search-container"]}>
          <Image
            src="/search.svg"
            alt="search-icon"
            width={16}
            height={16}
            className={styles["search-icon"]}
          />
          <input
            type="text"
            placeholder="Search food"
            className={styles["search-input"]}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles["list"]}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className={styles["item"]} key={product.id}>
                <div className={styles["item-img-container"]}>
                  <Image src={product.image} alt={product.name} width={48} height={48} />
                </div>

                <div className={styles["item-details"]}>
                  <div className={styles["item-name"]}>{product.name}</div>
                  <div className={styles["item-category"]}>{product.category}</div>
                  <div className={styles["item-calories"]}>Calories: {product.calories}</div>
                </div>

                <button
                  type="button"
                  className={styles["add-btn"]}
                  aria-label={`Add ${product.name}`}
                  onClick={() => onSelectProduct(product)}
                >
                  +
                </button>
              </div>
            ))
          ) : (
            <div className={styles["empty-state"]}>
              <Image src="/nothing-found.svg" alt="nothing-found" width={48} height={48} />
              Nothing found
            </div>
          )}
        </div>

        <button type="button" className={styles["close-btn"]} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default AddFoodSheet;