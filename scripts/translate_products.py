#!/usr/bin/env python3
"""
Переводит поле "name" у каждой записи в products.json с английского на русский
через Google Cloud Translation API v3, подключённый по discovery-документу:
    https://translate.googleapis.com/$discovery/rest?version=v3

Установка:
    pip install google-api-python-client google-auth

Аутентификация (v3 требует OAuth, а не просто API-ключ):
    * Application Default Credentials:  gcloud auth application-default login
    * или сервисный аккаунт:            --credentials key.json
      (роль «Cloud Translation API User», API должен быть включён в проекте)

Примеры:
    python translate_products.py --project my-gcp-project
    python translate_products.py --project my-gcp-project --credentials key.json --keep-original

Особенности:
    * Переводятся только уникальные названия, пакетами.
    * Кэш (translation_cache.json): при обрыве можно запустить скрипт снова.
    * Исходный файл не изменяется, результат пишется в новый файл.
"""

import argparse
import json
import os
import sys

DISCOVERY_URL = "https://translate.googleapis.com/$discovery/rest?version=v3"
SCOPES = ["https://www.googleapis.com/auth/cloud-translation"]
SOURCE_LANG = "en"
TARGET_LANG = "ru"

# Ограничения translateText: contents <= 1024 элементов,
# рекомендуется суммарно < 30 000 символов (codepoints) на запрос.
MAX_ITEMS = 100
MAX_CHARS = 20000


def build_service(credentials_path, api_key):
    """Создаёт клиент Translation v3 из discovery-документа."""
    try:
        from googleapiclient.discovery import build
        import google.auth
        from google.oauth2 import service_account
    except ImportError:
        sys.exit("Установите зависимости: pip install google-api-python-client google-auth")

    creds, default_project = None, None
    if not api_key:
        if credentials_path:
            creds = service_account.Credentials.from_service_account_file(
                credentials_path, scopes=SCOPES)
            default_project = creds.project_id
        else:
            creds, default_project = google.auth.default(scopes=SCOPES)

    service = build(
        "translate", "v3",
        discoveryServiceUrl=DISCOVERY_URL,   # загружаем описание API по указанному URL
        static_discovery=False,              # не использовать встроенную копию
        credentials=creds,
        developerKey=api_key or None,
        cache_discovery=False,
    )
    return service, default_project


def make_batches(texts):
    """Делит список на пакеты по числу элементов и суммарной длине."""
    batch, size = [], 0
    for t in texts:
        if batch and (len(batch) >= MAX_ITEMS or size + len(t) > MAX_CHARS):
            yield batch
            batch, size = [], 0
        batch.append(t)
        size += len(t)
    if batch:
        yield batch


def translate_batch(service, parent, texts, model=None):
    """projects.locations.translateText: возвращает переводы в том же порядке."""
    body = {
        "contents": texts,
        "sourceLanguageCode": SOURCE_LANG,
        "targetLanguageCode": TARGET_LANG,
        "mimeType": "text/plain",   # по умолчанию API считает вход HTML
    }
    if model:
        body["model"] = model
    resp = service.projects().locations().translateText(
        parent=parent, body=body
    ).execute(num_retries=5)        # повтор при 429/5xx
    result = [t.get("translatedText", "") for t in resp.get("translations", [])]
    if len(result) != len(texts):
        raise RuntimeError("API вернул другое количество переводов, чем было отправлено")
    return result


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)  # атомарная запись


def main(service_factory=build_service):
    p = argparse.ArgumentParser(description="Перевод поля name на русский (Cloud Translation v3)")
    p.add_argument("--input", default="products.json")
    p.add_argument("--output", default="products_ru.json")
    p.add_argument("--cache", default="translation_cache.json")
    p.add_argument("--project", default=os.environ.get("GOOGLE_CLOUD_PROJECT", ""),
                   help="ID проекта Google Cloud (или GOOGLE_CLOUD_PROJECT)")
    p.add_argument("--location", default="global", help="регион (global по умолчанию)")
    p.add_argument("--credentials", default="", help="JSON-ключ сервисного аккаунта")
    p.add_argument("--api-key", default="", help="API-ключ (если ваш проект допускает ключ для v3)")
    p.add_argument("--model", default="", help="необязательно: полное имя модели")
    p.add_argument("--keep-original", action="store_true",
                   help="сохранить исходное название в поле name_en")
    args = p.parse_args()

    service, default_project = service_factory(args.credentials, args.api_key)
    project = args.project or default_project
    if not project:
        sys.exit("Укажите проект: --project ID или переменную GOOGLE_CLOUD_PROJECT")
    parent = f"projects/{project}/locations/{args.location}"

    products = load_json(args.input)
    if not isinstance(products, list):
        sys.exit("Ожидался JSON-массив записей")

    cache = load_json(args.cache, default={})
    names = [str(x["name"]).strip() for x in products if x.get("name")]
    todo = [n for n in dict.fromkeys(names) if n not in cache]
    print(f"Записей: {len(products)}, уникальных названий: {len(set(names))}, "
          f"осталось перевести: {len(todo)}")

    done = 0
    try:
        for batch in make_batches(todo):
            translated = translate_batch(service, parent, batch, args.model or None)
            cache.update(dict(zip(batch, translated)))
            save_json(args.cache, cache)
            done += len(batch)
            print(f"  переведено {done}/{len(todo)}")
    except Exception as e:  # HttpError, сеть, KeyboardInterrupt и т.д.
        save_json(args.cache, cache)
        sys.exit(f"\nОстановлено: {e}\nПрогресс сохранён в {args.cache}. "
                 f"Запустите скрипт снова, чтобы продолжить.")

    result = []
    for item in products:
        new_item = dict(item)
        original = item.get("name")
        if original:
            if args.keep_original:
                new_item["name_en"] = original
            new_item["name"] = cache.get(str(original).strip(), original)
        result.append(new_item)

    save_json(args.output, result)
    print(f"Готово. Результат: {args.output}")


if __name__ == "__main__":
    main()
