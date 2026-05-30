import { Suspense } from "react";
import ProductsClient from "./productsClient";

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsClient />
    </Suspense>
  );
}
