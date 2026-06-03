"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import styles from "../vitaminInfo.module.css";
import { getProductsByVitaminSlug } from "@/lib/details";
import type { VitaminDetail } from "@/types/details";
import { useRouter } from "next/navigation";

type Props = {
  vitaminEn: VitaminDetail;
  vitaminRu: VitaminDetail;
};

const VitaminInfoClient = ({ vitaminEn, vitaminRu }: Props) => {
  const t = useTranslations("VitaminInfo");
  const locale = useLocale();
  
  const router = useRouter();

  // Автоматически выбираем нужные локализованные данные на основе выбранного языка
  const vitamin = locale === "ru" ? vitaminRu : vitaminEn;

  const [activeTab, setActiveTab] = useState<"deficiency" | "overdose">(
    "deficiency"
  );

  // Список продуктов, содержащих данный элемент
  const foodSources = useMemo(
    () => getProductsByVitaminSlug(vitamin.slug, locale),
    [vitamin.slug, locale]
  );

  const descriptionParts = vitamin.description.split("\n").filter(Boolean);

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["content-section"]}>
        <div className={styles["content"]}>
          <div className={styles["vitamin-img-container"]}>
            <div onClick={() => router.back()} className={styles["backlink"]}>
              <Image src="/back.svg" alt="back" width={20} height={20} />
            </div>
            <Image
              src="/vitamininfo/nutrients.png"
              alt="nutrients"
              width={600}
              height={472}
              className={styles["vitamin-img"]}
            />
          </div>
          <div className={styles["content-text"]}>
            <h1 className={styles["vitamin-name"]}>{vitamin.title}</h1>
            <div className={styles["vitamin-category"]}>{vitamin.category}</div>

            <div
              style={{ background: "none" }}
              className={styles["vitamin-description"]}
            >
              {descriptionParts.map((part, index) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {part}
                </span>
              ))}
            </div>

            <div
              style={{ background: "#fbf2d8" }}
              className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}
            >
              <h3>{t("keyFunctions")}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: vitamin.keyFunctionsHtml }}
              />
            </div>

            <div
              style={{ background: "none" }}
              className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}
            >
              <h3>{t("topFoodSources")}</h3>
              {vitamin.foodSourcesIntro && <p>{vitamin.foodSourcesIntro}</p>}
              {foodSources.length > 0 ? (
                <div className={styles["food-sources-container"]}>
                  {foodSources.map((source) => (
                    <Link
                      key={source.slug}
                      href={source.link}
                      className={`${styles["food-source"]} ${styles["subelem"]}`}
                    >
                      <Image
                        src={source.image}
                        alt={source.name}
                        width={40}
                        height={40}
                        className={styles["food-source-img"]}
                      />
                      <div className={styles["product-name"]}>{source.name}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>{t("noProductsFound")}</p>
              )}
              {vitamin.foodSourcesNotesHtml && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: vitamin.foodSourcesNotesHtml,
                  }}
                />
              )}
            </div>

            <div
              style={{ background: "#fbf0d9" }}
              className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}
            >
              <h3>{t("recommendedDailyIntake")}</h3>
              <div dangerouslySetInnerHTML={{ __html: vitamin.rdiHtml }} />
            </div>

            <div
              style={{ background: "#fff2f0" }}
              className={`${styles["tabs-and-symptoms-section"]} ${styles["vitamin-section"]}`}
            >
              <div className={styles["tabs-and-symptoms"]}>
                <div
                  onClick={() => setActiveTab("deficiency")}
                  className={`${styles["tab"]} ${activeTab === "deficiency" ? styles["active"] : ""}`}
                >
                  {t("deficiencySymptoms")}
                </div>
                <div
                  onClick={() => setActiveTab("overdose")}
                  className={`${styles["tab"]} ${activeTab === "overdose" ? styles["active"] : ""}`}
                >
                  {t("overdose")}
                </div>
              </div>

              <div className={styles["tabs-and-symptoms-content"]}>
                {activeTab === "deficiency" && (
                  <div
                    className={`${styles["ts-tab"]} ${styles["deficiency-symptoms-content"]}`}
                    dangerouslySetInnerHTML={{ __html: vitamin.deficiencyHtml }}
                  />
                )}
                {activeTab === "overdose" && (
                  <div
                    className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}
                    dangerouslySetInnerHTML={{ __html: vitamin.overdoseHtml }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles["navigation"]}>
        <Link className={styles["nav-link"]} href="/main">
          <Image src="/main/home.svg" alt="home" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/products">
          <Image src="/main/products.svg" alt="products" width={48} height={48} />
        </Link>
        <Link className={styles["nav-link"]} href="/vitamins">
          <Image
            src="/main/antioxidant-green.svg"
            alt="antioxidant"
            width={48}
            height={48}
          />
        </Link>
        <Link className={styles["nav-link"]} href="/favorites">
          <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
        </Link>
      </div>
    </div>
  );
};

export default VitaminInfoClient;