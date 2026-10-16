#!/usr/bin/env python3
"""Удаляет поля foodSources, foodSourcesNotesHtml, rdiHtml, foodSourcesIntro
из каждой записи JSON-файла.

Использование:
    python remove_keys.py input.json [output.json]

Если output не указан, результат сохраняется в input.cleaned.json
"""
import json
import sys
from pathlib import Path

KEYS_TO_REMOVE = {"foodsources", "foodsourcesnoteshtml", "rdihtml", "foodsourcesintro"}


def load_json(text: str) -> dict:
    """Загружает JSON. Если это фрагмент без внешних скобок
    (как "vitamin-a": {...}, "vitamin-b1": {...},), оборачивает его в {}."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        fragment = text.rstrip(",").strip()
        return json.loads("{" + fragment + "}")


def clean(node):
    """Рекурсивно удаляет ключи (без учета регистра)."""
    if isinstance(node, dict):
        return {k: clean(v) for k, v in node.items() if k.lower() not in KEYS_TO_REMOVE}
    if isinstance(node, list):
        return [clean(i) for i in node]
    return node


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".cleaned.json")

    data = clean(load_json(src.read_text(encoding="utf-8")))
    dst.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Готово: {dst}")


if __name__ == "__main__":
    main()
