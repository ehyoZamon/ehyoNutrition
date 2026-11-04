#!/usr/bin/env node
/**
 * Переименование файлов productInfoZip: «название продукта» -> «slug из поля link».
 *
 *   "Milk, NFS.json"  ->  "milk-nfs.json"     (link: "/productinfo/milk-nfs")
 *
 * Для каждого продукта из products.json скрипт ищет файл с его названием в папках
 * en/productInfoZip и ru/productInfoZip и переименовывает его в <последняя часть link>.json.
 * Содержимое файлов не меняется.
 *
 * Положите файл в scripts/rename_product_files.mjs и запускайте из корня проекта:
 *
 *   node scripts/rename_product_files.mjs --dry-run    — только показать, что будет переименовано
 *   node scripts/rename_product_files.mjs              — переименовать
 *   node scripts/rename_product_files.mjs --verbose    — печатать каждое переименование
 *
 * Дополнительно (если файлы лежат в другом месте):
 *   --products=путь/к/products.json    --data-dir=путь/к/папке/data
 *
 * Зависимостей нет — нужен только Node 18+.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                              НАСТРОЙКИ                                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// Пути считаются от папки скрипта (scripts/), как в generate_products.mjs.
const PRODUCTS_SOURCE = "products.json";
const DATA_DIR = "../public/data";
const LANG_DIRS = ["en/productInfoZip", "ru/productInfoZip"];

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                      КОНЕЦ НАСТРОЕК — ДАЛЬШЕ НЕ ТРОГАТЬ                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const resolveHere = (p) => path.resolve(SCRIPT_DIR, p);

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const VERBOSE = args.includes("--verbose");
const argValue = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

/** Так же, как в generate_products.mjs: имя файла = название без запрещённых в Windows символов. */
const safeFileName = (text) =>
  text
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");

/** "/productinfo/milk-nfs" -> "milk-nfs" */
const slugFromLink = (link) =>
  String(link ?? "")
    .split(/[?#]/)[0]
    .split("/")
    .filter(Boolean)
    .pop() ?? "";

/** Возможные имена файла продукта (как их мог назвать generate_products.mjs). */
function sourceCandidates(product) {
  const name = String(product.name ?? product.title ?? "");
  const safe = safeFileName(name);
  const list = [safe, `${safe} (${product.id})`, name];
  return [...new Set(list.filter(Boolean))];
}

async function renameInDir(dir, products) {
  let entries;
  try {
    entries = await fs.readdir(dir);
  } catch {
    console.log(`⚠ Папка не найдена: ${dir}`);
    return null;
  }

  // Регистр не важен (Windows): ищем по имени в нижнем регистре, помним настоящее имя.
  const files = new Map(
    entries.filter((f) => f.toLowerCase().endsWith(".json")).map((f) => [f.toLowerCase(), f]),
  );

  const stat = { renamed: 0, already: 0, missing: 0, conflicts: [], noLink: [] };
  const targetsLower = new Set();
  let shown = 0;

  for (const product of products) {
    const slug = slugFromLink(product.link);
    if (!slug) {
      stat.noLink.push(String(product.name ?? product.id));
      continue;
    }

    const targetName = `${slug}.json`;
    const targetLower = targetName.toLowerCase();
    targetsLower.add(targetLower);

    // Ищем исходный файл по названию продукта.
    let sourceActual;
    for (const candidate of sourceCandidates(product)) {
      sourceActual = files.get(`${candidate}.json`.toLowerCase());
      if (sourceActual) break;
    }
    const targetActual = files.get(targetLower);

    if (!sourceActual) {
      if (targetActual) stat.already++; // уже переименован раньше
      else stat.missing++; // файла для этого продукта ещё нет
      continue;
    }

    if (sourceActual === targetName) {
      stat.already++;
      continue;
    }

    // Файл с таким именем уже есть — не затираем (кроме смены только регистра у того же файла).
    if (targetActual && targetActual.toLowerCase() !== sourceActual.toLowerCase()) {
      stat.conflicts.push(`${sourceActual} -> ${targetName} (уже существует)`);
      continue;
    }

    if (!DRY_RUN) {
      await fs.rename(path.join(dir, sourceActual), path.join(dir, targetName));
    }
    files.delete(sourceActual.toLowerCase());
    files.set(targetLower, targetName);
    stat.renamed++;

    if (VERBOSE || shown < 10) {
      console.log(`   ${sourceActual}  ->  ${targetName}`);
      shown++;
      if (!VERBOSE && shown === 10) console.log("   … (остальные скрыты, используйте --verbose)");
    }
  }

  // Файлы, которые не удалось сопоставить ни с одним продуктом.
  stat.unmatched = [...files.values()].filter((f) => !targetsLower.has(f.toLowerCase()));
  return stat;
}

async function main() {
  const productsPath = argValue("products") ? path.resolve(argValue("products")) : resolveHere(PRODUCTS_SOURCE);
  const dataDir = argValue("data-dir") ? path.resolve(argValue("data-dir")) : resolveHere(DATA_DIR);

  const raw = (await fs.readFile(productsPath, "utf-8")).replace(/^\uFEFF/, "");
  const data = JSON.parse(raw);
  const products = (Array.isArray(data) ? data : [data]).filter((p) => p && typeof p === "object");

  console.log(`Продуктов в ${path.basename(productsPath)}: ${products.length}`);
  if (DRY_RUN) console.log("Режим --dry-run: файлы НЕ переименовываются.");

  for (const langDir of LANG_DIRS) {
    const dir = path.join(dataDir, langDir);
    console.log(`\n${langDir}`);

    const stat = await renameInDir(dir, products);
    if (!stat) continue;

    console.log(
      `   ${DRY_RUN ? "будет переименовано" : "переименовано"}: ${stat.renamed} | ` +
        `уже с правильным именем: ${stat.already} | без файла: ${stat.missing}`,
    );

    if (stat.conflicts.length) {
      console.log(`   ⚠ Не тронуты (целевое имя занято): ${stat.conflicts.length}`);
      stat.conflicts.slice(0, 20).forEach((c) => console.log(`      ${c}`));
    }
    if (stat.noLink.length) {
      console.log(`   ⚠ Нет поля link у продуктов: ${stat.noLink.length} (первые: ${stat.noLink.slice(0, 5).join("; ")})`);
    }
    if (stat.unmatched.length) {
      console.log(`   ⚠ Файлы, не сопоставленные с продуктами: ${stat.unmatched.length}`);
      stat.unmatched.slice(0, 20).forEach((f) => console.log(`      ${f}`));
      if (stat.unmatched.length > 20) console.log("      …");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
