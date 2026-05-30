"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./article.module.css";

const PROS_KEYS = ["pros1", "pros2", "pros3"] as const;
const CONS_KEYS = ["cons1", "cons2", "cons3"] as const;

const ArticleClient = () => {
  const t = useTranslations("Article");

  return (
    <div className={styles["main-layout"]}>
      <div className={styles.header}>
        <Link href="/main" className={styles.backlink} aria-label={t("back")}>
          <Image src="/back.svg" alt="" width={20} height={20} />
        </Link>
        <span className={styles.label}>{t("label")}</span>
      </div>

      <div className={styles.banner}>
        <Image
          src="/main/burger.svg"
          alt=""
          width={111}
          height={120}
          priority
        />
      </div>

      <article className={styles.content}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.intro}>{t("intro")}</p>

        <section className={styles["pros-section"]}>
          <h2 className={styles["section-title"]}>{t("prosTitle")}</h2>
          <ul className={styles.list}>
            {PROS_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </section>

        <section className={styles["cons-section"]}>
          <h2 className={styles["section-title"]}>{t("consTitle")}</h2>
          <ul className={styles.list}>
            {CONS_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </section>

        <p className={styles.paragraph}>{t("outro")}</p>
      </article>
    </div>
  );
};

export default ArticleClient;
