#!/usr/bin/env -S npx tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * usda-import.ts — импорт продуктов из большого JSON-файла USDA (FoodData Central).
 * Порт usda_import.py на TypeScript/Node (без внешних зависимостей, кроме tsx для запуска).
 *
 * Для каждой записи скрипт:
 *   1) создаёт файл продукта <slug>.json (формат как apples.json / almonds.json);
 *   2) добавляет запись {id, name, category, calories, image, favorite, link} в конец products.json.
 *
 * Имя файла продукта всегда совпадает с последней частью link
 * (link "/productinfo/soy-sauce"  ->  soy-sauce.json).
 *
 * id и slug нутриентов берутся из vitamin-dri.json: нутриент попадает в файл продукта
 * только если его slug есть в vitamin-dri.json.
 *
 * Поддерживаются форматы USDA:
 *   * {"SRLegacyFoods": [...]}, {"FoundationFoods": [...]}, {"SurveyFoods": [...]}
 *   * простой массив [...]
 *   * фрагмент: записи {...},{...},{...} без обёртки
 * Файл читается потоком, в память целиком не загружается.
 *
 * Запуск:
 *   npx tsx scripts/usda-import.ts                      # задаст вопросы (файлы/папки)
 *   npx tsx scripts/usda-import.ts --review             # подтверждать каждый продукт вручную
 *   npx tsx scripts/usda-import.ts --source big.json --dri vitamin-dri.json \
 *          --products products.json --out ./productinfo --yes --limit 100
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as readline from "node:readline";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";

type Rec = Record<string, any>;

// ----------------------------------------------------------------------------
// Настройки формата
// ----------------------------------------------------------------------------
const MACRO_TITLE = "Macro Nutrients (per 100g)";
const MICRO_TITLE = "Micro Nutrients (per 100g)";
const imageFor = (category: string): string => `/products/${category}.png`; // image = категория + .png
const linkFor = (slug: string): string => `/productinfo/${slug}`;
const FLUSH_EVERY = 50; // как часто дописывать products.json
const SCRIPT_DIR = process.argv[1] ? path.dirname(path.resolve(process.argv[1])) : process.cwd();
const SETTINGS_FILE = path.join(SCRIPT_DIR, "usda_import_settings.json");
const CATEGORY_MAP_FILE = path.join(SCRIPT_DIR, "usda_category_map.json");
const MAX_RECORD_BYTES = 64 << 20;

// ----------------------------------------------------------------------------
// Нутриенты: [slug, name, [id нутриентов USDA по приоритету], единица]
// Кандидат-пара [a, b] означает СУММУ нутриентов (например EPA + DHA).
// Порядок списка = порядок в файле продукта.
// ----------------------------------------------------------------------------
type Cand = number | [number, number];
type NutrientDef = [slug: string, name: string, candidates: Cand[], unit: string];

const MACRO: NutrientDef[] = [
  ["protein", "Protein", [1003], "g"],
  ["carbohydrates", "Carbohydrates", [1005], "g"],
  ["fats", "Fats", [1004], "g"],
  ["fiber", "Fiber", [1079], "g"],
];

const MICRO: NutrientDef[] = [
  ["vitamin-c", "Vitamin C", [1162], "mg"],
  ["vitamin-d", "Vitamin D", [1114], "mcg"],
  ["vitamin-a", "Vitamin A", [1106], "mcg RAE"],
  ["vitamin-e", "Vitamin E", [1109], "mg"],
  ["vitamin-k", "Vitamin K", [1185], "mcg"],
  ["vitamin-b1", "Vitamin B1", [1165], "mg"],
  ["vitamin-b2", "Vitamin B2", [1166], "mg"],
  ["vitamin-b3", "Vitamin B3", [1167], "mg"],
  ["vitamin-b5", "Vitamin B5", [1170], "mg"],
  ["vitamin-b6", "Vitamin B6", [1175], "mg"],
  ["vitamin-b7", "Vitamin B7", [1176], "mcg"],
  ["vitamin-b9", "Vitamin B9", [1190], "mcg DFE"],
  ["vitamin-b12", "Vitamin B12", [1178], "mcg"],
  ["histidine", "Histidine", [1221], "g"],
  ["isoleucine", "Isoleucine", [1212], "g"],
  ["leucine", "Leucine", [1213], "g"],
  ["lysine", "Lysine", [1214], "g"],
  ["methionine", "Methionine", [1215], "g"],
  ["phenylalanine", "Phenylalanine", [1217], "g"],
  ["threonine", "Threonine", [1211], "g"],
  ["tryptophan", "Tryptophan", [1210], "g"],
  ["valine", "Valine", [1219], "g"],
  ["alpha-linolenic-acid", "Alpha-Linolenic Acid", [1404, 1270], "g"],
  ["epa-dha", "EPA & DHA", [[1278, 1272]], "g"],
  ["calcium", "Calcium", [1087], "mg"],
  ["phosphorus", "Phosphorus", [1091], "mg"],
  ["magnesium", "Magnesium", [1090], "mg"],
  ["sodium", "Sodium", [1093], "mg"],
  ["potassium", "Potassium", [1092], "mg"],
  ["chloride", "Chloride", [1088], "mg"],
  ["sulfur", "Sulfur", [1094], "mg"],
  ["iron", "Iron", [1089], "mg"],
  ["zinc", "Zinc", [1095], "mg"],
  ["copper", "Copper", [1098], "mg"],
  ["manganese", "Manganese", [1101], "mg"],
  ["iodine", "Iodine", [1100], "mcg"],
  ["selenium", "Selenium", [1103], "mcg"],
  ["chromium", "Chromium", [1096], "mcg"],
  ["molybdenum", "Molybdenum", [1102], "mcg"],
  ["fluoride", "Fluoride", [1099], "mcg"],
  ["lutein", "Lutein", [1123], "mcg"], // USDA: Lutein + zeaxanthin
  ["beta-carotene", "Beta-carotene", [1107], "mcg"],
  ["lycopene", "Lycopene", [1122], "mcg"],
  ["choline", "Choline", [1180], "mg"],
  ["betaine", "Betaine", [1198], "mg"],
  ["phytosterols", "Phytosterols", [1283], "mg"],
  ["omega-6", "Omega-6 fatty acids", [1269, 1316], "g"], // линолевая 18:2
  ["omega-9", "Omega-9 fatty acids", [1268, 1315], "g"], // олеиновая 18:1
  ["arginine", "Arginine", [1220], "g"],
  ["glycine", "Glycine", [1225], "g"],
  ["tyrosine", "Tyrosine", [1218], "g"],
  ["cysteine", "Cysteine", [1216], "g"], // USDA: Cystine
];

// ----------------------------------------------------------------------------
// Категории USDA -> категории products.json
// ----------------------------------------------------------------------------
const CATEGORY_MAP: Record<string, string> = {
  "dairy and egg products": "food/eggs and dairy",
  "spices and herbs": "food/herbs and spices",
  "fats and oils": "food/oils and fats",
  "poultry products": "food/meat",
  "pork products": "food/meat",
  "beef products": "food/meat",
  "lamb, veal, and game products": "food/meat",
  "sausages and luncheon meats": "food/meat",
  "finfish and shellfish products": "food/seafood",
  "fruits and fruit juices": "food/fruits",
  "vegetables and vegetable products": "food/vegetables",
  "nut and seed products": "food/seeds and nuts",
  "legumes and legume products": "food/legumes",
  "cereal grains and pasta": "food/grains and cereals",
  "breakfast cereals": "food/grains and cereals",
  "baked products": "food/grains and cereals",
  beverages: "food/beverages",
  sweets: "food/snacks and sweets",
  snacks: "food/snacks and sweets",
};

// Запасные правила по ключевым словам (для WWEIA-категорий FNDDS и т.п.)
const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/\b(milk|dairy|cheese|yogurt|cream|eggs?|kefir|butter)\b/, "food/eggs and dairy"],
  [/\b(fish|shellfish|seafood|shrimp|crab|salmon|tuna)\b/, "food/seafood"],
  [/\b(beef|pork|poultry|chicken|turkey|lamb|veal|sausage|meats?|ham|bacon)\b/, "food/meat"],
  [/\b(beans?|legumes?|lentils?|peas|soy|tofu)\b/, "food/legumes"],
  [/\b(nuts?|seeds?)\b/, "food/seeds and nuts"],
  [/\bfruits?\b|\b(berries|apples?|bananas?|citrus|melons?)\b/, "food/fruits"],
  [/\b(vegetables?|potatoes?|tomatoes?|lettuce|greens)\b/, "food/vegetables"],
  [/\b(rice|pasta|bread|cereals?|grains?|oats?|noodles?|flour)\b/, "food/grains and cereals"],
  [/\boils?\b|\bfats and oils\b/, "food/oils and fats"],
  [/\b(spices?|herbs?|condiments?|sauces?|seasonings?)\b/, "food/herbs and spices"],
  [/\b(beverages?|juice|coffee|tea|soda|drinks?|water)\b/, "food/beverages"],
  [/\b(candy|sweets?|snacks?|cookies?|cakes?|desserts?|chips|chocolate)\b/, "food/snacks and sweets"],
];

// ----------------------------------------------------------------------------
// Единицы и числа
// ----------------------------------------------------------------------------
const UG_PER = new Map<string, number>([
  ["g", 1e6],
  ["mg", 1e3],
  ["ug", 1.0],
]);

function normUnit(u: unknown): string | null {
  if (!u) return null;
  const s = String(u).trim().toLowerCase().replace(/µ/g, "u").replace(/μ/g, "u");
  return s === "mcg" ? "ug" : s;
}

function convert(amount: number, from: string | null, to: string | null): number | null {
  if (from === to) return amount;
  if (from !== null && to !== null && UG_PER.has(from) && UG_PER.has(to)) {
    return (amount * UG_PER.get(from)!) / UG_PER.get(to)!;
  }
  return null;
}

/** Python round(x) для int: half-to-even. */
function roundHalfEvenInt(x: number): number {
  const f = Math.floor(x);
  if (x - f === 0.5) return f % 2 === 0 ? f : f + 1;
  return Math.round(x);
}

/** Аналог f"{round(x, d):.{d}f}" в Python: точные «ничьи» округляются к чётному. */
function toFixedHalfEven(x: number, decimals: number): string {
  const long = Math.abs(x).toFixed(Math.min(100, decimals + 30)); // точное десятичное разложение
  const dot = long.indexOf(".");
  if (dot >= 0 && /^50*$/.test(long.slice(dot + 1 + decimals))) {
    const keep = decimals === 0 ? long.slice(0, dot) : long.slice(0, dot + 1 + decimals);
    if (Number(keep[keep.length - 1]) % 2 === 0) return (x < 0 ? "-" : "") + keep;
  }
  return x.toFixed(decimals);
}

/** До 4 значащих цифр, без экспоненты и хвостовых нулей. */
function fmtNum(x: number): string {
  if (x === 0) return "0";
  if (Math.abs(x) >= 1000) return String(roundHalfEvenInt(x));
  const exp = Math.floor(Math.log10(Math.abs(x)));
  const decimals = Math.max(0, 3 - exp);
  let s = toFixedHalfEven(x, decimals);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s || "0";
}

function slugify(text: string): string {
  let t = text.replace(/'/g, "").replace(/’/g, "");
  t = t.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  t = t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return t.slice(0, 90).replace(/^-+|-+$/g, "");
}

/** 'food/seeds and nuts' -> 'seeds-and-nuts' */
function categorySlug(category: string): string {
  const parts = category.split("/");
  return slugify(parts[parts.length - 1]) || "other";
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
}

// ----------------------------------------------------------------------------
// Потоковое чтение большого JSON
// ----------------------------------------------------------------------------
/** Последовательно отдаёт записи-объекты из файла USDA, не загружая файл целиком. */
async function* iterRecords(filePath: string): AsyncGenerator<Rec> {
  const stream = fs.createReadStream(filePath, { encoding: "utf8", highWaterMark: 1 << 22 });
  const wrapperRe = /^\{\s*"[^"]+"\s*:\s*\[/;

  let headDone = false;
  let headBuf = "";
  let depth = 0;
  let inStr = false;
  let esc = false;
  let parts: string[] = [];
  let partsLen = 0;

  // Разбор текста: границы записей ищем счётом скобок вне строк, каждую запись парсим JSON.parse.
  function* feed(text: string): Generator<Rec> {
    let segStart = 0;
    const n = text.length;
    for (let i = 0; i < n; i++) {
      const c = text.charCodeAt(i);
      if (depth === 0) {
        // пробелы, запятая и закрывающие ] } между записями пропускаются
        if (c === 32 || c === 9 || c === 10 || c === 13 || c === 44 || c === 93 || c === 125) continue;
        if (c === 123) {
          depth = 1;
          inStr = false;
          esc = false;
          segStart = i;
          continue;
        }
        throw new Error(`Неожиданный символ ${JSON.stringify(text[i])} при чтении ${filePath}`);
      }
      if (inStr) {
        if (esc) esc = false;
        else if (c === 92) esc = true;
        else if (c === 34) inStr = false;
        continue;
      }
      if (c === 34) inStr = true;
      else if (c === 123) depth++;
      else if (c === 125) {
        depth--;
        if (depth === 0) {
          parts.push(text.slice(segStart, i + 1));
          const json = parts.join("");
          parts = [];
          partsLen = 0;
          let obj: Rec;
          try {
            obj = JSON.parse(json);
          } catch (e) {
            throw new Error(`Ошибка разбора JSON в ${filePath}: ${(e as Error).message}`);
          }
          yield obj;
        }
      }
    }
    if (depth > 0) {
      const tail = text.slice(segStart);
      parts.push(tail);
      partsLen += tail.length;
      if (partsLen > MAX_RECORD_BYTES) throw new Error(`Ошибка разбора JSON в ${filePath}: запись слишком большая`);
    }
  }

  // Определяем структуру файла по началу, затем передаём остаток в feed().
  function* start(): Generator<Rec> {
    let text = headBuf.replace(/^\uFEFF/, "").replace(/^[ \t\r\n]+/, "");
    headDone = true;
    if (text === "") return;
    if (text[0] === "[") text = text.slice(1);
    else if (text[0] === "{") {
      const m = wrapperRe.exec(text); // {"SurveyFoods": [ ... ]}
      if (m) text = text.slice(m[0].length);
    }
    yield* feed(text);
  }

  for await (const chunk of stream) {
    if (!headDone) {
      headBuf += chunk as string;
      if (headBuf.replace(/^\s+/, "").length < 512) continue;
      yield* start();
    } else {
      yield* feed(chunk as string);
    }
  }
  if (!headDone) yield* start();
  if (depth > 0) throw new Error(`Ошибка разбора JSON в ${filePath}: неожиданный конец файла`);
}

// ----------------------------------------------------------------------------
// Извлечение данных
// ----------------------------------------------------------------------------
type NutrientTable = Map<number, [amount: number, unit: string | null]>;

function nutrientTable(rec: Rec): NutrientTable {
  const table: NutrientTable = new Map();
  const list: unknown = rec.foodNutrients;
  if (!Array.isArray(list)) return table;
  for (const fn of list) {
    if (!fn || typeof fn !== "object") continue;
    const n: Rec = fn.nutrient && typeof fn.nutrient === "object" ? fn.nutrient : {};
    if (n.id == null || fn.amount == null) continue;
    const id = Math.trunc(toNum(n.id));
    const amt = toNum(fn.amount);
    if (!Number.isFinite(id) || Number.isNaN(amt)) continue;
    if (!table.has(id)) table.set(id, [amt, normUnit(n.unitName)]);
  }
  return table;
}

function getKcal(table: NutrientTable): number | null {
  for (const nid of [1008, 2047, 2048]) {
    const e = table.get(nid);
    if (e && e[1] === "kcal") return e[0];
  }
  const kj = table.get(1062);
  if (kj && kj[1] === "kj") return kj[0] / 4.184;
  return null;
}

function getAmount(table: NutrientTable, candidates: Cand[], targetUnit: string | null): number | null {
  for (const cand of candidates) {
    const ids = Array.isArray(cand) ? cand : [cand];
    let total: number | null = null;
    for (const nid of ids) {
      const e = table.get(nid);
      if (e) {
        const v = convert(e[0], e[1], targetUnit);
        if (v !== null) total = (total ?? 0) + v;
      }
    }
    if (total !== null) return total;
  }
  return null;
}

function usdaCategory(rec: Rec): string {
  const fc = rec.foodCategory;
  if (fc && typeof fc === "object" && !Array.isArray(fc) && fc.description) return String(fc.description).trim();
  if (typeof fc === "string" && fc.trim()) return fc.trim();
  const w = rec.wweiaFoodCategory;
  if (w && typeof w === "object" && w.wweiaFoodCategoryDescription) {
    return String(w.wweiaFoodCategoryDescription).trim();
  }
  if (rec.brandedFoodCategory) return String(rec.brandedFoodCategory).trim();
  return "";
}

type BuildResult = { ok: true; product: Rec; kcal: number } | { ok: false; reason: string };

function buildProduct(rec: Rec, driSlugs: Set<string>, name: string, slug: string, category: string): BuildResult {
  const table = nutrientTable(rec);
  const kcalRaw = getKcal(table);
  if (kcalRaw === null) return { ok: false, reason: "нет данных о калориях" };
  const kcal = roundHalfEvenInt(kcalRaw);

  const collect = (defs: NutrientDef[]): Rec[] => {
    const out: Rec[] = [];
    for (const [nslug, nname, cands, unit] of defs) {
      if (!driSlugs.has(nslug)) continue;
      const v = getAmount(table, cands, normUnit(unit.split(/\s+/)[0]));
      if (v !== null) out.push({ id: nslug, name: nname, slug: nslug, amount: `${fmtNum(v)} ${unit}` });
    }
    return out;
  };

  const macro: Rec[] = [{ id: "calories", name: "Calories", slug: "", amount: `${kcal} kcal` }, ...collect(MACRO)];
  const micro = collect(MICRO);

  return {
    ok: true,
    kcal,
    product: {
      slug,
      name,
      category,
      macroTitle: MACRO_TITLE,
      macroNutrients: macro,
      microTitle: MICRO_TITLE,
      microNutrients: micro,
    },
  };
}

// ----------------------------------------------------------------------------
// Ввод-вывод, диалоги
// ----------------------------------------------------------------------------
function loadJsonFile<T = any>(p: string, def?: T): T | undefined {
  let text: string;
  try {
    text = fs.readFileSync(p, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return def;
    throw e;
  }
  return JSON.parse(text.replace(/^\uFEFF/, "")) as T;
}

function writeJson(p: string, data: unknown, trailingNewline = true): void {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + (trailingNewline ? "\n" : ""), "utf8");
}

function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function expandUser(p: string): string {
  return p === "~" || p.startsWith("~/") || p.startsWith("~\\") ? path.join(os.homedir(), p.slice(1)) : p;
}

// --- интерактивный ввод (очередь строк: работает и в терминале, и с pipe) ---
class Interrupted extends Error {}
let interrupted = false;
let rl: readline.Interface | null = null;
let rlClosed = false;
const lineQueue: string[] = [];
const waiters: Array<(line: string | null) => void> = [];

function requestInterrupt(): void {
  if (interrupted) process.exit(130); // второй Ctrl+C — выход сразу
  interrupted = true;
  while (waiters.length) waiters.shift()!(null);
}

function getRl(): readline.Interface {
  if (rl) return rl;
  const r = readline.createInterface({ input: process.stdin, output: process.stdout });
  r.on("line", (line) => {
    const w = waiters.shift();
    if (w) w(line);
    else lineQueue.push(line);
  });
  r.on("close", () => {
    rlClosed = true;
    while (waiters.length) waiters.shift()!(null);
  });
  r.on("SIGINT", requestInterrupt);
  rl = r;
  return r;
}

function closeRl(): void {
  if (rl && !rlClosed) rl.close();
}

async function ask(prompt: string): Promise<string> {
  if (interrupted) throw new Interrupted();
  const r = getRl();
  const nl = prompt.lastIndexOf("\n");
  if (nl >= 0) {
    process.stdout.write(prompt.slice(0, nl + 1));
    prompt = prompt.slice(nl + 1);
  }
  r.setPrompt(prompt);
  r.prompt();
  let line: string | null;
  if (lineQueue.length) line = lineQueue.shift()!;
  else if (rlClosed) line = null;
  else line = await new Promise<string | null>((resolve) => waiters.push(resolve));
  if (line === null || interrupted) throw new Interrupted();
  return line;
}

/** Окно выбора файла/папки (только Windows, через PowerShell). */
function dialog(kind: "file" | "dir", title: string): string {
  if (process.platform !== "win32") {
    console.log("  (окно выбора доступно только в Windows)");
    return "";
  }
  try {
    const t = title.replace(/'/g, "''");
    const owner = "(New-Object System.Windows.Forms.Form -Property @{TopMost=$true})";
    const body =
      kind === "dir"
        ? `$d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = '${t}'; ` +
          `if ($d.ShowDialog(${owner}) -eq 'OK') { $d.SelectedPath }`
        : `$d = New-Object System.Windows.Forms.OpenFileDialog; $d.Title = '${t}'; ` +
          `$d.Filter = 'JSON (*.json)|*.json|All files (*.*)|*.*'; ` +
          `if ($d.ShowDialog(${owner}) -eq 'OK') { $d.FileName }`;
    const script = `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName System.Windows.Forms; ${body}`;
    const out = execFileSync("powershell", ["-NoProfile", "-STA", "-Command", script], { encoding: "utf8" });
    return out.trim();
  } catch (e) {
    console.log(`  (диалог недоступен: ${(e as Error).message})`);
    return "";
  }
}

/** kind: 'file' | 'dir'. Ввод '?' открывает окно выбора. */
async function askPath(label: string, def: string | undefined, kind: "file" | "dir", mustExist = true): Promise<string> {
  for (;;) {
    const hint = def ? ` [${def}]` : "";
    let raw = (await ask(`${label}${hint}\n  путь (или ? для окна выбора): `))
      .trim()
      .replace(/^"+|"+$/g, "")
      .replace(/^'+|'+$/g, "");
    if (raw === "?") raw = dialog(kind, label);
    if (!raw) raw = def || "";
    raw = expandUser(raw);
    if (!raw) {
      console.log("  Нужно указать путь.");
      continue;
    }
    if (kind === "dir") {
      if (isDir(raw) || !mustExist) return raw;
      const yn = (await ask(`  Папки '${raw}' нет. Создать? [Y/n]: `)).trim().toLowerCase();
      if (["", "y", "д", "да"].includes(yn)) {
        fs.mkdirSync(raw, { recursive: true });
        return raw;
      }
    } else if (isFile(raw) || !mustExist) {
      return raw;
    } else {
      console.log(`  Файл не найден: ${raw}`);
    }
  }
}

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Замена файла. В Windows rename часто падает с EPERM/EBUSY, если файл на миг занят
 *  (next dev, антивирус, OneDrive, индексатор) — повторяем, затем пробуем скопировать поверх. */
function replaceFile(tmp: string, dest: string): void {
  const busy = new Set(["EPERM", "EBUSY", "EACCES"]);
  let last: unknown;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      fs.renameSync(tmp, dest);
      return;
    } catch (e) {
      if (!busy.has((e as NodeJS.ErrnoException).code ?? "")) throw e;
      last = e;
      sleepSync(100 * (attempt + 1));
    }
  }
  try {
    fs.copyFileSync(tmp, dest); // запись поверх существующего файла
    fs.unlinkSync(tmp);
  } catch {
    throw new Error(
      `Не удалось записать ${dest}: файл занят другим процессом (${(last as Error).message}).\n` +
        `Закройте next dev / OneDrive / редактор с этим файлом. Все данные сохранены в ${tmp} — ` +
        `после освобождения файла просто переименуйте его в ${path.basename(dest)}.`,
    );
  }
}

/** products.json: чтение, добавление в конец, безопасная запись. */
class ProductsIndex {
  items: Rec[];
  links: Set<string>;
  nextId: number;
  backedUp = false;
  private pending = 0;
  private crlf: boolean;
  private trailingNewline: boolean;
  private hasBom: boolean;

  constructor(private filePath: string) {
    const raw = fs.readFileSync(filePath);
    this.hasBom = raw.length >= 3 && raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf;
    const text = raw.toString("utf8").replace(/^\uFEFF/, "");
    this.crlf = text.includes("\r\n");
    this.trailingNewline = text.endsWith("\n");
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("products.json должен быть массивом");
    this.items = parsed;
    this.links = new Set(this.items.map((i) => String(i.link ?? "").toLowerCase()));
    this.nextId = this.items.reduce((m, i) => Math.max(m, Math.trunc(Number(i.id ?? 0)) || 0), 0) + 1;
  }

  categories(): string[] {
    const set = new Set<string>();
    for (const i of this.items) if (i.category) set.add(i.category);
    return Array.from(set).sort();
  }

  add(name: string, category: string, calories: number, slug: string): Rec {
    const entry: Rec = {
      id: this.nextId,
      name,
      category,
      calories,
      image: imageFor(categorySlug(category)),
      favorite: false,
      link: linkFor(slug),
    };
    this.nextId++;
    this.items.push(entry);
    this.links.add(entry.link.toLowerCase());
    this.pending++;
    if (this.pending >= FLUSH_EVERY) this.flush();
    return entry;
  }

  flush(): void {
    if (!this.pending) return;
    if (!this.backedUp) {
      fs.copyFileSync(this.filePath, this.filePath + ".bak");
      this.backedUp = true;
    }
    let text = JSON.stringify(this.items, null, 2);
    if (this.trailingNewline) text += "\n";
    if (this.crlf) text = text.replace(/\n/g, "\r\n");
    const tmp = this.filePath + ".tmp";
    const body = Buffer.from(text, "utf8");
    fs.writeFileSync(tmp, this.hasBom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), body]) : body);
    replaceFile(tmp, this.filePath);
    this.pending = 0;
  }
}

/** Отдельный файл со списком категорий: [{id, name, slug, image}, ...].
 *  Существующие записи сохраняются, новые категории дописываются в конец. */
class CategoriesFile {
  items: Rec[];
  private names: Set<string>;
  private nextId: number;
  private dirty: boolean;

  constructor(private filePath: string) {
    const data = loadJsonFile<unknown>(filePath, null);
    this.items = Array.isArray(data) ? data : [];
    this.names = new Set(this.items.map((i) => String(i.name ?? "").toLowerCase()));
    this.nextId = this.items.reduce((m, i) => Math.max(m, Math.trunc(Number(i.id ?? 0)) || 0), 0) + 1;
    this.dirty = !fs.existsSync(filePath);
  }

  add(name: string): void {
    if (!name || this.names.has(name.toLowerCase())) return;
    const slug = categorySlug(name);
    this.items.push({ id: this.nextId, name, slug, image: imageFor(slug) });
    this.names.add(name.toLowerCase());
    this.nextId++;
    this.dirty = true;
  }

  flush(): void {
    if (!this.dirty) return;
    fs.mkdirSync(path.dirname(path.resolve(this.filePath)), { recursive: true });
    writeJson(this.filePath, this.items);
    this.dirty = false;
  }
}

class CategoryResolver {
  learned: Record<string, string>;

  constructor(private defaultCategory: string) {
    this.learned = loadJsonFile<Record<string, string>>(CATEGORY_MAP_FILE, {}) || {};
  }

  resolve(usdaCat: string): string {
    const key = usdaCat.toLowerCase().trim();
    if (Object.prototype.hasOwnProperty.call(this.learned, key)) return this.learned[key];
    if (Object.prototype.hasOwnProperty.call(CATEGORY_MAP, key)) return CATEGORY_MAP[key];
    for (const [pattern, target] of CATEGORY_RULES) {
      if (pattern.test(key)) return target;
    }
    return this.learnNew(usdaCat, key);
  }

  /** Неизвестная категория: без вопросов создаём новую food/<категория USDA>. */
  private learnNew(usdaCat: string, key: string): string {
    const name = usdaCat.toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ").trim();
    const choice = name ? "food/" + name : this.defaultCategory;
    this.learned[key] = choice;
    writeJson(CATEGORY_MAP_FILE, this.learned, false);
    console.log(`  * новая категория: «${usdaCat}» -> ${choice}`);
    return choice;
  }
}

function writeProductFile(outDir: string, slug: string, data: Rec): string {
  const p = path.join(outDir, slug + ".json");
  writeJson(p, data);
  return p;
}

// ----------------------------------------------------------------------------
// main
// ----------------------------------------------------------------------------
const HELP = `Импорт продуктов USDA -> products.json + файлы продуктов

  --source <файл>            большой JSON-файл USDA
  --dri <файл>               vitamin-dri.json (источник slug нутриентов)
  --products <файл>          products.json, куда дописывать записи
  --out <папка>              папка для файлов продуктов
  --categories <файл>        файл со списком категорий (по умолчанию categories.json рядом с products.json)
  --review                   подтверждать каждый продукт (можно править имя и link)
  --overwrite                перезаписывать существующие файлы продуктов
  --yes                      не задавать вопросов (все пути должны быть заданы)
  --skip <N>                 пропустить первые N записей источника
  --limit <N>                обработать не более N записей источника (0 = все)
  --default-category <имя>   категория, если у записи USDA нет категории (по умолчанию food/other)
  -h, --help                 эта справка`;

function fatal(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}

function parseCli() {
  try {
    const { values } = parseArgs({
      options: {
        source: { type: "string" },
        dri: { type: "string" },
        products: { type: "string" },
        out: { type: "string" },
        categories: { type: "string" },
        review: { type: "boolean", default: false },
        overwrite: { type: "boolean", default: false },
        yes: { type: "boolean", default: false },
        skip: { type: "string", default: "0" },
        limit: { type: "string", default: "0" },
        "default-category": { type: "string", default: "food/other" },
        help: { type: "boolean", short: "h", default: false },
      },
      allowPositionals: false,
    });
    if (values.help) {
      console.log(HELP);
      process.exit(0);
    }
    const toInt = (name: string, v: string | undefined): number => {
      const n = Number(v);
      if (!Number.isInteger(n)) fatal(`--${name}: ожидается целое число, получено "${v}"`, 2);
      return n;
    };
    return {
      source: values.source,
      dri: values.dri,
      products: values.products,
      out: values.out,
      categories: values.categories,
      review: values.review as boolean,
      overwrite: values.overwrite as boolean,
      yes: values.yes as boolean,
      skip: toInt("skip", values.skip),
      limit: toInt("limit", values.limit),
      defaultCategory: values["default-category"] as string,
    };
  } catch (e) {
    console.error((e as Error).message);
    console.error("\n" + HELP);
    return process.exit(2);
  }
}

async function main(): Promise<void> {
  const args = parseCli();
  const saved = loadJsonFile<Rec>(SETTINGS_FILE, {}) || {};
  const interactive = !args.yes;

  const get = async (
    name: "source" | "products" | "out" | "dri",
    label: string,
    kind: "file" | "dir" = "file",
    mustExist = true,
  ): Promise<string> => {
    const val = args[name];
    if (val) return val;
    if (!interactive) fatal(`Укажите --${name} (режим --yes).`);
    return askPath(label, saved[name], kind, mustExist);
  };

  const source = await get("source", "1) Большой JSON-файл USDA с записями продуктов");
  const productsPath = await get("products", "2) Файл products.json (куда добавлять записи)");
  const outDir = await get("out", "3) Папка, где создавать файлы продуктов", "dir", false);
  const driPath = await get("dri", "4) Файл vitamin-dri.json (список slug нутриентов)");
  fs.mkdirSync(outDir, { recursive: true });
  if (!args.review) closeRl(); // вопросов больше не будет

  writeJson(SETTINGS_FILE, { source, products: productsPath, out: outDir, dri: driPath }, false);

  const dri = loadJsonFile<unknown>(driPath);
  if (!dri || typeof dri !== "object" || Array.isArray(dri)) {
    fatal("vitamin-dri.json должен быть объектом {slug: {...}}");
  }
  const driSlugs = new Set<string>();
  for (const [k, v] of Object.entries(dri as Rec)) {
    driSlugs.add(v && typeof v === "object" && "slug" in v ? String(v.slug) : k);
    driSlugs.add(k);
  }
  const unknown = [...MACRO, ...MICRO].map((d) => d[0]).filter((s) => !driSlugs.has(s));
  if (unknown.length) console.log("В vitamin-dri.json нет slug (эти нутриенты будут пропущены): " + unknown.join(", "));

  const index = new ProductsIndex(productsPath);
  const categories = new CategoryResolver(args.defaultCategory);
  const categoriesPath = args.categories || path.join(path.dirname(path.resolve(productsPath)), "categories.json");
  const categoriesFile = new CategoriesFile(categoriesPath);
  for (const c of index.categories()) categoriesFile.add(c); // уже существующие категории products.json

  const stats = { created: 0, exists: 0, no_data: 0, no_name: 0, declined: 0 };
  let seen = 0;
  console.log(`\nЧитаю ${source} ... (следующий id: ${index.nextId})\n`);
  try {
    for await (const rec of iterRecords(source)) {
      if (interrupted) throw new Interrupted();
      seen++;
      if (seen <= args.skip) continue;
      if (args.limit && seen - args.skip > args.limit) break;

      let name = typeof rec.description === "string" ? rec.description.trim() : "";
      if (!name) {
        stats.no_name++;
        continue;
      }
      let slug = slugify(name);
      if (!slug) {
        stats.no_name++;
        continue;
      }

      const usdaCat = usdaCategory(rec);
      let filePath = path.join(outDir, slug + ".json");
      let link = linkFor(slug);
      if (index.links.has(link.toLowerCase()) || (fs.existsSync(filePath) && !args.overwrite)) {
        stats.exists++;
        continue;
      }

      const built = buildProduct(rec, driSlugs, name, slug, usdaCat);
      if (!built.ok) {
        stats.no_data++;
        console.log(`  - пропуск «${name}»: ${built.reason}`);
        continue;
      }
      const { product, kcal } = built;

      let category = usdaCat ? categories.resolve(usdaCat) : args.defaultCategory;

      if (args.review) {
        console.log(
          `\n[${seen}] ${name}\n    категория: ${usdaCat} -> ${category}\n    ккал: ${kcal}, ` +
            `нутриентов: ${product.macroNutrients.length - 1} макро + ${product.microNutrients.length} микро\n` +
            `    link: ${link}`,
        );
        let ans = "";
        for (;;) {
          ans = (
            await ask("    Enter = сохранить, n = имя, l = link, c = категория, s = пропустить, q = выход: ")
          )
            .trim()
            .toLowerCase();
          if (ans === "") break;
          if (ans === "n") {
            const nw = (await ask("    Новое имя: ")).trim();
            if (nw) {
              name = nw;
              product.name = nw;
            }
          } else if (ans === "l") {
            const nw = slugify(await ask("    Новый slug для link: "));
            if (nw) {
              slug = nw;
              product.slug = slug;
              link = linkFor(slug);
              filePath = path.join(outDir, slug + ".json");
              console.log(`    link: ${link}`);
            }
          } else if (ans === "c") {
            const nw = (await ask("    Категория для products.json: ")).trim();
            if (nw) category = nw;
          } else if (ans === "s" || ans === "q") {
            break;
          }
        }
        if (ans === "q") break;
        if (ans === "s") {
          stats.declined++;
          continue;
        }
        if (index.links.has(link.toLowerCase()) || (fs.existsSync(filePath) && !args.overwrite)) {
          console.log("    Такой link/файл уже существует, пропускаю.");
          stats.exists++;
          continue;
        }
      }

      writeProductFile(outDir, slug, product);
      const entry = index.add(name, category, kcal, slug);
      categoriesFile.add(category);
      stats.created++;
      if (args.review || stats.created % 100 === 0) {
        console.log(`  + id ${entry.id}: ${name} -> ${slug}.json (${stats.created} создано)`);
      }
    }
  } catch (e) {
    if (e instanceof Interrupted) console.log("\nПрервано пользователем, сохраняю прогресс...");
    else throw e;
  } finally {
    index.flush();
    categoriesFile.flush();
    writeJson(CATEGORY_MAP_FILE, categories.learned, false);
  }

  console.log("\nГотово.");
  console.log(`  прочитано записей:       ${seen}`);
  console.log(`  создано продуктов:       ${stats.created}`);
  console.log(`  уже существуют (пропуск): ${stats.exists}`);
  console.log(`  без данных о калориях:   ${stats.no_data}`);
  console.log(`  без имени:               ${stats.no_name}`);
  if (args.review) console.log(`  отклонено вручную:       ${stats.declined}`);
  console.log(`  файл категорий:          ${categoriesPath} (${categoriesFile.items.length} шт.)`);
  if (index.backedUp) console.log(`  резервная копия: ${productsPath}.bak`);
}

process.on("SIGINT", requestInterrupt);

main().then(
  () => closeRl(),
  (e) => {
    closeRl();
    if (e instanceof Interrupted) {
      console.log("\nПрервано.");
      process.exitCode = 130;
    } else {
      console.error(e);
      process.exitCode = 1;
    }
  },
);
