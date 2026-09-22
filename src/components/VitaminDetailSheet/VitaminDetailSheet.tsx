"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import styles from "./VitaminDetailSheet.module.css";

type DRIGroupKey = "Children" | "Male" | "Female";

// vitaminDRI.json was migrated from one flat string per age bracket (e.g.
// "1.2 mg") to a small object of DRI reference types per age bracket — this
// mirrors what lib/dailyValue.ts already needs to compute %UL for the food
// diary (getULMg reads .UL the same way). AMDR only appears on macros
// (protein/carbs/fats) and is a %-of-calories range, not an absolute amount.
type DRIValueKey = "AI" | "EAR" | "RDA" | "AMDR" | "UL";
type DRIValues = Partial<Record<DRIValueKey, string>>;

type DRIEntry = {
  slug: string;
  title: string;
  category: string;
  DRI: Partial<Record<DRIGroupKey, Record<string, DRIValues>>>;
  // Whether this nutrient's UL applies to total intake from any source
  // ("total") or was set specifically for synthetic/supplemental/fortified
  // intake ("supplement_only") — see the ulMode comment in
  // lib/dailyValue.ts. Most entries have neither field; only the ~16
  // nutrients with an actual nuance worth explaining do.
  ulMode?: "total" | "supplement_only";
  // Short, user-facing explanation of the nuance above, already split by
  // locale (unlike the rest of this file, which is locale-neutral amounts —
  // this one field is meant to be read directly, so it can't be).
  ulNote?: { en?: string; ru?: string };
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

// vitaminDRI.json uses these two strings interchangeably for "no UL defined
// for this age bracket" — neither is a real limit, so a row with either
// value shows no UL line at all rather than rendering "UL: -" or "UL: Not
// possible to establish".
const UL_PLACEHOLDER_VALUES = new Set(["-", "Not possible to establish"]);

function isRealUL(ul: string | undefined): ul is string {
  return !!ul && !UL_PLACEHOLDER_VALUES.has(ul);
}

// RDA is the number people actually target day-to-day. AI is the fallback
// used for age brackets (mostly infants) where there isn't enough evidence
// to set an RDA. AMDR (macros only) is a %-of-calories range rather than an
// absolute amount. EAR is intentionally never shown here — it's the average
// requirement that covers half a population, a technical intermediate value
// used to derive the RDA, not a number anyone should personally target.
function primaryDRIValue(values: DRIValues): string | null {
  return values.RDA ?? values.AI ?? values.AMDR ?? null;
}

const VitaminDetailSheet = ({ slug, basicInfo, onClose }: Props) => {
  const t = useTranslations("Vitamins.dri");
  const locale = useLocale();
  // vitaminDRI.json's ulNote is a plain {en, ru} object, not a
  // messages/*.json key — resolved directly against the active locale here,
  // same fallback order as lib/dailyValue.ts's getULNote.
  const noteLocale: "en" | "ru" = locale === "ru" ? "ru" : "en";

  const translateUnit = (unit: (typeof UNIT_KEYS)[number]) => {
    try {
      return t(`units.${unit}`);
    } catch {
      return unit;
    }
  };

  // Same graceful-fallback pattern as translateUnit — lets the new "UL"
  // label ship before messages/*.json has a Vitamins.dri.ulLabel key.
  const tSafe = (key: string, fallback: string) => {
    try {
      const value = t(key);
      return value === key ? fallback : value;
    } catch {
      return fallback;
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

            {/* Shown whenever this nutrient has a configured UL nuance,
                regardless of which age group the person falls into — the
                context (e.g. "this limit is about supplements, not food")
                is useful before it becomes relevant, not just after. */}
            {!loading && entry?.ulNote && (
              <p
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: 12,
                  color: "#9a9a9a",
                  textAlign: "center",
                  lineHeight: 1.35,
                  margin: "-4px 0 4px",
                  padding: "0 8px",
                }}
              >
                {entry.ulNote[noteLocale] ?? entry.ulNote.en ?? entry.ulNote.ru}
              </p>
            )}

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
                    {Object.entries(ages).map(([ageLabel, values]) => {
                      const ageId = AGE_LABEL_IDS[ageLabel];
                      const main = primaryDRIValue(values);
                      const ul = values.UL;
                      return (
                        <div className={styles.row} key={ageLabel}>
                          <span className={styles.rowName}>
                            {ageId ? t(`ages.${ageId}`) : ageLabel}
                          </span>
                          <span className={styles.rowValue}>
                            {main ? localizeDRIValue(main, translateUnit) : "—"}
                            {isRealUL(ul) && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 11,
                                  fontWeight: 400,
                                  opacity: 0.65,
                                }}
                              >
                                {tSafe("ulLabel", "UL")} {localizeDRIValue(ul, translateUnit)}
                              </span>
                            )}
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