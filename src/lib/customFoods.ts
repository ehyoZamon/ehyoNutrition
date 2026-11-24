// lib/customFoods.ts
//
// Блюда, которые пользователь собирает сам из продуктов каталога.
// Здесь всё, что нужно модулю "Create Food" и спискам продуктов:
//   • хранение в SQLite (custom_foods + custom_food_ingredients);
//   • расчёт нутриентов блюда из состава (сумма ингредиентов);
//   • превращение блюда в "продукт" каталога (отрицательный id, slug "custom-<n>"):
//     lib/productsIndex.ts подмешивает такие продукты в общий индекс, поэтому они
//     видны везде — AddFoodSheet, Products, дневник, расчёт %DV;
//   • версия списка блюд + хук useCustomFoodsVersion() — по ней экраны перечитывают индекс.
import { useEffect, useState } from "react";
import { initDB, persistWeb } from "@/lib/db";
import { loadProductDetail, type ProductDetail, type ProductNutrient } from "@/lib/productDetail";
import { parseServingInfo } from "@/lib/servingInfo";
import { parseAmount } from "@/lib/nutrientFormat";
import type { CatalogProduct } from "@/lib/productsIndex"; // только тип: productsIndex импортирует этот файл

// ---------------------------------------------------------------------------
// Константы и типы
// ---------------------------------------------------------------------------
export const CUSTOM_SLUG_PREFIX = "custom-";
/** "Категория" для блюд пользователя (в каталоге такой нет — это служебный ключ). */
export const CUSTOM_CATEGORY = "__custom__";
/** Картинка блюда по умолчанию (положить в public/). */
export const CUSTOM_FOOD_IMAGE = "/food-diary/custom-food.svg";

export type CustomProduct = CatalogProduct & { source?: string };

export type FoodItem = { slug: string; grams: number };

export const isCustomSlug = (slug: string) => slug.startsWith(CUSTOM_SLUG_PREFIX);
const idFromSlug = (slug: string) => Number(slug.slice(CUSTOM_SLUG_PREFIX.length));

/** Тег-источник, как "USDA" у продуктов каталога. */
export const customSourceLabel = (locale: string) => (locale === "ru" ? "Моя еда" : "My food");
export const customCategoryLabel = customSourceLabel;

// ---------------------------------------------------------------------------
// Работа с нутриентами
// ---------------------------------------------------------------------------
type N = ProductNutrient;
type Acc = { proto: N; unit: string; sum: number };

// Единицы массы приводим друг к другу, остальные (kcal, IU...) складываем только "как есть".
const MASS: Record<string, number> = { g: 1, mg: 1e-3, mcg: 1e-6, "µg": 1e-6, "μg": 1e-6, ug: 1e-6 };

function splitAmount(amount: string | undefined): { num: number; unit: string } | null {
  if (!amount) return null;
  const m = parseAmount(amount).value.trim().match(/^(-?[\d.]+)\s*(.*)$/);
  if (!m) return null;
  const num = parseFloat(m[1]);
  return Number.isNaN(num) ? null : { num, unit: m[2].trim() };
}

function convert(num: number, from: string, to: string): number | null {
  const a = from.toLowerCase();
  const b = to.toLowerCase();
  if (a === b) return num;
  if (MASS[a] !== undefined && MASS[b] !== undefined) return (num * MASS[a]) / MASS[b];
  return null;
}

const fmt = (n: number) => String(Math.round(n * 100) / 100);

function accumulate(map: Map<string, Acc>, list: N[] | undefined, factor: number) {
  for (const n of list ?? []) {
    const parsed = splitAmount(n.amount);
    // slug — стабильный идентификатор нутриента; у калорий он пустой, там id = "calories".
    // Числовой id — просто номер строки в файле конкретного продукта, по нему склеивать нельзя.
    const key = n.slug || String(n.id ?? "");
    if (!parsed || !key) continue;

    const acc = map.get(key);
    if (!acc) {
      map.set(key, { proto: n, unit: parsed.unit, sum: parsed.num * factor });
      continue;
    }
    const v = convert(parsed.num, parsed.unit, acc.unit);
    if (v !== null) acc.sum += v * factor;
  }
}

function toList(map: Map<string, Acc>, scale: number): N[] {
  return Array.from(map.values()).map((a) => ({
    ...a.proto, // сохраняем все остальные поля (id, slug, название...) от первого ингредиента
    amount: a.unit ? `${fmt(a.sum * scale)} ${a.unit}` : fmt(a.sum * scale),
  }));
}

export type FoodNutrition = {
  totalGrams: number;
  /** Нутриенты на всё блюдо (то, что видно в шапке "Create Food"). */
  macroTotal: N[];
  /** ккал на 100 г блюда. */
  kcalPer100: number;
  /** ккал каждого ингредиента (в порядке items). */
  itemKcal: number[];
  /** Деталь продукта в формате каталога (на 100 г) — отдаётся через loadProductDetail. */
  detail: ProductDetail | null;
};

/**
 * Считает нутриенты блюда как сумму ингредиентов.
 * Данные ингредиентов — на 100 г (как в productDetails), поэтому вклад
 * ингредиента = значение × grams / 100.
 */
export async function computeFoodNutrition(items: FoodItem[]): Promise<FoodNutrition> {
  const details = await Promise.all(items.map((i) => loadProductDetail("en", i.slug)));

  const macro = new Map<string, Acc>();
  const micro = new Map<string, Acc>();
  const itemKcal: number[] = [];
  let totalGrams = 0;
  let base: ProductDetail | null = null;
  let macroTitle: string | null = null;

  // for-цикл, а не forEach: TS иначе сужает base/macroTitle до null после колбэка
  for (let idx = 0; idx < details.length; idx++) {
    const d = details[idx];
    const grams = items[idx].grams > 0 ? items[idx].grams : 0;
    totalGrams += grams;

    if (!d) {
      itemKcal.push(0);
      continue;
    }
    base ??= d;
    // Заголовок берём у ингредиента, измеряемого в граммах (не "поштучного"),
    // чтобы parseServingInfo для блюда выдал режим "на 100 г".
    if (!macroTitle && parseServingInfo(d.macroTitle).mode !== "count") macroTitle = d.macroTitle ?? null;

    const factor = grams / 100;
    accumulate(macro, d.macroNutrients, factor);
    accumulate(micro, d.microNutrients, factor);

    const cal = splitAmount(d.macroNutrients?.find((n) => !n.slug)?.amount);
    itemKcal.push(cal ? cal.num * factor : 0);
  }

  const scale100 = totalGrams > 0 ? 100 / totalGrams : 0;
  const calories = Array.from(macro.values()).find((a) => !a.proto.slug);

  const detail: ProductDetail | null = base
    ? {
        ...(base as ProductDetail),
        macroTitle: macroTitle ?? "Nutrition per 100 g",
        macroNutrients: toList(macro, scale100),
        microNutrients: toList(micro, scale100),
      }
    : null;

  return {
    totalGrams,
    macroTotal: toList(macro, 1),
    kcalPer100: calories ? calories.sum * scale100 : 0,
    itemKcal,
    detail,
  };
}

// ---------------------------------------------------------------------------
// SQLite
// ---------------------------------------------------------------------------
async function conn() {
  const db = await initDB();
  if (!db) throw new Error("База данных недоступна");
  return db;
}

type FoodRow = { id: number; name: string; calories: number };

function toProduct(row: FoodRow, locale: string): CustomProduct {
  const slug = `${CUSTOM_SLUG_PREFIX}${row.id}`;
  // id отрицательный, чтобы не пересечься с id продуктов каталога (в diary.product_id они лежат рядом).
  return {
    id: -row.id,
    name: row.name,
    calories: Math.round(row.calories),
    link: `/products/${slug}`,
    image: CUSTOM_FOOD_IMAGE,
    category: CUSTOM_CATEGORY,
    source: customSourceLabel(locale),
  };
}

export async function loadCustomFoods(locale: string): Promise<CustomProduct[]> {
  const db = await conn();
  const res = await db.query(`SELECT id, name, calories FROM custom_foods ORDER BY id DESC`);
  return ((res.values ?? []) as FoodRow[]).map((r) => toProduct(r, locale));
}

export async function createCustomFood(
  name: string,
  items: FoodItem[],
  locale: string
): Promise<CustomProduct> {
  const cleanName = name.trim();
  const { kcalPer100 } = await computeFoodNutrition(items);
  const db = await conn();

  const res = await db.run(
    `INSERT INTO custom_foods (name, calories, created_at) VALUES (?, ?, ?)`,
    [cleanName, kcalPer100, new Date().toISOString()]
  );
  const id = res.changes?.lastId;
  if (typeof id !== "number") throw new Error("Не удалось сохранить блюдо");

  try {
    await db.executeSet(
      items.map((i) => ({
        statement: `INSERT INTO custom_food_ingredients (food_id, product_slug, grams) VALUES (?, ?, ?)`,
        values: [id, i.slug, i.grams],
      }))
    );
  } catch (e) {
    await db.run(`DELETE FROM custom_foods WHERE id = ?`, [id]).catch(() => {});
    throw e;
  }

  await persistWeb();
  notifyCustomFoodsChanged();
  return toProduct({ id, name: cleanName, calories: kcalPer100 }, locale);
}

/** Деталь блюда в формате каталога — её отдаёт loadProductDetail("…", "custom-<n>"). */
export async function loadCustomProductDetail(slug: string): Promise<ProductDetail | null> {
  const id = idFromSlug(slug);
  if (!Number.isFinite(id)) return null;

  const db = await conn();
  const food = await db.query(`SELECT name FROM custom_foods WHERE id = ?`, [id]);
  const name = ((food.values?.[0] as { name?: string } | undefined)?.name) ?? "";
  const res = await db.query(
    `SELECT product_slug, grams FROM custom_food_ingredients WHERE food_id = ? ORDER BY id`,
    [id]
  );
  const items = ((res.values ?? []) as { product_slug: string; grams: number }[]).map((r) => ({
    slug: r.product_slug,
    grams: r.grams,
  }));
  if (items.length === 0) return null;

  const { detail } = await computeFoodNutrition(items);
  return detail ? { ...detail, slug, name, category: CUSTOM_CATEGORY } : null;
}

// ---------------------------------------------------------------------------
// Версия списка блюд: растёт после создания блюда / импорта бэкапа.
// productsIndex по ней пересобирает индекс, а экраны — перечитывают его.
// ---------------------------------------------------------------------------
let version = 0;
const listeners = new Set<() => void>();

export const getCustomFoodsVersion = () => version;

export function notifyCustomFoodsChanged() {
  version += 1;
  listeners.forEach((l) => l());
}

/** Число, которое меняется при каждом изменении списка блюд — добавлять в deps эффектов, грузящих индекс. */
export function useCustomFoodsVersion(): number {
  const [v, setV] = useState(version);
  useEffect(() => {
    const l = () => setV(version);
    listeners.add(l);
    l(); // версия могла измениться между рендером и подпиской
    return () => {
      listeners.delete(l);
    };
  }, []);
  return v;
}
