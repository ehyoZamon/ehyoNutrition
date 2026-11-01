#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генерация информации о продуктах через Gemini API
=================================================

Что делает скрипт (по шагам):
  1. Загружает JSON с продуктами (локальный файл или ссылка) и достаёт из него
     название каждого продукта.
  2. Загружает JSON-образец со структурой (например, products.json с миндалём).
  3. Для каждого продукта отправляет в Gemini промпт:
        "Создай информацию о продукте xxxxx на основе вот такой структуры
         на русском и английском: ..."
  4. Проверяет, что ответ повторяет структуру образца.
  5. Сохраняет результат в два отдельных файла:
        ru/<id>.json   — версия на русском
        en/<id>.json   — версия на английском

Установка зависимостей:
    pip install google-genai requests

Запуск (после заполнения секции НАСТРОЙКИ ниже):
    python generate_products.py
"""

import json
import os
import re
import sys
import time
from pathlib import Path

import requests
from google import genai
from google.genai import types


# ╔══════════════════════════════════════════════════════════════════════════╗
# ║                     НАСТРОЙКИ — ЗАПОЛНИТЕ ЭТУ СЕКЦИЮ                     ║
# ║          Всё, что нужно изменить пользователю, находится здесь.          ║
# ╚══════════════════════════════════════════════════════════════════════════╝

# 1) API-ключ Gemini (получить: https://aistudio.google.com/apikey).
#    Лучше задать переменной окружения GEMINI_API_KEY.
#    Либо впишите ключ прямо сюда: GEMINI_API_KEY = "AIza..."
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# 2) Модель Gemini, которая будет генерировать текст.
#    Быстрая и дешёвая: "gemini-2.5-flash". Качественнее: "gemini-2.5-pro".
MODEL = "gemini-2.5-flash"

# 3) Откуда брать названия продуктов: путь к файлу ИЛИ ссылка (http/https).
#    Допустимые форматы содержимого:
#      • один объект:   {"id": "almonds", "title": "Миндаль", ...}
#      • список:        [{"id": "almonds", "title": "Миндаль"}, {...}]
#      • список строк:  ["Миндаль", "Грецкий орех"]
#    Название берётся из поля "title" (если нет — "name", затем "id").
PRODUCTS_SOURCE = "products.json"

# 4) Файл-образец со структурой, по которой Gemini создаст новый продукт.
#    Если оставить None — образцом станет первый продукт из PRODUCTS_SOURCE
#    (подходит, когда источник уже содержит полный продукт, как ваш products.json).
TEMPLATE_FILE = None

# 5) Куда сохранять результат. Внутри создадутся папки RU_DIR_NAME и EN_DIR_NAME.
OUTPUT_DIR = "."
RU_DIR_NAME = "ru"
EN_DIR_NAME = "en"

# 6) Если файл продукта уже существует:
#    True  — пропустить (не тратить запросы к API), False — перезаписать.
SKIP_EXISTING = True

# 7) Устойчивость к сбоям: сколько раз повторять запрос при ошибке
#    и сколько секунд ждать между повторами / между продуктами.
MAX_RETRIES = 3
RETRY_DELAY_SEC = 5
PAUSE_BETWEEN_PRODUCTS_SEC = 2   # защита от лимитов запросов (rate limit)

# 8) Текст промпта. Можно редактировать. Доступные подстановки:
#      {NAME}      — название продукта, например "Миндаль (almonds)"
#      {SLUG}      — id продукта на английском, например "almonds"
#      {STRUCTURE} — JSON-образец структуры
#    Первая строка — ваш исходный промпт; ниже — технические требования,
#    без которых ответ нельзя надёжно разделить на два файла.
PROMPT_TEMPLATE = """\
Создай информацию о продукте {NAME} на основе вот такой структуры на русском и английском:
{STRUCTURE}

Требования к ответу:
- Верни ТОЛЬКО валидный JSON, без markdown-обёртки и без пояснений.
- Формат ответа: {"ru": <объект по структуре на русском>, "en": <объект по структуре на английском>}.
- Структуру образца сохрани точно: те же поля, тот же порядок секций, та же вложенность (title / content / items).
- Значение "id" в обоих объектах одинаковое: "{SLUG}".
- Значение "image" в обоих объектах: "/products/{SLUG}.png".
- Тексты должны быть фактически точными и написаны в том же стиле, что и образец.
"""

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║                     КОНЕЦ НАСТРОЕК — ДАЛЬШЕ НЕ ТРОГАТЬ                   ║
# ╚══════════════════════════════════════════════════════════════════════════╝


# ─────────────────────────────── Работа с файлами ───────────────────────────

def load_json(source: str):
    """Загружает JSON из локального файла или по ссылке."""
    if source.startswith(("http://", "https://")):
        response = requests.get(source, timeout=30)
        response.raise_for_status()
        return response.json()
    return json.loads(Path(source).read_text(encoding="utf-8"))


def save_json(path: Path, data: dict) -> None:
    """Сохраняет JSON в UTF-8 (кириллица остаётся читаемой, а не \\u0412...)."""
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ─────────────────────────── Извлечение имён продуктов ──────────────────────

def slugify(text: str) -> str:
    """'Грецкий орех' -> '' (кириллица убирается), 'Brazil nut' -> 'brazil-nut'."""
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def extract_products(data) -> list[dict]:
    """
    Достаёт из JSON список продуктов вида {"name": ..., "slug": ...}.

    name — что подставляется в промпт (вместо xxxxx);
    slug — id продукта, он же имя файла (almonds -> almonds.json).
    """
    items = data if isinstance(data, list) else [data]
    products = []

    for item in items:
        if isinstance(item, str):
            title, item_id = item, None
        elif isinstance(item, dict):
            title = item.get("title") or item.get("name") or item.get("id")
            item_id = item.get("id")
        else:
            continue

        if not title:
            continue

        slug = item_id or slugify(title)
        if not slug:
            # Название на кириллице без id — slug получить нельзя.
            print(f"⚠ Пропускаю «{title}»: нет поля id, а из названия slug не построить.")
            continue

        # Если id отличается от названия, добавляем его в скобках —
        # это помогает модели однозначно понять продукт: "Миндаль (almonds)".
        name = f"{title} ({slug})" if slug != title else title
        products.append({"name": name, "slug": slug})

    return products


# ─────────────────────────── Запрос к Gemini и проверка ─────────────────────

def build_prompt(name: str, slug: str, structure: str) -> str:
    """Подставляет значения в PROMPT_TEMPLATE."""
    return (
        PROMPT_TEMPLATE
        .replace("{NAME}", name)
        .replace("{SLUG}", slug)
        .replace("{STRUCTURE}", structure)
    )


def validate(result: dict, template: dict) -> list[str]:
    """
    Проверяет, что ответ Gemini повторяет структуру образца.
    Возвращает список найденных проблем (пустой список = всё в порядке).
    """
    problems = []

    for lang in ("ru", "en"):
        if lang not in result:
            problems.append(f"нет ключа '{lang}'")
            continue

        obj = result[lang]

        missing = set(template) - set(obj)
        if missing:
            problems.append(f"[{lang}] не хватает полей: {sorted(missing)}")

        if len(obj.get("content", [])) != len(template.get("content", [])):
            problems.append(
                f"[{lang}] число секций content = {len(obj.get('content', []))}, "
                f"а в образце {len(template.get('content', []))}"
            )

    return problems


def generate_product(client, name: str, slug: str, structure: str, template: dict) -> dict:
    """Один запрос к Gemini с повторами при ошибках. Возвращает {"ru": ..., "en": ...}."""
    prompt = build_prompt(name, slug, structure)
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                # Просим Gemini вернуть именно JSON — так меньше мусора вокруг.
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            result = json.loads(response.text)

            problems = validate(result, template)
            if problems:
                raise ValueError("; ".join(problems))

            return result

        except Exception as error:
            last_error = error
            print(f"   попытка {attempt}/{MAX_RETRIES} не удалась: {error}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SEC)

    raise RuntimeError(f"не удалось получить корректный ответ: {last_error}")


# ─────────────────────────────────── main ───────────────────────────────────

def main() -> None:
    # --- Шаг 0. Проверка настроек ---
    if not GEMINI_API_KEY:
        sys.exit(
            "Не задан API-ключ. Укажите GEMINI_API_KEY в секции НАСТРОЙКИ "
            "или переменной окружения."
        )

    # --- Шаг 1. Читаем продукты ---
    print(f"Загружаю список продуктов: {PRODUCTS_SOURCE}")
    source_data = load_json(PRODUCTS_SOURCE)
    products = extract_products(source_data)
    if not products:
        sys.exit("В источнике не найдено ни одного продукта.")
    print(f"Найдено продуктов: {len(products)}")

    # --- Шаг 2. Читаем структуру-образец ---
    template = load_json(TEMPLATE_FILE) if TEMPLATE_FILE else source_data
    if isinstance(template, list):
        template = template[0]
    if not isinstance(template, dict) or "content" not in template:
        sys.exit(
            "Образец структуры должен быть объектом с полем 'content'. "
            "Укажите корректный TEMPLATE_FILE."
        )
    structure = json.dumps(template, ensure_ascii=False, indent=2)

    # --- Шаг 3. Готовим папки ru/ и en/ ---
    ru_dir = Path(OUTPUT_DIR) / RU_DIR_NAME
    en_dir = Path(OUTPUT_DIR) / EN_DIR_NAME
    ru_dir.mkdir(parents=True, exist_ok=True)
    en_dir.mkdir(parents=True, exist_ok=True)

    client = genai.Client(api_key=GEMINI_API_KEY)

    # --- Шаг 4. Обрабатываем каждый продукт ---
    done, skipped, failed = 0, 0, []

    for index, product in enumerate(products, start=1):
        name, slug = product["name"], product["slug"]
        ru_path, en_path = ru_dir / f"{slug}.json", en_dir / f"{slug}.json"

        print(f"\n[{index}/{len(products)}] {name}")

        if SKIP_EXISTING and ru_path.exists() and en_path.exists():
            print("   уже существует — пропускаю")
            skipped += 1
            continue

        try:
            result = generate_product(client, name, slug, structure, template)
        except RuntimeError as error:
            print(f"   ✗ {error}")
            failed.append(name)
            continue

        save_json(ru_path, result["ru"])
        save_json(en_path, result["en"])
        print(f"   ✓ сохранено: {ru_path}  и  {en_path}")
        done += 1

        if index < len(products):
            time.sleep(PAUSE_BETWEEN_PRODUCTS_SEC)

    # --- Шаг 5. Итог ---
    print("\n" + "─" * 50)
    print(f"Создано: {done} | Пропущено: {skipped} | Ошибок: {len(failed)}")
    if failed:
        print("Не удались: " + ", ".join(failed))


if __name__ == "__main__":
    main()
