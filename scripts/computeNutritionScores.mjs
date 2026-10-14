#!/usr/bin/env node
/**
 * computeNutritionScores.mjs
 *
 * Для каждого продукта из products.json считает «плотность питательных веществ»,
 * переводит её в перцентиль (0-100) среди всего каталога и в звёзды (1-5) и пишет
 * два поля сразу после "link":
 *
 *   "link": "/productinfo/almonds",
 *   "nutritionPercentile": 87,
 *   "nutritionStars": 5,
 *
 * Запуск:
 *   node scripts/computeNutritionScores.mjs \
 *     --products data/en/products.json,data/ru/products.json \
 *     --details  data/productDetails/en \
 *     --dri      data/vitaminDRI.json
 *
 * Флаги:
 *   --products  один или несколько products.json через запятую
 *               (перцентиль считается один раз по уникальным slug'ам)
 *   --details   папка с <slug>.json (по умолчанию data/productDetails/en)
 *   --dri       путь к vitaminDRI.json (по умолчанию data/vitaminDRI.json)
 *   --dry-run   ничего не записывать, только вывести статистику
 *   --no-backup не создавать products.json.bak рядом с файлом
 *
 * Метод (в духе NRF 9.3 / Nutrient Rich Foods index), на 100 ккал:
 *   score = Σ min(%нормы полезного нутриента на 100 ккал, 100)
 *         − WEIGHT_SODIUM · min(%нормы натрия на 100 ккал, 100)
 * Нормы — RDA (или AI, если RDA нет) для взрослых 19-30 лет, среднее М/Ж.
 */

import fs from "node:fs/promises";
import path from "node:path";

// ---------------------------------------------------------------------------
// Настройки метода — всё, что можно крутить, собрано здесь
// ---------------------------------------------------------------------------

/** Нутриенты, за которые начисляются баллы (slug как в productDetails / vitaminDRI). */
const POSITIVE = [
  "protein",
  "fiber",
  "vitamin-a", "vitamin-c", "vitamin-d", "vitamin-e", "vitamin-k",
  "vitamin-b1", "vitamin-b2", "vitamin-b3", "vitamin-b5", "vitamin-b6",
  "vitamin-b7", "vitamin-b9", "vitamin-b12",
  "calcium", "phosphorus", "magnesium", "potassium", "iron", "zinc",
  "copper", "manganese", "iodine", "selenium", "choline",
  "alpha-linolenic-acid",
];

/** Норма для штрафуемого нутриента (мг). Натрий: 2300 мг — верхний ориентир CDRR. */
const SODIUM_LIMIT_MG = 2300;
const WEIGHT_SODIUM = 1;

/** Вклад одного нутриента не может превышать 100% нормы (иначе одна ацерола с
 *  витамином C на 1800% «перетянет» всё). */
const CAP_PERCENT = 100;

/** Нижняя граница калорийности при пересчёте «на 100 ккал» — защита от деления
 *  на ~0 для воды, чая, специй. */
const KCAL_FLOOR = 20;

/** Пороги звёзд по перцентилю. */
const STAR_THRESHOLDS = [
  [80, 5],
  [60, 4],
  [40, 3],
  [20, 2],
  [0, 1],
];

const SEXES = ["Male", "Female"];
const AGE_GROUP = "Adults (19-30 years)";

// ---------------------------------------------------------------------------
// Аргументы
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const out = {
    products: [],
    details: "data/productDetails/en",
    dri: "data/vitaminDRI.json",
    dryRun: false,
    backup: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--products") out.products.push(...argv[++i].split(",").filter(Boolean));
    else if (a === "--details") out.details = argv[++i];
    else if (a === "--dri") out.dri = argv[++i];
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--no-backup") out.backup = false;
    else throw new Error(`Неизвестный аргумент: ${a}`);
  }
  if (out.products.length === 0) out.products.push("data/en/products.json");
  return out;
}

// ---------------------------------------------------------------------------
// Работа с единицами
// ---------------------------------------------------------------------------
const AMOUNT_RE = /^\s*(-?\d[\d,]*\.?\d*)\s*([a-zA-Zµμ]+)/;

/** "1,000 mg" / "44 mcg DFE" / "0.90 mg" -> { value, unit } (unit в нижнем регистре) */
function parseAmount(str) {
  if (typeof str !== "string") return null;
  const m = str.match(AMOUNT_RE);
  if (!m) return null;
  const value = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;
  return { value, unit: m[2].toLowerCase() };
}

const UNIT_TO_MG = { g: 1000, mg: 1, mcg: 0.001, µg: 0.001, μg: 0.001, ug: 0.001 };

/** Переводит количество в миллиграммы. Вит. D в IU: 1 IU = 0.025 мкг. */
function toMg(amount, slug) {
  if (!amount) return null;
  if (amount.unit in UNIT_TO_MG) return amount.value * UNIT_TO_MG[amount.unit];
  if (amount.unit === "iu" && slug === "vitamin-d") return amount.value * 0.025 * 0.001;
  return null; // kcal, mg/kg и т.п. — не переводим
}

// ---------------------------------------------------------------------------
// Нормы из vitaminDRI.json
// ---------------------------------------------------------------------------
function buildReference(dri) {
  const ref = {};
  const missing = [];
  for (const slug of POSITIVE) {
    const node = dri[slug]?.DRI;
    const vals = [];
    for (const sex of SEXES) {
      const g = node?.[sex]?.[AGE_GROUP];
      if (!g) continue;
      const raw = g.RDA && g.RDA !== "-" ? g.RDA : g.AI;
      const mg = toMg(parseAmount(raw), slug);
      if (mg && mg > 0) vals.push(mg);
    }
    if (vals.length) ref[slug] = vals.reduce((a, b) => a + b, 0) / vals.length;
    else missing.push(slug);
  }
  return { ref, missing };
}

// ---------------------------------------------------------------------------
// Скоринг одного продукта
// ---------------------------------------------------------------------------
/** Собирает { kcal, mg: Map<slug, мг> } из файла productDetails. */
function extractNutrients(detail, stats) {
  const all = [...(detail.macroNutrients ?? []), ...(detail.microNutrients ?? [])];
  let kcal = null;
  const mg = new Map();

  for (const n of all) {
    const amount = parseAmount(n.amount);
    if (!amount) continue;
    if (!n.slug) {
      // калории: запись без slug
      if (amount.unit === "kcal") kcal = amount.value;
      continue;
    }
    if (mg.has(n.slug)) continue; // fiber встречается и в macro, и в micro
    const v = toMg(amount, n.slug);
    if (v === null) {
      if (POSITIVE.includes(n.slug) || n.slug === "sodium") {
        stats.badUnits.set(`${n.slug} (${amount.unit})`, (stats.badUnits.get(`${n.slug} (${amount.unit})`) ?? 0) + 1);
      }
      continue;
    }
    mg.set(n.slug, v);
  }
  return { kcal, mg };
}

function rawScore({ kcal, mg }, ref) {
  if (kcal === null) return null;
  const perKcal = 100 / Math.max(kcal, KCAL_FLOOR);

  let good = 0;
  for (const slug of Object.keys(ref)) {
    const amount = mg.get(slug) ?? 0;
    good += Math.min(((amount * perKcal) / ref[slug]) * 100, CAP_PERCENT);
  }
  const sodium = mg.get("sodium") ?? 0;
  const bad = Math.min(((sodium * perKcal) / SODIUM_LIMIT_MG) * 100, CAP_PERCENT);

  return good - WEIGHT_SODIUM * bad;
}

// ---------------------------------------------------------------------------
// Перцентиль и звёзды
// ---------------------------------------------------------------------------
/** Перцентиль со средним рангом для равных значений: (ниже + 0.5·равные) / N · 100 */
function toPercentiles(scoreBySlug) {
  const entries = [...scoreBySlug.entries()];
  const sorted = entries.map(([, s]) => s).sort((a, b) => a - b);
  const n = sorted.length;

  const lowerBound = (x) => {
    let lo = 0, hi = n;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < x) lo = mid + 1; else hi = mid; }
    return lo;
  };
  const upperBound = (x) => {
    let lo = 0, hi = n;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] <= x) lo = mid + 1; else hi = mid; }
    return lo;
  };

  const result = new Map();
  for (const [slug, s] of entries) {
    const below = lowerBound(s);
    const equal = upperBound(s) - below;
    result.set(slug, Math.round(((below + 0.5 * equal) / n) * 100));
  }
  return result;
}

const starsFor = (percentile) => STAR_THRESHOLDS.find(([min]) => percentile >= min)[1];

// ---------------------------------------------------------------------------
// I/O
// ---------------------------------------------------------------------------
const getSlug = (link) => link.substring(link.lastIndexOf("/") + 1);

async function readJson(file) {
  const text = (await fs.readFile(file, "utf8")).replace(/^\uFEFF/, "");
  return { text, data: JSON.parse(text) };
}

/** Вставляет новые поля сразу после "link", сохраняя остальной порядок ключей. */
function withScore(product, score) {
  const out = {};
  for (const [k, v] of Object.entries(product)) {
    if (k === "nutritionPercentile" || k === "nutritionStars") continue; // идемпотентность
    out[k] = v;
    if (k === "link" && score) {
      out.nutritionPercentile = score.percentile;
      out.nutritionStars = score.stars;
    }
  }
  return out;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));

  const { data: dri } = await readJson(args.dri);
  const { ref, missing: refMissing } = buildReference(dri);
  if (refMissing.length) {
    console.warn(`⚠ Нет нормы в DRI для: ${refMissing.join(", ")} — они не участвуют в расчёте`);
  }

  // Читаем все products.json
  const files = [];
  for (const f of args.products) {
    const { text, data } = await readJson(f);
    if (!Array.isArray(data)) throw new Error(`${f}: ожидался массив продуктов`);
    files.push({ file: f, text, products: data });
  }

  // Уникальные slug'и
  const slugs = new Set();
  for (const { products } of files) for (const p of products) if (p.link) slugs.add(getSlug(p.link));
  const slugList = [...slugs];
  console.log(`Продуктов (уникальных slug): ${slugList.length}`);

  // Считаем сырые баллы
  const stats = { badUnits: new Map() };
  const noFile = [];
  const noKcal = [];
  const raw = new Map();

  await mapLimit(slugList, 64, async (slug) => {
    let detail;
    try {
      detail = JSON.parse((await fs.readFile(path.join(args.details, `${slug}.json`), "utf8")).replace(/^\uFEFF/, ""));
    } catch (e) {
      noFile.push(slug);
      return;
    }
    const s = rawScore(extractNutrients(detail, stats), ref);
    if (s === null) noKcal.push(slug);
    else raw.set(slug, s);
  });

  if (raw.size === 0) throw new Error("Не удалось посчитать ни одного продукта — проверьте --details");

  const percentiles = toPercentiles(raw);
  const scores = new Map();
  for (const [slug, p] of percentiles) scores.set(slug, { percentile: p, stars: starsFor(p) });

  // Записываем
  for (const { file, text, products } of files) {
    const updated = products.map((p) => withScore(p, p.link ? scores.get(getSlug(p.link)) : null));
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    let out = JSON.stringify(updated, null, 2);
    if (eol === "\r\n") out = out.replace(/\n/g, "\r\n");
    if (/\r?\n$/.test(text)) out += eol;

    if (!args.dryRun) {
      if (args.backup) await fs.copyFile(file, `${file}.bak`);
      await fs.writeFile(file, out, "utf8");
    }
    console.log(`${args.dryRun ? "[dry-run] " : ""}${file}: обновлено ${updated.filter((p) => p.nutritionStars).length}/${updated.length}`);
  }

  // Отчёт
  const byStars = [0, 0, 0, 0, 0, 0];
  for (const { stars } of scores.values()) byStars[stars]++;
  console.log("\nРаспределение по звёздам:", [1, 2, 3, 4, 5].map((s) => `${s}★=${byStars[s]}`).join("  "));

  const ranked = [...raw.entries()].sort((a, b) => b[1] - a[1]);
  const fmt = ([slug, s]) => `  ${s.toFixed(1).padStart(7)}  ${slug}`;
  console.log("\nТоп-10:\n" + ranked.slice(0, 10).map(fmt).join("\n"));
  console.log("\nХудшие 10:\n" + ranked.slice(-10).map(fmt).join("\n"));

  if (noFile.length) {
    console.warn(`\n⚠ Нет файла деталей (${noFile.length}), поля не добавлены: ${noFile.slice(0, 10).join(", ")}${noFile.length > 10 ? ", …" : ""}`);
  }
  if (noKcal.length) {
    console.warn(`⚠ Нет калорий в файле (${noKcal.length}): ${noKcal.slice(0, 10).join(", ")}${noKcal.length > 10 ? ", …" : ""}`);
  }
  if (stats.badUnits.size) {
    console.warn("⚠ Нераспознанные единицы (нутриент пропущен):", Object.fromEntries(stats.badUnits));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
