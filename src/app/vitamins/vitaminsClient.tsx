"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

import styles from "./vitamins.module.css";
import { loadFavorites, toggleVitaminFavorite } from "@/lib/favorites";

// Типизация структуры объекта витамина
type VitaminItem = {
  id: number;
  name: string;
  category: string;
  group: string;
  dailyValue: number | string;
  unit: string;
  benefit: string;
  image: string;
  favorite: boolean;
  link: string;
};

type Props = {
  vitaminsEn: VitaminItem[];
  vitaminsRu: VitaminItem[];
};

const VitaminsClient = ({ vitaminsEn, vitaminsRu }: Props) => {
  const t = useTranslations("Vitamins"); // Используем пространство имен из локализации интерфейса
  const locale = useLocale(); // Опознаем текущий язык ('ru' или 'en')

  // Автоматически подбираем базовый массив данных на основе выбранного языка
  const currentData = useMemo(() => {
    return locale === "ru" ? vitaminsRu : vitaminsEn;
  }, [locale, vitaminsEn, vitaminsRu]);

  const [search, setSearch] = useState("");
  const [vitamins, setVitamins] = useState<VitaminItem[]>(currentData);

  // Синхронизируем состояние витаминов, если язык изменился на лету
  useEffect(() => {
    const store = loadFavorites();
    setVitamins(
      currentData.map((vitamin) => ({
        ...vitamin,
        favorite: store.vitamins.includes(vitamin.id),
      }))
    );
  }, [currentData]);

  const toggleFavorite = (id: number) => {
    const store = toggleVitaminFavorite(id);
    setVitamins((current) =>
      current.map((vitamin) => ({
        ...vitamin,
        favorite: store.vitamins.includes(vitamin.id),
      }))
    );
  };

  /*
    SEARCH FILTER
  */
  const filteredVitamins = useMemo(() => {
    return vitamins.filter((vitamin) => {
      const query = search.toLowerCase();

      return (
        vitamin.name.toLowerCase().includes(query) ||
        vitamin.category.toLowerCase().includes(query) ||
        vitamin.benefit.toLowerCase().includes(query)
      );
    });
  }, [vitamins, search]);

  return (
    <div className={styles["main-layout"]}>
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
          placeholder={t("searchPlaceholder")} // Переводной плейсхолдер: например, "Поиск витаминов, минералов..."
          className={styles["search-input"]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles["content"]}>
        {filteredVitamins.map((vitamin) => (
          <div className={styles["vitamin"]} key={vitamin.id}>
            <Link
              href={vitamin.link}
              className={styles["vitamin-img-container"]}
            >
              <Image
                src="/vitamins/molecule.svg"
                alt="molecule"
                width={42}
                height={42}
                className={styles["molecule"]}
              />
              <span dangerouslySetInnerHTML={{ __html: vitamin.image }} />
            </Link>

            <Link
              href={vitamin.link}
              className={styles["vitamin-details"]}
            >
              <div className={styles["vitamin-name"]}>
                {vitamin.name}
              </div>

              <div className={styles["vitamin-daily-value"]}>
                {t("dailyValue")}: {vitamin.dailyValue} {vitamin.unit}
              </div>
              <div className={styles["vitamin-benefit"]}>
                {t("benefit")}: {vitamin.benefit}
              </div>
            </Link>

            <div
              className={styles["put-to-favorite"]}
              onClick={() => toggleFavorite(vitamin.id)}
            >
              <Image
                src={
                  vitamin.favorite
                    ? "/vitamins/heart-filled.svg"
                    : "/vitamins/heart.svg"
                }
                alt="favorite"
                width={24}
                height={24}
              />
            </div>
          </div>
        ))}

        {filteredVitamins.length === 0 && (
          <div className={styles["empty-state"]}>
            <Image
              src="/nothing-found.svg"
              alt="nothing-found"
              width={48}
              height={48}
            />
            {t("nothingFound")}
          </div>
        )}
      </div>

      <div className={styles["navigation"]}>
        <Link className={styles["nav-link"]} href="/main">
          <Image
            src="/main/home.svg"
            alt="home"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/products">
          <Image
            src="/main/products.svg"
            alt="vitamins"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="#">
          <Image
            src="/main/antioxidant-green.svg"
            alt="antioxidant"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/favorites">
          <Image
            src="/main/heart.svg"
            alt="heart"
            width={48}
            height={48}
          />
        </Link>
      </div>
    </div>
  );
};

export default VitaminsClient;