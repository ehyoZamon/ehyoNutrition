"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import styles from "./vitamins.module.css";

import vitaminsData from "@/data/vitamins.json";

const VitaminsClient = () => {
  const [search, setSearch] = useState("");
  const [vitamins, setvitamins] = useState(vitaminsData);

  /*
    LOAD FAVORITES
  */

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");

    if (!savedFavorites) return;

    const favoriteIds = JSON.parse(savedFavorites);

    const updatedvitamins = vitaminsData.map((vitamin) => ({
      ...vitamin,
      favorite: favoriteIds.includes(vitamin.id),
    }));

    setvitamins(updatedvitamins);
  }, []);

  /*
    TOGGLE FAVORITE
  */

  const toggleFavorite = (id: number) => {
    const updatedvitamins = vitamins.map((vitamin) =>
      vitamin.id === id
        ? {
            ...vitamin,
            favorite: !vitamin.favorite,
          }
        : vitamin
    );

    setvitamins(updatedvitamins);

    /*
      SAVE TO LOCALSTORAGE
    */

    const favoriteIds = updatedvitamins
      .filter((vitamin) => vitamin.favorite)
      .map((vitamin) => vitamin.id);

    localStorage.setItem(
      "favorites",
      JSON.stringify(favoriteIds)
    );
  };

  /*
    SEARCH
  */

  const filteredvitamins = useMemo(() => {
    return vitamins.filter((vitamin) => {
      const query = search.toLowerCase();

      return (
        vitamin.name.toLowerCase().includes(query) ||
        vitamin.category.toLowerCase().includes(query)
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
          placeholder="Search vitamins, fat, minerals..."
          className={styles["search-input"]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles["content"]}>
        {filteredvitamins.map((vitamin) => (
          <div className={styles["vitamin"]} key={vitamin.id}>
            <Link
              href={vitamin.link}
              className={styles["vitamin-img-container"]}
            >
              <Image
                src="/vitamins/molecule.svg"
                alt={"molecule"}
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
                Daily value: {vitamin.dailyValue} {vitamin.unit}
              </div>
              <div className={styles["vitamin-benefit"]}>
                Benefit: {vitamin.benefit}
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

        {filteredvitamins.length === 0 && (
          <div className={styles["empty-state"]}>
            <Image
              src="/nothing-found.svg"
              alt="nothing-found"
              width={48}
              height={48}
            />
            Nothing found
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