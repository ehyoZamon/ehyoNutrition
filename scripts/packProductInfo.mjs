// Пакует data-src/<loc>/productInfo/*.json в шарды public/data/<loc>/productInfo-packed/<N>.json
// Запускается автоматически перед build/dev (см. package.json).
import fs from "node:fs";
import path from "node:path";

const LOCALES = ["en", "ru"];

// ВАЖНО: SHARDS и shardOf должны совпадать с lib/productInfoShards.ts
const SHARDS = 1024;
const shardOf = (slug) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % SHARDS;
};

const started = Date.now();

for (const loc of LOCALES) {
  const src = path.join("public/data", loc, "productInfo");
  const out = path.join("public", "data", loc, "productInfo-packed");

  if (!fs.existsSync(src)) {
    console.error(`✖ Не найдена папка с исходниками: ${src}`);
    process.exit(1);
  }

  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const buckets = Array.from({ length: SHARDS }, () => []);
  let count = 0;
  let skipped = 0;

  for (const file of fs.readdirSync(src)) {
    if (!file.endsWith(".json")) continue;
    const slug = file.slice(0, -".json".length);

    try {
      // BOM (частый гость в файлах из Windows) ломает JSON.parse
      const text = fs.readFileSync(path.join(src, file), "utf8").replace(/^\uFEFF/, "");
      buckets[shardOf(slug)].push([slug, JSON.parse(text)]);
      count++;
    } catch (e) {
      skipped++;
      console.warn(`⚠ Пропущен ${loc}/${file}: ${e.message}`);
    }
  }

  let total = 0;
  let max = 0;
  buckets.forEach((entries, i) => {
    // fromEntries безопасен и для slug вроде "__proto__"
    const json = JSON.stringify(Object.fromEntries(entries)); // без пробелов
    fs.writeFileSync(path.join(out, `${i}.json`), json);
    total += json.length;
    max = Math.max(max, json.length);
  });

  console.log(
    `✔ ${loc}: ${count} продуктов → ${SHARDS} шардов, ` +
      `всего ${(total / 1024 / 1024).toFixed(1)} МБ, самый большой ${(max / 1024).toFixed(0)} КБ` +
      (skipped ? `, пропущено: ${skipped}` : "")
  );
}

console.log(`Готово за ${((Date.now() - started) / 1000).toFixed(1)} с`);
