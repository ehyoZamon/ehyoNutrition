"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import BottomNav from "@/components/bottomNav/BottomNav";
import ProductInfoModule, {
  ProductInfoData,
} from "@/components/product-info/productInfoModule";
import styles from "./productInfo.module.css";

type Props = { slug: string };
type Status = "loading" | "ready" | "error";

const ProductInfoClient = ({ slug }: Props) => {
  const locale = useLocale();
  const router = useRouter();

  const [data, setData] = useState<ProductInfoData | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Страница владеет загрузкой данных: /data/<ru|en>/productInfo/<slug>.json
  useEffect(() => {
    let cancelled = false;
    const loc = locale === "ru" ? "ru" : "en";

    setStatus("loading");
    setData(null);

    (async () => {
      try {
        const res = await fetch(
          `/data/${loc}/productInfo/${encodeURIComponent(slug)}.json`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as ProductInfoData;
        if (!json || typeof json.title !== "string") {
          throw new Error("Invalid productInfo JSON");
        }

        if (!cancelled) {
          setData(json);
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
