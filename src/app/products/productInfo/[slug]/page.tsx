import fs from "node:fs";
import path from "node:path";
import ProductInfoClient from "./productInfoClient";

// Один статический маршрут на каждый файл public/data/{en,ru}/productInfo/<slug>.json
export function generateStaticParams() {
  const slugs = new Set<string>();

  for (const loc of ["en", "ru"]) {
    const dir = path.join(process.cwd(), "public", "data", loc, "productInfo");
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".json")) slugs.add(file.slice(0, -".json".length));
    }
  }

  return Array.from(slugs, (slug) => ({ slug }));
}

export default async function ProductInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductInfoClient slug={slug} />;
}
