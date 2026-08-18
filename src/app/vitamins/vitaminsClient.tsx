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
  organs?: string[];
};

type Props = {
  vitaminsEn: VitaminItem[];
  vitaminsRu: VitaminItem[];
};

// Список органов/систем организма для фильтра.
// Ключи (key) должны совпадать со значениями поля "organs" в vitamins.json
const ORGANS: { key: string; en: string; ru: string; icon: string }[] = [
  { key: "eyes", en: "Eyes", ru: "Глаза", icon: "👁️" },
  { key: "brain", en: "Brain & nervous system", ru: "Мозг и нервная система", icon: "🧠" },
  { key: "heart", en: "Heart & circulation", ru: "Сердце и кровообращение", icon: "❤️" },
  { key: "blood", en: "Blood", ru: "Кровь", icon: "🩸" },
  { key: "bones", en: "Bones & teeth", ru: "Кости и зубы", icon: "🦴" },
  { key: "joints", en: "Joints & cartilage", ru: "Суставы и хрящи", icon: "🦵" },
  { key: "muscles", en: "Muscles", ru: "Мышцы", icon: "💪" },
  { key: "skin", en: "Skin, hair & nails", ru: "Кожа, волосы, ногти", icon: "✨" },
  { key: "immune", en: "Immune system", ru: "Иммунитет", icon: "🛡️" },
  { key: "digestion", en: "Digestion & gut", ru: "Пищеварение", icon: "🍽️" },
  { key: "liver", en: "Liver", ru: "Печень", icon: "🫘" },
  { key: "thyroid", en: "Thyroid", ru: "Щитовидная железа", icon: "🦋" },
  { key: "metabolism", en: "Metabolism & energy", ru: "Метаболизм и энергия", icon: "⚡" },
];

const VitaminsClient = ({ vitaminsEn, vitaminsRu }: Props) => {
  const t = useTranslations("Vitamins"); // Используем пространство имен из локализации интерфейса
  const locale = useLocale(); // Опознаем текущий язык ('ru' или 'en')

  // Автоматически подбираем базовый массив данных на основе выбранного языка
  const currentData = useMemo(() => {
    return locale === "ru" ? vitaminsRu : vitaminsEn;
  }, [locale, vitaminsEn, vitaminsRu]);

  const [search, setSearch] = useState("");
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
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
    SEARCH + ORGAN FILTER
  */
  const filteredVitamins = useMemo(() => {
    return vitamins.filter((vitamin) => {
      const query = search.toLowerCase();

      const matchesSearch =
        vitamin.name.toLowerCase().includes(query) ||
        vitamin.category.toLowerCase().includes(query) ||
        vitamin.benefit.toLowerCase().includes(query);

      const matchesOrgan =
        !selectedOrgan || (vitamin.organs ?? []).includes(selectedOrgan);

      return matchesSearch && matchesOrgan;
    });
  }, [vitamins, search, selectedOrgan]);

  const toggleOrgan = (organKey: string) => {
    setSelectedOrgan((current) => (current === organKey ? null : organKey));
    setShowFilter(false);
  };

  const resetOrgan = () => {
    setSelectedOrgan(null);
    setShowFilter(false);
  };

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

        <Image
          src="/filter.svg"
          alt="filter"
          width={20}
          height={20}
          className={`${styles["filter-icon"]} ${
            selectedOrgan ? styles["filter-icon-active"] : ""
          }`}
          onClick={() => setShowFilter((prev) => !prev)}
        />
      </div>

      {showFilter && (
        <div className={styles["filter-bar"]}>
          <div className={styles["filter"]}>
            {ORGANS.map((organ) => (
              <button
                key={organ.key}
                type="button"
                className={`${styles["organ-chip"]} ${
                  selectedOrgan === organ.key ? styles["organ-chip-active"] : ""
                }`}
                onClick={() => toggleOrgan(organ.key)}
              >
                {locale === "ru" ? organ.ru : organ.en}
              </button>
            ))}
          </div>

          {selectedOrgan && (
            <button
              type="button"
              className={styles["filter-reset"]}
              onClick={resetOrgan}
            >
              {locale === "ru" ? "Сбросить" : "Reset"}
            </button>
          )}
        </div>
      )}

      <div className={styles["content"]}>
        {filteredVitamins.map((vitamin) => (
          <div className={styles["vitamin"]} key={vitamin.id}>
            <Link
              href={vitamin.link}
              prefetch={false}
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
              prefetch={false}
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
        <Link prefetch={false} className={styles["nav-link"]} href="/main">
          <Image
            src="/main/home.svg"
            alt="home"
            width={48}
            height={48}
          />
        </Link>

        <Link prefetch={false} className={styles["nav-link"]} href="/products">
          <Image
            src="/main/products.svg"
            alt="vitamins"
            width={48}
            height={48}
          />
        </Link>

        <Link prefetch={false} className={styles["nav-link"]} href="#">
          <Image
            src="/main/antioxidant-green.svg"
            alt="antioxidant"
            width={48}
            height={48}
          />
        </Link>

        <Link prefetch={false} className={styles["nav-link"]} href="/favorites">
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