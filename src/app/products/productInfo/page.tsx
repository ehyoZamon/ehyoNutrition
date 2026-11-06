import { Suspense } from "react";
import ProductInfoClient from "./productInfoClient";

// Одна статическая страница: /products/productInfo?slug=<slug>
// useSearchParams() в клиентском компоненте требует Suspense при статическом экспорте.
export default function ProductInfoPage() {
  return (
    <Suspense fallback={null}>
      <ProductInfoClient />
    </Suspense>
  );
}