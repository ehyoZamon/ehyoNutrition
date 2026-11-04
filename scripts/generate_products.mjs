#!/usr/bin/env node
/**
 * https://console.groq.com/keys
 * Генерация информации о продуктах через Groq API.
 *
 * Положите файл в scripts/generate_products.mjs и запускайте из корня проекта:
 *
 *   node scripts/generate_products.mjs                    — все продукты из PRODUCTS_SOURCE
 *   node scripts/generate_products.mjs --limit=5          — (необязательно) только первые 5 новых, для проверки
 *   node scripts/generate_products.mjs --force            — перезаписывать существующие файлы
 *   node scripts/generate_products.mjs "Грецкий орех"     — только указанные продукты
 *
 * Ключ: GROQ_API_KEY в .env.local (в корне проекта) или в переменных окружения.
 * Зависимостей нет — нужен только Node 18+ (встроенный fetch).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                     НАСТРОЙКИ — ЗАПОЛНИТЕ ЭТУ СЕКЦИЮ                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// Модель Groq. Качественнее: "llama-3.3-70b-versatile".
// Быстрее и дешевле (но хуже держит структуру): "llama-3.1-8b-instant".
const MODEL = "openai/gpt-oss-120b";

// Откуда брать названия продуктов: файл или ссылка (http/https).
// Пути к файлам считаются от папки скрипта (scripts/).
// Форматы: один объект, список объектов {id, title}, список строк.
const PRODUCTS_SOURCE = "products.json";

// Файл-образец структуры. null — взять первый продукт из PRODUCTS_SOURCE.
const TEMPLATE_FILE = "../public/data/en/productInfo/almonds.json";

// Куда сохранять результат.
const OUTPUT_DIR = "../public/data";
const RU_DIR_NAME = "ru/productInfoZip";
const EN_DIR_NAME = "en/productInfoZip";

// Устойчивость к сбоям. Продукт НЕ пропускается: скрипт повторяет запрос,
// пока не получит корректный результат (при лимитах, сбоях сети и т. п.).
const RETRY_DELAY_MIN_MS = 30_000; // пауза между повторами — случайная
const RETRY_DELAY_MAX_MS = 60_000; // в диапазоне 30–60 секунд
const QUALITY_RETRY_DELAY_MS = 5_000; // пауза после «плохого» JSON (лимиты тут ни при чём)
const MAX_QUALITY_ATTEMPTS = 10;   // после стольких быстрых повторов (при плохом JSON) паузы становятся 30–60 с
const REQUEST_TIMEOUT_MS = 60_000;
const PAUSE_BETWEEN_PRODUCTS_MS = 2000;

// Вывод ответов модели в консоль (удобно для отладки).
const LOG_MODEL_RESPONSES = true;
const LOG_MAX_CHARS = 0; // 0 — выводить ответ целиком; иначе обрезать до N символов

// Текст промпта. Подстановки: {NAME}, {SLUG}, {STRUCTURE}.
const PROMPT_TEMPLATE = `Создай информацию о продукте {NAME} на основе вот такой структуры на русском и английском:
{STRUCTURE}

Требования к ответу:
- Верни ТОЛЬКО валидный JSON, без markdown-обёртки и без пояснений.
- Формат ответа: {"ru": <объект по структуре на русском>, "en": <объект по структуре на английском>}.
- Структуру образца сохрани точно: те же поля, тот же порядок секций, та же вложенность (title / content / items).
- Значение "id" в обоих объектах одинаковое: "{SLUG}".
- Значение "image" в обоих объектах: "/products/{SLUG}.png".
- Тексты должны быть фактически точными и написаны в том же стиле, что и образец.
- Поле "title" верхнего уровня: в русской версии — название продукта по-русски, в английской — по-английски.
- Поле "content" — ОДИН плоский массив объектов-секций: [ {...}, {...}, {...} ]. Не оборачивай секции в дополнительные массивы [ ] и не ставь "],[" между секциями.
- Следи за парностью скобок. Форматируй JSON с отступом в 2 пробела (как в образце), каждый элемент на своей строке.
`;

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                     КОНЕЦ НАСТРОЕК — ДАЛЬШЕ НЕ ТРОГАТЬ                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const resolveHere = (p) => path.resolve(SCRIPT_DIR, p);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 75000 -> «1 мин 15 с», 42000 -> «42 с». */
function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return [h && `${h} ч`, m && `${m} мин`, (sec || (!h && !m)) && `${sec} с`].filter(Boolean).join(" ");
}

/** Долгое ожидание с напоминанием в консоли раз в минуту. */
async function sleepWithCountdown(ms) {
  let left = ms;
  while (left > 0) {
    const step = Math.min(left, 60_000);
    await sleep(step);
    left -= step;
    if (left > 0) console.log(`   …ждём ещё ~${formatDuration(left)}`);
  }
}

/** Ошибка, после которой продолжать бессмысленно (неверный ключ, исчерпан лимит). */
class FatalError extends Error {}

// ─────────────────────────── .env.local ───────────────────────────

async function loadEnvFile() {
  if (process.env.GROQ_API_KEY) return;
  for (const file of [".env.local", ".env"]) {
    try {
      const text = await fs.readFile(path.resolve(SCRIPT_DIR, "..", file), "utf-8");
      for (const line of text.split(/\r?\n/)) {
        if (line.trim().startsWith("#")) continue;
        const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/);
        if (!m) continue;
        const value = m[2].replace(/^(['"])(.*)\1$/, "$2");
        if (!(m[1] in process.env)) process.env[m[1]] = value;
      }
    } catch {
      /* файла нет — пропускаем */
    }
  }
}

// ─────────────────────────── Работа с файлами ───────────────────────────

async function loadJson(source) {
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`Не удалось загрузить ${source}: ${res.status}`);
    return res.json();
  }
  // Убираем BOM, который иногда добавляют Windows-редакторы.
  const text = await fs.readFile(resolveHere(source), "utf-8");
  return JSON.parse(text.replace(/^\uFEFF/, ""));
}

const saveJson = (file, data) =>
  fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");

const exists = (file) => fs.access(file).then(() => true, () => false);

// ─────────────────────────── Извлечение имён продуктов ───────────────────────────

/** Имя файла = название продукта (без символов, запрещённых в Windows). */
const safeFileName = (text) =>
  text
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Достаёт из JSON список продуктов вида { name, slug }. */
function extractProducts(data) {
  const items = Array.isArray(data) ? data : [data];
  const products = [];

  for (const item of items) {
    let title;
    let id;

    if (typeof item === "string") {
      title = item;
    } else if (item && typeof item === "object") {
      title = item.title || item.name || item.id;
      id = item.id;
    } else {
      continue;
    }

    if (title == null || title === "") continue;
    title = String(title);

    const slug = id != null && id !== "" ? String(id) : slugify(title);
    if (!slug) {
      console.warn(`⚠ Пропускаю «${title}»: нет поля id, а из названия slug не построить.`);
      continue;
    }

    products.push({
      name: slug !== title ? `${title} (${slug})` : title,
      slug,
      fileName: safeFileName(title) || slug,
    });
  }

  // Одинаковые названия дали бы один и тот же файл (Windows не различает регистр),
  // поэтому у повторов добавляем id: «Apple.json», «Apple (25).json».
  const used = new Set();
  for (const p of products) {
    let candidate = p.fileName;
    if (used.has(candidate.toLowerCase())) candidate = `${p.fileName} (${p.slug})`;
    for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${p.fileName} (${p.slug}-${n})`;
    if (candidate !== p.fileName) {
      console.warn(`⚠ Повтор названия «${p.fileName}» — файл будет назван «${candidate}.json»`);
    }
    p.fileName = candidate;
    used.add(candidate.toLowerCase());
  }

  return products;
}

// ─────────────────────────── Запрос к Groq и проверка ───────────────────────────

const buildPrompt = (name, slug, structure) =>
  PROMPT_TEMPLATE.replace("{NAME}", name)
    .replace("{SLUG}", slug)
    .replace("{STRUCTURE}", structure);

/** Собирает все тексты объекта (кроме служебных полей id и image). */
function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (key !== "id" && key !== "image") collectStrings(v, out);
    }
  }
  return out;
}

/** Доля кириллицы среди всех букв текста объекта (0..1). */
function cyrillicShare(obj) {
  const text = collectStrings(obj).join(" ");
  const letters = text.match(/\p{L}/gu) ?? [];
  if (!letters.length) return 0;
  const cyrillic = text.match(/[\u0400-\u04FF]/g) ?? [];
  return cyrillic.length / letters.length;
}

/** Проверяет, что ответ повторяет структуру образца. Пустой список = всё хорошо. */
function validate(result, template) {
  const problems = [];

  for (const lang of ["ru", "en"]) {
    const obj = result?.[lang];
    if (!obj || typeof obj !== "object") {
      problems.push(`нет ключа '${lang}'`);
      continue;
    }

    const missing = Object.keys(template).filter((k) => !(k in obj));
    if (missing.length) problems.push(`[${lang}] не хватает полей: ${missing.join(", ")}`);

    const got = Array.isArray(obj.content) ? obj.content.length : 0;
    const expected = Array.isArray(template.content) ? template.content.length : 0;
    if (got !== expected) {
      problems.push(`[${lang}] число секций content = ${got}, а в образце ${expected}`);
    }

    // Языки не должны перепутаться: ru — русский текст, en — английский.
    const share = cyrillicShare(obj);
    if (lang === "ru" && share < 0.5) problems.push("[ru] текст не на русском языке");
    if (lang === "en" && share > 0.05) problems.push("[en] текст не на английском языке");
  }
  return problems;
}

/** Достаёт из текста ошибки Groq подсказку «Please try again in 7.41s» (в мс). */
function parseRetryHint(text) {
  const m = String(text).match(/try again in\s+([0-9hms.]+)/i);
  if (!m) return 0;
  const units = { h: 3_600_000, m: 60_000, s: 1000, ms: 1 };
  let total = 0;
  for (const [, value, unit] of m[1].replace(/\.$/, "").matchAll(/(\d+(?:\.\d+)?)(ms|h|m|s)/g)) {
    total += Number(value) * units[unit];
  }
  return total;
}

/** Ошибка «плохого» ответа модели (не JSON / нарушена структура / не тот язык). */
function qualityError(message, modelOutput) {
  const err = new Error(message);
  err.quality = true;
  err.modelOutput = modelOutput; // то, что модель успела сгенерировать (если Groq вернул)
  return err;
}

/** Печатает ответ модели в рамке (см. LOG_MODEL_RESPONSES / LOG_MAX_CHARS). */
function logModelResponse(title, text) {
  if (!LOG_MODEL_RESPONSES || !text) return;
  const cut = LOG_MAX_CHARS > 0 && text.length > LOG_MAX_CHARS;
  const shown = cut ? `${text.slice(0, LOG_MAX_CHARS)}\n… (обрезано, всего ${text.length} символов)` : text;
  console.log(`   ┌─ ${title} ${"─".repeat(30)}`);
  console.log(shown.split("\n").map((line) => `   │ ${line}`).join("\n"));
  console.log(`   └${"─".repeat(40)}`);
}

async function callGroq(prompt) {
  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // JSON-режим Groq
        temperature: 0.2,
        // gpt-oss — «рассуждающая» модель: низкий уровень экономит токены и лимит TPM.
        ...(MODEL.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (e) {
    // «fetch failed» ничего не говорит — достаём реальную причину из e.cause.
    if (e?.name === "TimeoutError") {
      throw new Error(`сеть: таймаут ${REQUEST_TIMEOUT_MS / 1000} с`);
    }
    const c = e?.cause;
    throw new Error(`сеть: ${[c?.code, c?.message ?? e?.message].filter(Boolean).join(" ")}`);
  }

  if (!res.ok) {
    const body = await res.text();
    const headerHint = Number(res.headers.get("retry-after")) * 1000 || 0;
    const hintMs = Math.max(headerHint, parseRetryHint(body));

    // Неустранимые ошибки — повторять бессмысленно, останавливаем запуск.
    if (res.status === 401 || res.status === 403) {
      throw new FatalError(`Groq ${res.status}: доступ запрещён (ключ/фаервол). ${body.slice(0, 200)}`);
    }
    if (res.status === 404) {
      throw new FatalError(`Groq 404: модель «${MODEL}» недоступна. ${body.slice(0, 200)}`);
    }

    // Лимиты (в т. ч. суточный): не останавливаемся, ждём, сколько просит Groq, и повторяем.
    if (res.status === 429) {
      const kind = body.match(/\((TPM|TPD|RPM|RPD)\)/)?.[1] ?? "лимит";
      const err = new Error(`Groq 429: превышен лимит ${kind}`);
      err.retryAfterMs = hintMs;
      throw err;
    }

    // Модель вернула невалидный JSON — это «качество», пробуем ещё раз.
    if (res.status === 400 && body.includes("json_validate_failed")) {
      let failedGeneration;
      try {
        failedGeneration = JSON.parse(body)?.error?.failed_generation;
      } catch {
        /* тело не JSON — выводить нечего */
      }
      throw qualityError("Groq 400: модель вернула невалидный JSON", failedGeneration);
    }

    // Временные сбои на стороне Groq.
    if (res.status >= 500) {
      const err = new Error(`Groq ${res.status}: сервис временно недоступен`);
      err.retryAfterMs = hintMs;
      throw err;
    }

    throw new FatalError(`Groq ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Один продукт. Повторяет запрос, пока не получит корректный результат: лимиты Groq,
 * сбои сети и «плохие» ответы модели не останавливают скрипт — он ждёт и пробует снова.
 * Ошибку бросает только в случае, когда повторы бессмысленны (неверный ключ, нет модели).
 */
async function generateProduct(name, slug, structure, template) {
  const prompt = buildPrompt(name, slug, structure);
  let attempt = 0;
  let qualityFails = 0;

  while (true) {
    attempt++;
    try {
      const text = await callGroq(prompt);
      logModelResponse("ответ модели", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw qualityError("ответ модели не является валидным JSON");
      }

      const problems = validate(result, template);
      if (problems.length) throw qualityError(problems.join("; "));

      // id и image задаём сами, а не доверяем модели (она подставляла, например, carrot.png).
      for (const lang of ["ru", "en"]) {
        if ("id" in template) result[lang].id = slug;
        if ("image" in template) result[lang].image = `/products/${slug}.png`;
      }

      return result;
    } catch (error) {
      if (error instanceof FatalError) throw error;

      // Если Groq отклонил ответ (400), показываем, что модель успела выдать.
      if (error.modelOutput) logModelResponse("невалидный ответ модели", error.modelOutput);

      if (error.quality) qualityFails++;

      // Плохой JSON: сначала быстрые повторы (5 с), потом паузы 30–60 с.
      // Остальное (лимиты, сеть): пауза 30–60 с; если Groq просит ждать дольше — ждём сколько просит.
      const quickRetry = error.quality && qualityFails < MAX_QUALITY_ATTEMPTS;
      const baseWait = quickRetry
        ? QUALITY_RETRY_DELAY_MS
        : RETRY_DELAY_MIN_MS + Math.random() * (RETRY_DELAY_MAX_MS - RETRY_DELAY_MIN_MS);
      const waitMs = Math.max(baseWait, (error.retryAfterMs ?? 0) + 1000);

      console.log(
        `   попытка ${attempt} не удалась: ${error.message} — повтор через ${formatDuration(waitMs)}`,
      );
      await sleepWithCountdown(waitMs);
    }
  }
}

// ─────────────────────────────────── main ───────────────────────────────────

async function main() {
  await loadEnvFile();
  if (!process.env.GROQ_API_KEY) {
    console.error("Не задан GROQ_API_KEY (добавьте в .env.local или в окружение).");
    process.exit(1);
  }

  // Аргументы командной строки.
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
  const cliNames = args.filter((a) => !a.startsWith("--"));

  // --- Шаг 1. Продукты ---
  let sourceData = null;
  let products;
  if (cliNames.length) {
    products = extractProducts(cliNames);
  } else {
    console.log(`Загружаю список продуктов: ${PRODUCTS_SOURCE}`);
    sourceData = await loadJson(PRODUCTS_SOURCE);
    products = extractProducts(sourceData);
  }
  if (!products.length) {
    console.error("Не найдено ни одного продукта.");
    process.exit(1);
  }
  console.log(`Найдено продуктов: ${products.length}`);

  // --- Шаг 2. Образец структуры ---
  let template = TEMPLATE_FILE ? await loadJson(TEMPLATE_FILE) : sourceData;
  if (Array.isArray(template)) template = template[0];
  if (!template || typeof template !== "object" || !("content" in template)) {
    console.error("Образец структуры должен быть объектом с полем 'content'. Проверьте TEMPLATE_FILE.");
    process.exit(1);
  }
  const structure = JSON.stringify(template, null, 2);

  // --- Шаг 3. Папки ---
  const ruDir = resolveHere(path.join(OUTPUT_DIR, RU_DIR_NAME));
  const enDir = resolveHere(path.join(OUTPUT_DIR, EN_DIR_NAME));
  await fs.mkdir(ruDir, { recursive: true });
  await fs.mkdir(enDir, { recursive: true });

  // --- Шаг 4. Обработка ---
  let done = 0;
  let skipped = 0;
  const failed = [];

  for (let i = 0; i < products.length; i++) {
    const { name, slug, fileName } = products[i];
    const ruPath = path.join(ruDir, `${fileName}.json`);
    const enPath = path.join(enDir, `${fileName}.json`);

    console.log(`\n[${i + 1}/${products.length}] ${name}`);

    const ruExists = await exists(ruPath);
    const enExists = await exists(enPath);

    if (!force && ruExists && enExists) {
      console.log("   уже существует (ru и en) — пропускаю");
      skipped++;
      continue;
    }

    if (done + failed.length >= limit) {
      console.log(`\nДостигнут лимит --limit=${limit}, останавливаюсь.`);
      break;
    }

    try {
      const result = await generateProduct(name, slug, structure, template);
      // Существующие файлы не трогаем (без --force): дописываем только недостающий язык.
      const saved = [];
      if (force || !ruExists) {
        await saveJson(ruPath, result.ru);
        saved.push(ruPath);
      }
      if (force || !enExists) {
        await saveJson(enPath, result.en);
        saved.push(enPath);
      }
      console.log(`   ✓ сохранено: ${saved.join("  и  ")}`);
      done++;
    } catch (error) {
      // Продукт не пропускаем: при неустранимой ошибке останавливаем весь запуск.
      console.log(`   ✗ ${error.message}`);
      console.log("\nОстанавливаюсь. Устраните причину и запустите снова — готовые продукты будут пропущены.");
      failed.push(name);
      break;
    }

    if (i < products.length - 1) await sleep(PAUSE_BETWEEN_PRODUCTS_MS);
  }

  // --- Шаг 5. Итог ---
  console.log("\n" + "─".repeat(50));
  console.log(`Создано: ${done} | Пропущено: ${skipped} | Ошибок: ${failed.length}`);
  if (failed.length) console.log("Не удались: " + failed.join(", "));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
