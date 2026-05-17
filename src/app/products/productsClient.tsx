"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import styles from "./products.module.css";

const products = [
  {
    id: 1,
    name: "Green Fresh Peas",
    category: "food/vegetables",
    calories: 134,
    image: "/products/peas.png",
    favorite: false,
  },
  {
    id: 2,
    name: "Egg",
    category: "food/eggs and dairy",
    calories: 72,
    image: "/products/egg.png",
    favorite: true,
  },
  {
    id: 3,
    name: "Arugula",
    category: "food/vegetables",
    calories: 5,
    image: "/products/arugula.png",
    favorite: false,
  },
  {
    id: 4,
    name: "Bok-choy",
    category: "food/vegetables",
    calories: 15,
    image: "/products/bok-choy.png",
    favorite: false,
  },
  {
    id: 5,
    name: "Apple",
    category: "food/fruits",
    calories: 20,
    image: "/products/apple.png",
    favorite: true,
  },
];

const ProductsClient = () => {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();

      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["search-container"]}>
        <Image
          src="/products/search.svg"
          alt="search-icon"
          width={16}
          height={16}
          className={styles["search-icon"]}
        />

        <input
          type="text"
          placeholder="Search products..."
          className={styles["search-input"]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles["content"]}>
        {filteredProducts.map((product) => (
          <Link href="/productinfo" className={styles["product"]} key={product.id}>
            <div className={styles["product-img-container"]}>
              <Image
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
              />
            </div>

            <div className={styles["product-details"]}>
              <div className={styles["product-name"]}>
                {product.name}
              </div>

              <div className={styles["product-category"]}>
                {product.category}
              </div>

              <div className={styles["product-calories"]}>
                Calories: {product.calories}
              </div>
            </div>

            <div className={styles["put-to-favorite"]}>
              <Image
                src={
                  product.favorite
                    ? "/products/heart-filled.svg"
                    : "/products/heart.svg"
                }
                alt="favorite"
                width={27}
                height={27}
              />
            </div>
          </Link>
        ))}

        {filteredProducts.length === 0 && (
          <div className={styles["empty-state"]}>
            <Image
                src="/nothing-found.svg"
                alt={"nothing-found"}
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

        <Link className={styles["nav-link"]} href="#">
          <Image
            src="/main/products-green.svg"
            alt="products"
            width={48}
            height={48}
          />
        </Link>

        <Link className={styles["nav-link"]} href="/vitamins">
          <Image
            src="/main/antioxidant.svg"
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

export default ProductsClient;