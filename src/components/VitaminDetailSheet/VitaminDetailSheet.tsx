"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import styles from "./VitaminDetailSheet.module.css";

type DRIGroupKey = "Children" | "Male" | "Female";

type DRIEntry = {
  slug: string;
  title: string;
  category: string;
  DRI: Partial<Record<DRIGroupKey, Record<string, string>>>;
};

type Props = {
  slug: string;
  /** Shown immediately, before vitaminDRI.json has loaded. */
  basicInfo: { name: string; image: string };
  onClose: () => void;
};

// vitaminDRI.json is ONE file, identical for every locale (only the group /
// age labels are translated, via the "Vitamins.dri" messages namespace) —
// so unlike ProductDetailSheet we don't need a per-locale, per-slug import,
// just a single dynamic import that webpack code-splits into its own chunk.
// It only fetches once; the browser module cache makes every later open of
// any vitamin instant.
async function loadVitaminDRI(): Promise<Record<string, DRIEntry>> {
  const mod = await import("@/data/en/vitaminDRI.json");
  return (mod.default ?? mod) as unknown as Record<string, DRIEntry>;
}

// Fixed display order — the JSON's own key casing ("Male"/"Female") is kept
// as the internal id; translation is what turns it into "Man" / "Woman".
const GROUP_ORDER: { key: DRIGroupKey; labelId: string }[] = [
  { key: "Children", labelId: "children" },
  { key: "Male", labelId: "man" },
  { key: "Female", labelId: "woman" },
];

// The age-bracket labels are the same fixed set across every vitamin/mineral
// in vitaminDRI.json, so a single lookup table covers all of them.
const AGE_LABEL_IDS: Record<string, string> = {
  "Infants (0-6 months)": "infants0to6",
  "Infants (7-12 months)": "infants7to12",
  "Young (1-3 years)": "young1to3",
  "Preschool (4-8 years)": "preschool4to8",
  "School-age (9-13 years)": "schoolAge9to13",
  "Teens (14-18 years)": "teens14to18",
  "Adults (19-30 years)": "adults19to30",
  "Middle-aged (31-50 years)": "middleAged31to50",
  "Older Adults (51-70 years)": "olderAdults51to70",
  "The Elderly (71+ years)": "elderly71plus",
};

// Unit abbreviations that appear inside vitaminDRI.json values (e.g. "0.40 mg",
// "10 mg/kg"). \b-bounded so "mg" inside "mg/kg" is matched on its own and a
// bare "g" never matches the "g" inside "mg"/"kg".
const UNIT_KEYS = ["mg", "mcg", "kg", "g"] as const;

const localizeDRIValue = (
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

const VitaminDetailSheet = ({ slug, basicInfo, onClose }: Props) => {
  const t = useTranslations("Vitamins.dri");

  const translateUnit = (unit: (typeof UNIT_KEYS)[number]) => {
    try {
      return t(`units.${unit}`);
    } catch {
      return unit;
    }
  };
  const [entry, setEntry] = useState<DRIEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEntry(null);
    setLoading(true);

    loadVitaminDRI()
      .then((all) => {
        if (!cancelled) setEntry(all[slug] ?? null);
      })
      .catch((err) => {
        console.error(`Failed to load DRI data for "${slug}"`, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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

  const groups = GROUP_ORDER.filter(({ key }) => entry?.DRI?.[key]);

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
                <span
                  className={styles.moleculeGlyph}
                  dangerouslySetInnerHTML={{ __html: basicInfo.image }}
                />
              </div>
            </div>

            <h2 className={styles.title}>{basicInfo.name}</h2>

            <div className={styles.sectionHeader}>{t("title")}</div>

            {loading && !entry && (
              <div className={styles.loadingRows}>
                {[...Array(6)].map((_, i) => (
                  <div className={styles.skeletonRow} key={i} />
                ))}
              </div>
            )}

            {!loading && groups.length === 0 && (
              <div className={styles.emptyState}>{t("noData")}</div>
            )}

            {groups.map(({ key, labelId }) => {
              const ages = entry?.DRI?.[key] ?? {};
              return (
                <div className={styles.group} key={key}>
                  <h3 className={styles.groupTitle}>{t(`groups.${labelId}`)}</h3>
                  <div className={styles.list}>
                    {Object.entries(ages).map(([ageLabel, value]) => {
                      const ageId = AGE_LABEL_IDS[ageLabel];
                      return (
                        <div className={styles.row} key={ageLabel}>
                          <span className={styles.rowName}>
                            {ageId ? t(`ages.${ageId}`) : ageLabel}
                          </span>
                          <span className={styles.rowValue}>
                            {localizeDRIValue(value, translateUnit)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            
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

export default VitaminDetailSheet;
