"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import styles from "../vitaminInfo.module.css";
import type { VitaminDetail } from "@/types/details";

type Props = {
  vitaminEn: VitaminDetail;
  vitaminRu: VitaminDetail;
};

type Tab = "deficiency" | "overdose";

const NAV_ITEMS = [
  { href: "/products", icon: "products" },
  { href: "/vitamins", icon: "antioxidant-green", alt: "antioxidant" },
  { href: "/food-diary", icon: "food-diary" },
  { href: "/favorites", icon: "heart" },
  { href: "/settings", icon: "settings" },
] as const;

const Html = ({ html, className }: { html: string; className?: string }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

const VitaminInfoClient = ({ vitaminEn, vitaminRu }: Props) => {
  const t = useTranslations("VitaminInfo");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("deficiency");

  const vitamin = locale === "ru" ? vitaminRu : vitaminEn;
  const descriptionParts = vitamin.description.split("\n").filter(Boolean);

  const tabs: { id: Tab; label: string; html: string }[] = [
    { id: "deficiency", label: t("deficiencySymptoms"), html: vitamin.deficiencyHtml },
    { id: "overdose", label: t("overdose"), html: vitamin.overdoseHtml },
  ];
  const currentTab = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["content-section"]}>
        <div className={styles["content"]}>
          <div className={styles["vitamin-img-container"]}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles["backlink"]}
              aria-label="back"
            >
              <Image src="/back.svg" alt="" width={20} height={20} />
            </button>
            <Image
              src="/vitamininfo/nutrients.png"
              alt="nutrients"
              width={600}
              height={472}
              className={styles["vitamin-img"]}
              priority
            />
          </div>

          <div className={styles["content-text"]}>
            <h1 className={styles["vitamin-name"]}>{vitamin.title}</h1>
            <div className={styles["vitamin-category"]}>{vitamin.category}</div>

            <div className={styles["vitamin-description"]}>
              {descriptionParts.map((part, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {part}
                </span>
              ))}
            </div>

            <div className={`${styles["vitamin-section"]} ${styles["key-functions"]}`}>
              <h3>{t("keyFunctions")}</h3>
              <Html html={vitamin.keyFunctionsHtml} />
            </div>

            {(vitamin.foodSourcesIntro || vitamin.foodSourcesNotesHtml) && (
              <div className={`${styles["vitamin-section"]} ${styles["top-food-sources"]}`}>
                <h3>{t("topFoodSources")}</h3>
                {vitamin.foodSourcesIntro && <p>{vitamin.foodSourcesIntro}</p>}
                {vitamin.foodSourcesNotesHtml && <Html html={vitamin.foodSourcesNotesHtml} />}
              </div>
            )}

            <div className={`${styles["vitamin-section"]} ${styles["daily-intake"]}`}>
              <h3>{t("recommendedDailyIntake")}</h3>
              <Html html={vitamin.rdiHtml} />
            </div>

            <div className={`${styles["vitamin-section"]} ${styles["tabs-and-symptoms-section"]}`}>
              <div className={styles["tabs-and-symptoms"]}>
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${styles["tab"]} ${activeTab === tab.id ? styles["active"] : ""}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <Html
                className={styles["tabs-and-symptoms-content"]}
                html={currentTab.html}
              />
            </div>
          </div>
        </div>
      </div>

      <nav className={styles["navigation"]}>
        {NAV_ITEMS.map(({ href, icon, ...rest }) => (
          <Link key={href} href={href} prefetch={false} className={styles["nav-link"]}>
            <Image
              src={`/main/${icon}.svg`}
              alt={"alt" in rest ? rest.alt : icon}
              width={48}
              height={48}
            />
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default VitaminInfoClient;