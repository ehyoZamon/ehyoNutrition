"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./main.module.css";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FAVORITE_LINKS = [
  { key: "fruits" as const, href: "/products?category=fruits", className: "" },
  {
    key: "vegetables" as const,
    href: "/products?category=vegetables",
    className: styles.vegetables,
  },
  {
    key: "snack" as const,
    href: "/products?category=snack",
    className: styles.snack,
  },
] as const;

const FAVORITE_ICONS = {
  fruits: { src: "/main/strawberry.svg", width: 32, height: 48 },
  vegetables: { src: "/main/vegetables.svg", width: 50, height: 48 },
  snack: { src: "/main/snack.svg", width: 48, height: 48 },
} as const;

const MainClient = () => {
  const t = useTranslations("Main");

  return (
    <div className={styles["main-layout"]}>
      <LanguageSwitcher />

      <div className={styles.welcome}>
        <h2>{t("hello")}</h2>
        <p>{t("subtitle")}</p>
      </div>

      <div className={styles.content}>
        {/* ARTICLE */}

        <div className={styles.articles}>
          <div className={styles["article-content"]}>
            <div className={styles["article-label"]}>
              {t("articleLabel")}
            </div>

            <div className={styles["article-name"]}>
              {t("articleTitle")}
            </div>

            <Link
              href="/article/fast-food"
              className={styles["read-now-button"]}
            >
              {t("readNow")}
              <Image
                src="/main/arrow-right.svg"
                alt=""
                width={12}
                height={12}
              />
            </Link>
          </div>

          <div className={styles["article-banner"]}>
            <Image
              src="/main/burger.svg"
              alt=""
              width={111}
              height={120}
            />
          </div>
        </div>

        {/* VITAMINS */}

        <Link href="/vitamins" className={styles["explore-vitamins"]}>
          {t("exploreVitamins")}
          <Image
            src="/main/arrow-right-purple.svg"
            alt=""
            width={42}
            height={36}
          />
        </Link>

        {/* NUTRITION STATISTICS */}

        <section className={styles.statsSection}>
          <h3>{t("nutritionStatistics")}</h3>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span>60%</span>
              <p>{t("bodyWater")}</p>
            </div>

            <div className={styles.statCard}>
              <span>206</span>
              <p>{t("adultBones")}</p>
            </div>

            <div className={styles.statCard}>
              <span>600+</span>
              <p>{t("bodyMuscles")}</p>
            </div>

            <div className={styles.statCard}>
              <span>20%</span>
              <p>{t("brainEnergy")}</p>
            </div>
          </div>
        </section>

        {/* DAILY RECOMMENDATIONS */}

        <section className={styles.recommendations}>
          <h3>{t("dailyRecommendations")}</h3>

          <div className={styles.recommendationRow}>
            <span>💧 {t("water")}</span>
            <strong>2–3 L</strong>
          </div>

          <div className={styles.recommendationRow}>
            <span>🥩 {t("protein")}</span>
            <strong>0.8 g/kg</strong>
          </div>

          <div className={styles.recommendationRow}>
            <span>🥦 {t("fiber")}</span>
            <strong>25–38 g</strong>
          </div>

          <div className={styles.recommendationRow}>
            <span>🍊 Vitamin C</span>
            <strong>75–90 mg</strong>
          </div>

          <div className={styles.recommendationRow}>
            <span>☀️ Vitamin D</span>
            <strong>15–20 mcg</strong>
          </div>

          <div className={styles.recommendationRow}>
            <span>🦴 Calcium</span>
            <strong>1000 mg</strong>
          </div>
        </section>

        {/* DEFICIENCIES */}

        <section className={styles.deficiencies}>
          <h3>{t("commonDeficiencies")}</h3>

          <div className={styles.deficiencyCard}>
            <div>Vitamin D</div>
            <span>35%</span>
          </div>

          <div className={styles.deficiencyCard}>
            <div>Iron</div>
            <span>25%</span>
          </div>

          <div className={styles.deficiencyCard}>
            <div>Iodine</div>
            <span>15%</span>
          </div>

          <div className={styles.deficiencyCard}>
            <div>Vitamin B12</div>
            <span>6%</span>
          </div>
        </section>

        {/* HEALTHY PLATE */}

        <section className={styles.healthyPlate}>
          <h3>{t("healthyPlate")}</h3>

          <div className={styles.plateRow}>
            <span>🥦 {t("plateVegetables")}</span>
            <strong>50%</strong>
          </div>

          <div className={styles.progress}>
            <div
              className={styles.progressFill}
              style={{ width: "50%" }}
            />
          </div>

          <div className={styles.plateRow}>
            <span>🍗 {t("plateProtein")}</span>
            <strong>25%</strong>
          </div>

          <div className={styles.progress}>
            <div
              className={styles.progressFill}
              style={{ width: "25%" }}
            />
          </div>

          <div className={styles.plateRow}>
            <span>🍚 {t("plateCarbohydrates")}</span>
            <strong>25%</strong>
          </div>

          <div className={styles.progress}>
            <div
              className={styles.progressFill}
              style={{ width: "25%" }}
            />
          </div>
        </section>

        {/* FACTS */}

        <section className={styles.facts}>
          <h3>{t("didYouKnow")}</h3>

          <div className={styles.factCard}>{t("fact1")}</div>
          <div className={styles.factCard}>{t("fact2")}</div>
          <div className={styles.factCard}>{t("fact3")}</div>
          <div className={styles.factCard}>{t("fact4")}</div>
          <div className={styles.factCard}>{t("fact5")}</div>
        </section>

        {/* HABITS */}

        <section className={styles.habits}>
          <h3>{t("healthyHabits")}</h3>

          <ul>
            <li>{t("habit1")}</li>
            <li>{t("habit2")}</li>
            <li>{t("habit3")}</li>
            <li>{t("habit4")}</li>
            <li>{t("habit5")}</li>
            <li>{t("habit6")}</li>
            <li>{t("habit7")}</li>
          </ul>
        </section>

        {/* SOURCES */}

        <section className={styles.sources}>
          <h3>{t("topSources")}</h3>

          <div className={styles.sourceCard}>
            <strong>Vitamin C</strong>
            <p>{t("vitaminCSources")}</p>
          </div>

          <div className={styles.sourceCard}>
            <strong>Iron</strong>
            <p>{t("ironSources")}</p>
          </div>

          <div className={styles.sourceCard}>
            <strong>Magnesium</strong>
            <p>{t("magnesiumSources")}</p>
          </div>
        </section>

        {/* FAVORITES */}

        <div className={styles["choose-your-favorites"]}>
          <h3>{t("chooseFavorites")}</h3>

          <div className={styles["favorites-list"]}>
            {FAVORITE_LINKS.map(({ key, href, className }) => {
              const icon = FAVORITE_ICONS[key];

              return (
                <Link
                  key={key}
                  href={href}
                  className={`${styles.favorite} ${styles["favorite-link"]} ${className}`}
                >
                  <Image
                    src={icon.src}
                    alt=""
                    width={icon.width}
                    height={icon.height}
                  />

                  {t(key)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <nav className={styles.navigation} aria-label="Main navigation">
        <Link className={styles["nav-link"]} href="/main" aria-current="page">
          <Image
            src="/main/home-green.svg"
            alt="home"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/products">
          <Image
            src="/main/products.svg"
            alt="products"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/vitamins">
          <Image
            src="/main/antioxidant.svg"
            alt="vitamins"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/favorites">
          <Image
            src="/main/heart.svg"
            alt="favorites"
            width={48}
            height={48}
          />
        </Link>
      </nav>
    </div>
  );
};

export default MainClient;