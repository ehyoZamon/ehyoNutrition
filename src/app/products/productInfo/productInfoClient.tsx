"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import BottomNav from "@/components/bottomNav/BottomNav";
import ProductInfoModule, {
  ProductInfoData,
} from "@/components/product-info/productInfoModule";
import { loadProductsIndex } from "@/lib/productsIndex";
import { loadProductInfo } from "@/lib/productInfoShards";
import styles from "./productInfo.module.css";

type Status = "loading" | "ready" | "error";

// Проверяем, что по пути действительно лежит картинка. Через Image, а не fetch/HEAD:
// некоторые хостинги на 404 отдают index.html со статусом 200, а Image в этом случае
// вызовет onerror, потому что это не изображение.
const imageExists = (src: string) =>
  new Promise<boolean>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });

// Та же картинка, что показывается в ProductDetailSheet (basicInfo.image из каталога).
const getCatalogImage = async (
  locale: string,
  slug: string
): Promise<string | undefined> => {
  try {
    const index = await loadProductsIndex(locale);
    return index.bySlug.get(slug)?.image || undefined;
  } catch {
    return undefined;
  }
};

// Картинка из JSON, если файл существует; иначе картинка из каталога.
const resolveImage = async (
  jsonImage: string | undefined,
  locale: string,
  slug: string
): Promise<string | undefined> => {
  if (jsonImage && (await imageExists(jsonImage))) return jsonImage;
  return getCatalogImage(locale, slug);
};

const ProductInfoClient = () => {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // slug приходит из ?slug=..., useSearchParams уже возвращает декодированное значение
  const slug = searchParams.get("slug") ?? "";

  const [data, setData] = useState<ProductInfoData | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Страница владеет загрузкой данных: шард /data/<ru|en>/productInfo-packed/<N>.json
  useEffect(() => {
    let cancelled = false;
    const loc = locale === "ru" ? "ru" : "en";

    setData(null);

    if (!slug) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    (async () => {
      try {
        const json = await loadProductInfo(loc, slug);
        if (!json || typeof json.title !== "string") {
          throw new Error("Invalid productInfo JSON");
        }

        // Выбираем картинку до показа страницы, чтобы иконка не «прыгала»
        const image = await resolveImage(json.image, locale, slug);

        if (!cancelled) {
          setData({ ...json, image });
          setStatus("ready");
        }
      } catch (e) {
        console.error("Не удалось загрузить productInfo:", e);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, slug]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/products");
    }
  };

  const isRu = locale === "ru";

  return (
    <div className={styles["main-layout"]}>
      <div className={styles["content-container"]}>
        <button
          type="button"
          className={styles["back-btn"]}
          aria-label={isRu ? "Назад" : "Back"}
          onClick={handleBack}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M20 12H4M10 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {status === "ready" && data && <ProductInfoModule data={data} />}

        {status === "error" && (
          <p className={styles["status"]}>
            {isRu ? "Информация не найдена" : "Information not found"}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ProductInfoClient;