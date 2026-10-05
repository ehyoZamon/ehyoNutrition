// scripts/build-top-products.mjs
//
// Строит public/data/topProducts.json — готовый рейтинг "Богатые источники":
// для каждого нутриента топ-N продуктов по содержанию на 100 г.
// Запуск: node scripts/build-top-products.mjs
//
// Рантайм (getTopProductsForNutrient) после этого читает один маленький файл
// вместо ~6000 productDetails/<slug>.json.

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DETAILS_DIR = path.join(ROOT, "public", "data", "en", "productDetails");
const OUT_FILE = path.join(ROOT, "public", "data", "topProducts.json");
const TOP_N = 20;

// Всё приводим к мг, чтобы ранжировать нутриенты в разных единицах одинаково.
// Должно совпадать с parseAmountToMg из lib/nutritionDRI.ts — если там
// поддерживаются другие единицы (например IU), добавь их сюда.
const UNIT_TO_MG = { g: 1000, mg: 1, mcg: 0.001, "µg": 0.001, "μg": 0.001, ug: 0.001 };

function parseMg(amount) {
  if (typeof amount !== "string") return null;
  const head = amount.split("/")[0].trim(); // "3.4 mg / 148% DV" -> "3.4 mg"
  const m = head.match(/^~?\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Zµμ]+)/);
  if (!m) return null;
  const factor = UNIT_TO_MG[m[2].toLowerCase()];
  if (factor === undefined) return null;
  const value = parseFloat(m[1].replace(",", "."));
  return Number.isNaN(value) ? null : value * factor;
}

const files = (await readdir(DETAILS_DIR)).filter((f) => f.endsWith(".json"));
const byNutrient = new Map();
let skipped = 0;

for (const file of files) {
  let detail;
  try {
    detail = JSON.parse(await readFile(path.join(DETAILS_DIR, file), "utf8"));
  } catch (err) {
    console.warn(`[top-products] skip ${file}: ${err.message}`);
    skipped++;
    continue;
  }

  const slug = file.slice(0, -".json".length);
  const nutrients = [...(detail.macroNutrients ?? []), ...(detail.microNutrients ?? [])];

  for (const n of nutrients) {
    if (!n.slug) continue;
    const mg = parseMg(n.amount);
    if (mg === null || mg <= 0) continue;

    let list = byNutrient.get(n.slug);
    if (!list) byNutrient.set(n.slug, (list = []));
    list.push({ slug, mg, amount: String(n.amount).split("/")[0].trim() });
  }
}

const out = {};
for (const [nutrientSlug, list] of byNutrient) {
  list.sort((a, b) => b.mg - a.mg);
  out[nutrientSlug] = list.slice(0, TOP_N).map(({ slug, amount }) => ({ slug, amount }));
}

await writeFile(OUT_FILE, JSON.stringify(out));
console.log(
  `[top-products] ${files.length - skipped} products, ${byNutrient.size} nutrients -> ${path.relative(ROOT, OUT_FILE)}`
);
