/**
 * Splits a monolithic productDetails.json into:
 *   1) data/<locale>/productDetails/<slug>.json  — full data for ONE product
 *      (used only when the detail sheet for that product is opened)
 *   2) data/<locale>/productDetailsIndex.json    — lightweight map of
 *      { [slug]: { macroNutrients: [...], microNutrients: [...] } }
 *      with only the fields the list/filter/sort UI actually needs
 *      (id, slug, name, amount) — no descriptions, no intros, no bg colors.
 *
 * Run once per locale:
 *   node scripts/split-product-details.mjs ru
 *   node scripts/split-product-details.mjs en
 *
 * Assumes the source file lives at data/<locale>/productDetails.json and
 * writes output next to it. Adjust ROOT below if your data folder lives
 * somewhere else (e.g. "src/data").
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const ROOT = "src/data"; // <-- change to "src/data" if that's where your data lives
const locale = process.argv[2];

if (!locale) {
  console.error("Usage: node scripts/split-product-details.mjs <locale>");
  console.error("Example: node scripts/split-product-details.mjs ru");
  process.exit(1);
}

const sourcePath = path.join(ROOT, locale, "productDetails.json");
const outDir = path.join(ROOT, locale, "productDetails");
const indexPath = path.join(ROOT, locale, "productDetailsIndex.json");

if (!existsSync(sourcePath)) {
  console.error(`Source file not found: ${sourcePath}`);
  process.exit(1);
}

const raw = readFileSync(sourcePath, "utf-8");
const details = JSON.parse(raw);

mkdirSync(outDir, { recursive: true });

const stripNutrient = (n) => ({
  id: n.id,
  slug: n.slug,
  name: n.name,
  amount: n.amount,
});

const index = {};
let count = 0;

for (const [slug, product] of Object.entries(details)) {
  // 1) full per-product file
  const filePath = path.join(outDir, `${slug}.json`);
  writeFileSync(filePath, JSON.stringify(product, null, 2), "utf-8");

  // 2) lightweight index entry
  index[slug] = {
    macroNutrients: (product.macroNutrients || []).map(stripNutrient),
    microNutrients: (product.microNutrients || []).map(stripNutrient),
  };

  count++;
}

writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");

console.log(`Wrote ${count} files to ${outDir}/`);
console.log(`Wrote index to ${indexPath}`);
console.log(
  "\nNext steps:\n" +
    `  1. Delete or archive the old ${sourcePath} once you've verified the split output.\n` +
    "  2. Repeat for the other locale.\n" +
    "  3. Update imports in productsClient.tsx (see the provided version)."
);
