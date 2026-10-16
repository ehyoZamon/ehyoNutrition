"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import styles from "../vitaminInfo.module.css";
import BottomNav from "@/components/bottomNav/BottomNav";
import type { VitaminDetail } from "@/types/details";

type Props = {
  vitaminEn: VitaminDetail;
  vitaminRu: VitaminDetail;
};

type Tab = "deficiency" | "overdose";

const Html = ({ html, className }: { html: string; className?: string }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

// "Vitamin C" / "Витамин B12" -> "C" / "B12"; "Calcium" -> "Ca"
const getBadgeText = (title: string) => {
  const stripped = title.replace(/^(vitamin|витамин)\s+/i, "").trim();
  if (!stripped) return "?";
  if (stripped.length <= 4) return stripped;
  return stripped.charAt(0).toUpperCase() + stripped.charAt(1).toLowerCase();
};

const VitaminInfoClient = ({ vitaminEn, vitaminRu }: Props) => {
  const t = useTranslations("VitaminInfo");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("deficiency");

  const vitamin = locale === "ru" ? vitaminRu : vitaminEn;
  const descriptionParts = vitamin.description.split("\n").filter(Boolean);
  const badgeText = useMemo(() => getBadgeText(vitamin.title), [vitamin.title]);

  const tabs: { id: Tab; label: string; html: string }[] = [
    { id: "deficiency", label: t("deficiencySymptoms"), html: vitamin.deficiencyHtml },
    { id: "overdose", label: t("overdose"), html: vitamin.overdoseHtml },
  ];
  const currentTab = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <div className={styles["main-layout"]}>
      {/* Header — same structure as foodDiary (header-row + page-title) */}
      <div className={styles["header"]}>
        <div className={styles["header-row"]}>
          <button
            type="button"
            onClick={() => router.push("/food-diary")}
            className={styles["backlink"]}
            aria-label="back"
          >
            <Image src="/back.svg" alt="" width={20} height={20} />
          </button>
          <h1 className={styles["page-title"]}>{vitamin.title}</h1>
        </div>
      </div>

      <div className={styles["content-container"]}>
        <div className={styles["content"]}>
          {/* Hero card instead of the banner photo */}
          
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

          <div className={`${styles["vitamin-section"]} ${styles["tabs-and-symptoms-section"]}`}>
            <div className={styles["tabs-and-symptoms"]}>
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles["tab"]} ${activeTab === tab.id ? styles["active"] : ""}`}
                  aria-pressed={activeTab === tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Html className={styles["tabs-and-symptoms-content"]} html={currentTab.html} />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default VitaminInfoClient;