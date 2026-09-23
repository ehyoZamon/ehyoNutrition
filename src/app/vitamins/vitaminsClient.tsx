"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

import styles from "./vitamins.module.css";
import { loadFavorites, toggleVitaminFavorite } from "@/lib/favorites";
import VitaminDetailSheet from "@/components/VitaminDetailSheet/VitaminDetailSheet";

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
  organs?: string[];
};

type Props = {
  vitaminsEn: VitaminItem[];
  vitaminsRu: VitaminItem[];
};

// Slug из ссылки вида "/vitamininfo/vitamin-c" -> "vitamin-c".
// Именно под такими ключами хранятся данные в vitaminDRI.json.
const getSlug = (link: string) => link.substring(link.lastIndexOf("/") + 1);

const VitaminsClient = ({ vitaminsEn, vitaminsRu }: Props) => {
  const t = useTranslations("Vitamins"); // Используем пространство имен из локализации интерфейса
  const navBar=useTranslations("navBar");
  const locale = useLocale(); // Опознаем текущий язык ('ru' или 'en')

  // Автоматически подбираем базовый массив данных на основе выбранного языка
  const currentData = useMemo(() => {
    return locale === "ru" ? vitaminsRu : vitaminsEn;
  }, [locale, vitaminsEn, vitaminsRu]);

  const [search, setSearch] = useState("");
  const [vitamins, setVitamins] = useState<VitaminItem[]>(currentData);

  // slug of the vitamin whose DRI sheet is currently open, if any
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);

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

  const filteredVitamins = useMemo(() => {
    const query = search.toLowerCase();

    return vitamins.filter(
      (vitamin) =>
        vitamin.name.toLowerCase().includes(query) ||
        vitamin.category.toLowerCase().includes(query) ||
        vitamin.benefit.toLowerCase().includes(query)
    );
  }, [vitamins, search]);

  const openedVitamin = openedSlug
    ? vitamins.find((v) => getSlug(v.link) === openedSlug)
    : null;

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["search-container"]}>
        <div className={styles["search-bar"]}>
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
      </div>

      <div className={styles["content-container"]}>
        <div className={styles["content"]}>
          {filteredVitamins.map((vitamin) => (
            <div className={styles["vitamin"]} key={vitamin.id}>
              <div
                className={styles["vitamin-img-container"]}
                role="button"
                tabIndex={0}
                onClick={() => setOpenedSlug(getSlug(vitamin.link))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenedSlug(getSlug(vitamin.link));
                  }
                }}
              >
                <Image
                  src="/vitamins/molecule.svg"
                  alt="molecule"
                  width={42}
                  height={42}
                  className={styles["molecule"]}
                />
                <span dangerouslySetInnerHTML={{ __html: vitamin.image }} />
              </div>

              <div
                className={styles["vitamin-details"]}
                role="button"
                tabIndex={0}
                onClick={() => setOpenedSlug(getSlug(vitamin.link))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenedSlug(getSlug(vitamin.link));
                  }
                }}
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
              </div>

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
      </div>

      <div className={styles["navigation-container"]}>
        <div className={styles["navigation"]}>
          <Link className={styles["nav-link"]} href="/products" aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/products.svg" alt="products" width={48} height={48} />
            </div>
            {navBar("foods")}
          </Link>
          <Link className={`${styles["nav-link"]} ${styles["selected"]}`} href="/vitamins">
            <div className={styles["nav-bar"]}>
                <Image src="/main/antioxidant-green.svg" alt="antioxidant" width={48} height={48} />
            </div>
            {navBar("nutrients")}
          </Link>
          <Link  className={styles["nav-link"]} href="/food-diary" aria-current="page" >
            <div className={styles["nav-bar"]}>
              <Image src="/main/food-diary.svg" alt="food-diary" width={48} height={48} />
            </div>
            {navBar("foodDiary")}
          </Link>
          <Link  className={styles["nav-link"]} href="/favorites">
            <div className={styles["nav-bar"]}>
              <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
            </div>
            {navBar("favourites")}
          </Link>
          <Link  className={styles["nav-link"]} href="/settings">
            <div className={styles["nav-bar"]}>
              <Image src="/main/settings.svg" alt="heart" width={48} height={48} />
            </div>
            {navBar("settings")}
          </Link>
        </div>
      </div>

      {/* 🧾 Вкладка с дозировками (DRI) */}
      {openedVitamin && (
        <VitaminDetailSheet
          slug={getSlug(openedVitamin.link)}
          basicInfo={{ name: openedVitamin.name, image: openedVitamin.image }}
          onClose={() => setOpenedSlug(null)}
        />
      )}
    </div>
  );
};

export default VitaminsClient;
