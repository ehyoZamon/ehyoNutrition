"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import styles from "./products.module.css";

import {
  initDatabase,
  getProducts,
} from "@/db/database";

const ProductsClient = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    await initDatabase();

    const data = await getProducts();

    setProducts(data);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();

      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

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
          <div className={styles["product"]} key={product.id}>
            <Link
              href="/productinfo"
              className={styles["product-img-container"]}
            >
              <Image
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
              />
            </Link>

            <Link
              href="/productinfo"
              className={styles["product-details"]}
            >
              <div className={styles["product-name"]}>
                {product.name}
              </div>

              <div className={styles["product-category"]}>
                {product.category}
              </div>

              <div className={styles["product-calories"]}>
                Calories: {product.calories}
              </div>
            </Link>

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
          </div>
        ))}

        {filteredProducts.length === 0 && (
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