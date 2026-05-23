"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../productInfo.module.css";
import { getVitaminSlugs } from "@/lib/details";
import type { NutrientItem, ProductDetail } from "@/types/details";

const vitaminSlugs = new Set(getVitaminSlugs());

type Props = {
  product: ProductDetail;
};

const ProductInfoClient = ({ product }: Props) => {
  const [selectedItem, setSelectedItem] = useState<NutrientItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedItem) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [selectedItem]);

  const handleOpenModal = (item: NutrientItem) => setSelectedItem(item);
  const handleCloseModal = () => setSelectedItem(null);

  const descriptionParts = product.description.split("\n").filter(Boolean);

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["content-section"]}>
        <div className={styles["content"]}>
          <div className={styles["product-img-container"]}>
            <Link href="/products" className={styles["backlink"]}>
              <Image src="/back.svg" alt="back" width={20} height={20} />
            </Link>
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={600}
              height={472}
              className={styles["product-img"]}
            />
          </div>
          <div className={styles["content-text"]}>
            <h1 className={styles["product-name"]}>{product.name}</h1>
            <div className={styles["product-category"]}>{product.category}</div>

            <div
              style={{ background: "#fbf2d8" }}
              className={styles["product-description"]}
            >
              {descriptionParts.map((part, index) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {part}
                </span>
              ))}
            </div>

            <div
              style={{ background: "#fbf0d9" }}
              className={`${styles["macro-nutrients"]} ${styles["product-section"]}`}
            >
              <h3>
                {product.macroTitle}{" "}
                <span className={styles["hint"]}>(Click to learn more)</span>
              </h3>
              {product.macroIntro && (
                <>
                  {product.macroIntro}
                  <br />
                </>
              )}
              {product.macroNutrients.map((item) => (
                <div
                  key={item.id}
                  style={{ background: item.bg }}
                  className={`${styles["macro-nutrient"]} ${styles["subelem"]} ${styles["clickable-element"]}`}
                  onClick={() => handleOpenModal(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>

            <div
              style={{ background: "#fbf0d9" }}
              className={`${styles["nutrients-and-microelements"]} ${styles["product-section"]}`}
            >
              <h3>
                Nutrients and microelements{" "}
                <span className={styles["hint"]}>(Click to learn more)</span>
              </h3>
              {product.microIntro && (
                <>
                  {product.microIntro}
                  <br />
                </>
              )}
              {product.microNutrients.map((item) => (
                <div
                  key={item.id}
                  style={{ background: item.bg }}
                  className={`${styles["macro-nutrient"]} ${styles["subelem"]} ${styles["clickable-element"]}`}
                  onClick={() => handleOpenModal(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>

            <div
              style={{ background: "#fbf2d8" }}
              className={`${styles["health-benefits"]} ${styles["product-section"]}`}
            >
              <h3>Key Health Benefits</h3>
              <ul>
                {product.healthBenefits.map((benefit) => (
                  <li
                    key={benefit.slice(0, 40)}
                    dangerouslySetInnerHTML={{ __html: benefit }}
                  />
                ))}
              </ul>
            </div>

            <div
              style={{ background: "#fff2f0" }}
              className={`${styles["precautions"]} ${styles["product-section"]}`}
            >
              <h3>Important Precautions</h3>
              {product.precautionsIntro && (
                <>
                  <br />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: product.precautionsIntro,
                    }}
                  />
                </>
              )}
              {product.precautions.length > 0 && (
                <ul>
                  {product.precautions.map((item) => (
                    <li
                      key={item.slice(0, 40)}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles["navigation"]}>
        <Link className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/products">
          <Image
            src="/main/products-green.svg"
            alt="products"
            width={48}
            height={48}
          />
        </Link>
        <Link className={styles["nav-link"]} href="/vitamins">
          <Image
            src="/main/antioxidant.svg"
            alt="antioxidant"
            width={48}
            height={48}
          />
        </Link>
        <Link className={styles["nav-link"]} href="/favorites">
          <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
        </Link>
      </div>

      <dialog
        ref={dialogRef}
        className={styles["modal-dialog"]}
        onClose={handleCloseModal}
        onClick={(e) => {
          if (e.target === dialogRef.current) handleCloseModal();
        }}
      >
        {selectedItem && (
          <div className={styles["modal-content"]}>
            <div
              className={styles["modal-header-badge"]}
              style={{ backgroundColor: selectedItem.bg }}
            >
              {selectedItem.name}: {selectedItem.amount}
            </div>

            <p className={styles["modal-description"]}>
              {selectedItem.description}
            </p>

            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {selectedItem.slug && vitaminSlugs.has(selectedItem.slug) && (
                <Link
                  href={`/vitamininfo/${selectedItem.slug}`}
                  className={styles["modal-more-link"]}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: selectedItem.bg,
                    color: "#fff",
                    fontSize: "14px",
                    textDecoration: "none",
                    fontWeight: "500",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  More
                </Link>
              )}

              <button
                className={styles["modal-close-btn"]}
                onClick={handleCloseModal}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
};

export default ProductInfoClient;
