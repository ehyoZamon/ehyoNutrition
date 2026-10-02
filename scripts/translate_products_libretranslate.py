#!/usr/bin/env python3
"""
Переводит поле "name" у каждой записи в products.json
с английского на русский через локальный LibreTranslate.

По умолчанию:
    LibreTranslate: http://127.0.0.1:5000
    source: en
    target: ru

Особенности:
  * Использует только стандартную библиотеку Python 3.8+.
  * Переводит только уникальные названия.
  * Отправляет названия пакетами.
  * Сохраняет кэш translation_cache.json после каждого пакета.
  * При повторном запуске продолжает с места остановки.
  * Исходный products.json не изменяется.
  * Результат записывается в products_ru.json.

Пример:
    python translate_products_libretranslate.py

Другой URL LibreTranslate:
    python translate_products_libretranslate.py --url http://192.168.1.100:5000

Сохранить оригинальное название:
    python translate_products_libretranslate.py --keep-original
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request


SOURCE_LANG = "en"
TARGET_LANG = "ru"
DEFAULT_URL = "http://127.0.0.1:5000"
DEFAULT_BATCH_SIZE = 20


# --------------------------------------------------------------------------- #
# HTTP
# --------------------------------------------------------------------------- #

def http_request(url, payload=None, method="GET", retries=5):
    """HTTP-запрос с повторными попытками."""

    data = None
    headers = {
        "User-Agent": "products-translator/1.0",
        "Accept": "application/json",
    }

    if payload is not None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers["Content-Type"] = "application/json"

    last_error = None

    for attempt in range(retries):
        try:
            request = urllib.request.Request(
                url,
                data=data,
                headers=headers,
                method=method,
            )

            with urllib.request.urlopen(request, timeout=120) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw)

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            last_error = f"HTTP {e.code}: {body[:500]}"

            # Повторяем временные ошибки.
            if e.code not in (429, 500, 502, 503, 504):
                raise RuntimeError(last_error) from None

        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last_error = str(e)

        if attempt < retries - 1:
            delay = 2 ** attempt
            print(f"  Ошибка соединения. Повтор через {delay} сек...")
            time.sleep(delay)

    raise RuntimeError(
        f"Не удалось выполнить запрос к LibreTranslate: {last_error}"
    )


# --------------------------------------------------------------------------- #
# LibreTranslate
# --------------------------------------------------------------------------- #

def check_libretranslate(args):
    """Проверяет доступность LibreTranslate и наличие en/ru."""

    url = args.url.rstrip("/") + "/languages"

    print(f"Проверка LibreTranslate: {args.url}")

    try:
        languages = http_request(url)
    except Exception as e:
        raise RuntimeError(
            f"LibreTranslate недоступен по адресу {args.url}\n"
            f"Ошибка: {e}\n\n"
            f"Проверьте, что Docker-контейнер запущен:\n"
            f"  docker ps\n\n"
            f"И что порт опубликован:\n"
            f"  0.0.0.0:5000->5000/tcp"
        )

    available = {
        item.get("code")
        for item in languages
        if isinstance(item, dict)
    }

    missing = {SOURCE_LANG, TARGET_LANG} - available

    if missing:
        raise RuntimeError(
            "LibreTranslate работает, но отсутствуют языки: "
            + ", ".join(sorted(missing))
        )

    print("LibreTranslate доступен.")
    print("Языки: English (en) -> Russian (ru)")


def translate_libre(texts, args):
    """
    Отправляет пакет строк в LibreTranslate.

    LibreTranslate принимает q как строку или массив строк.
    Для self-hosted сервера API key не нужен.
    """

    payload = {
        "q": texts,
        "source": SOURCE_LANG,
        "target": TARGET_LANG,
        "format": "text",
    }

    if args.api_key:
        payload["api_key"] = args.api_key

    url = args.url.rstrip("/") + "/translate"

    response = http_request(
        url,
        payload=payload,
        method="POST",
    )

    if "error" in response:
        raise RuntimeError(
            f"LibreTranslate: {response['error']}"
        )

    translated = response.get("translatedText")

    if translated is None:
        raise RuntimeError(
            f"LibreTranslate вернул неожиданный ответ: {response}"
        )

    if isinstance(translated, str):
        translated = [translated]

    if not isinstance(translated, list):
        raise RuntimeError(
            f"Неожиданный формат translatedText: {type(translated).__name__}"
        )

    return translated


# --------------------------------------------------------------------------- #
# JSON
# --------------------------------------------------------------------------- #

def load_json(path, default=None):
    if not os.path.exists(path):
        return default

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path, data):
    """Атомарно сохраняет JSON."""

    tmp = path + ".tmp"

    with open(tmp, "w", encoding="utf-8") as file:
        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=2,
        )

    os.replace(tmp, path)


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

def main():
    parser = argparse.ArgumentParser(
        description="Перевод поля name в products.json через LibreTranslate"
    )

    parser.add_argument(
        "--input",
        default="products.json",
        help="входной JSON-файл",
    )

    parser.add_argument(
        "--output",
        default="products_ru.json",
        help="выходной JSON-файл",
    )

    parser.add_argument(
        "--cache",
        default="translation_cache.json",
        help="кэш переводов",
    )

    parser.add_argument(
        "--url",
        default=DEFAULT_URL,
        help=f"URL LibreTranslate (по умолчанию: {DEFAULT_URL})",
    )

    parser.add_argument(
        "--api-key",
        default=os.environ.get("TRANSLATE_API_KEY", ""),
        help="API key, если он требуется сервером LibreTranslate",
    )

    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help=f"размер пакета (по умолчанию: {DEFAULT_BATCH_SIZE})",
    )

    parser.add_argument(
        "--keep-original",
        action="store_true",
        help="сохранить английское название в поле name_en",
    )

    args = parser.parse_args()

    if args.batch_size < 1:
        sys.exit("--batch-size должен быть больше 0")

    # Проверяем LibreTranslate ДО чтения products.json.
    try:
        check_libretranslate(args)
    except RuntimeError as error:
        sys.exit(f"\nОшибка:\n{error}")

    products = load_json(args.input)

    if not isinstance(products, list):
        sys.exit("Ожидался JSON-массив записей")

    cache = load_json(args.cache, default={})

    if not isinstance(cache, dict):
        sys.exit(f"Файл кэша {args.cache} должен содержать JSON-объект")

    # Уникальные названия.
    names = [
        str(item["name"]).strip()
        for item in products
        if isinstance(item, dict) and item.get("name")
    ]

    unique_names = list(dict.fromkeys(names))
    todo = [
        name
        for name in unique_names
        if name not in cache
    ]

    print()
    print(f"Записей:                 {len(products)}")
    print(f"Уникальных названий:     {len(unique_names)}")
    print(f"Уже есть в кэше:         {len(unique_names) - len(todo)}")
    print(f"Осталось перевести:      {len(todo)}")
    print(f"Размер пакета:           {args.batch_size}")
    print()

    if not todo:
        print("Все названия уже есть в кэше.")
    else:
        try:
            for i in range(0, len(todo), args.batch_size):
                batch = todo[i:i + args.batch_size]

                print(
                    f"Переводим пакет "
                    f"{i + 1}-{i + len(batch)} из {len(todo)}..."
                )

                translated = translate_libre(batch, args)

                if len(translated) != len(batch):
                    raise RuntimeError(
                        "LibreTranslate вернул другое количество "
                        "переводов, чем было отправлено"
                    )

                cache.update(
                    dict(zip(batch, translated))
                )

                # Сохраняем после каждого пакета.
                save_json(args.cache, cache)

                print(
                    f"  Готово: "
                    f"{min(i + len(batch), len(todo))}/{len(todo)}"
                )

        except (RuntimeError, KeyboardInterrupt) as error:
            save_json(args.cache, cache)

            sys.exit(
                f"\nОстановлено: {error}\n"
                f"Прогресс сохранён в {args.cache}.\n"
                f"Запустите скрипт снова, чтобы продолжить."
            )

    # Создаём итоговый файл.
    result = []

    for item in products:
        new_item = dict(item)
        original = item.get("name")

        if original:
            original_text = str(original).strip()

            if args.keep_original:
                new_item["name_en"] = original

            new_item["name"] = cache.get(
                original_text,
                original,
            )

        result.append(new_item)

    save_json(args.output, result)

    print()
    print(f"Готово.")
    print(f"Результат: {args.output}")
    print(f"Кэш:      {args.cache}")


if __name__ == "__main__":
    main()
