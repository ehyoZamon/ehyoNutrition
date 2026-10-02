#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
usda_import.py — импорт продуктов из большого JSON-файла USDA (FoodData Central).

Для каждой записи скрипт:
  1) создаёт файл продукта <slug>.json (формат как apples.json / almonds.json);
  2) добавляет запись {id, name, category, calories, image, favorite, link} в конец products.json.

Имя файла продукта всегда совпадает с последней частью link
(link "/productinfo/soy-sauce"  ->  soy-sauce.json).

id и slug нутриентов берутся из vitamin-dri.json: нутриент попадает в файл продукта
только если его slug есть в vitamin-dri.json.

Поддерживаются форматы USDA:
  * {"SRLegacyFoods": [...]}, {"FoundationFoods": [...]}, {"SurveyFoods": [...]}
  * простой массив [...]
  * фрагмент: записи {...},{...},{...} без обёртки (как в присланных 20 записях)
Файл читается потоком, в память целиком не загружается.

Запуск:
  python usda_import.py                      # задаст вопросы (файлы/папки)
  python usda_import.py --review             # подтверждать каждый продукт вручную
  python usda_import.py --source big.json --dri vitamin-dri.json \
         --products products.json --out ./productinfo --yes --limit 100
"""
import argparse
import atexit
import json
import math
import os
import re
import shutil
import sys
import unicodedata

# ----------------------------------------------------------------------------
# Настройки формата
# ----------------------------------------------------------------------------
MACRO_TITLE = "Macro Nutrients (per 100g)"
MICRO_TITLE = "Micro Nutrients (per 100g)"
IMAGE_TEMPLATE = "/products/{category}.png"  # image = категория продукта + .png
LINK_TEMPLATE = "/productinfo/{slug}"
FLUSH_EVERY = 50  # как часто дописывать products.json
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SETTINGS_FILE = os.path.join(SCRIPT_DIR, "usda_import_settings.json")
CATEGORY_MAP_FILE = os.path.join(SCRIPT_DIR, "usda_category_map.json")

# ----------------------------------------------------------------------------
# Нутриенты: (slug, name, [id нутриентов USDA по приоритету], единица)
# Кандидат-кортеж (a, b) означает СУММУ нутриентов (например EPA + DHA).
# Порядок списка = порядок в файле продукта.
# ----------------------------------------------------------------------------
MACRO = [
    ("protein", "Protein", [1003], "g"),
    ("carbohydrates", "Carbohydrates", [1005], "g"),
    ("fats", "Fats", [1004], "g"),
    ("fiber", "Fiber", [1079], "g"),
]

MICRO = [
    ("vitamin-c", "Vitamin C", [1162], "mg"),
    ("vitamin-d", "Vitamin D", [1114], "mcg"),
    ("vitamin-a", "Vitamin A", [1106], "mcg RAE"),
    ("vitamin-e", "Vitamin E", [1109], "mg"),
    ("vitamin-k", "Vitamin K", [1185], "mcg"),
    ("vitamin-b1", "Vitamin B1", [1165], "mg"),
    ("vitamin-b2", "Vitamin B2", [1166], "mg"),
    ("vitamin-b3", "Vitamin B3", [1167], "mg"),
    ("vitamin-b5", "Vitamin B5", [1170], "mg"),
    ("vitamin-b6", "Vitamin B6", [1175], "mg"),
    ("vitamin-b7", "Vitamin B7", [1176], "mcg"),
    ("vitamin-b9", "Vitamin B9", [1190], "mcg DFE"),
    ("vitamin-b12", "Vitamin B12", [1178], "mcg"),
    ("histidine", "Histidine", [1221], "g"),
    ("isoleucine", "Isoleucine", [1212], "g"),
    ("leucine", "Leucine", [1213], "g"),
    ("lysine", "Lysine", [1214], "g"),
    ("methionine", "Methionine", [1215], "g"),
    ("phenylalanine", "Phenylalanine", [1217], "g"),
    ("threonine", "Threonine", [1211], "g"),
    ("tryptophan", "Tryptophan", [1210], "g"),
    ("valine", "Valine", [1219], "g"),
    ("alpha-linolenic-acid", "Alpha-Linolenic Acid", [1404, 1270], "g"),
    ("epa-dha", "EPA & DHA", [(1278, 1272)], "g"),
    ("calcium", "Calcium", [1087], "mg"),
    ("phosphorus", "Phosphorus", [1091], "mg"),
    ("magnesium", "Magnesium", [1090], "mg"),
    ("sodium", "Sodium", [1093], "mg"),
    ("potassium", "Potassium", [1092], "mg"),
    ("chloride", "Chloride", [1088], "mg"),
    ("sulfur", "Sulfur", [1094], "mg"),
    ("iron", "Iron", [1089], "mg"),
    ("zinc", "Zinc", [1095], "mg"),
    ("copper", "Copper", [1098], "mg"),
    ("manganese", "Manganese", [1101], "mg"),
    ("iodine", "Iodine", [1100], "mcg"),
    ("selenium", "Selenium", [1103], "mcg"),
    ("chromium", "Chromium", [1096], "mcg"),
    ("molybdenum", "Molybdenum", [1102], "mcg"),
    ("fluoride", "Fluoride", [1099], "mcg"),
    ("lutein", "Lutein", [1123], "mcg"),          # USDA: Lutein + zeaxanthin
    ("beta-carotene", "Beta-carotene", [1107], "mcg"),
    ("lycopene", "Lycopene", [1122], "mcg"),
    ("choline", "Choline", [1180], "mg"),
    ("betaine", "Betaine", [1198], "mg"),
    ("phytosterols", "Phytosterols", [1283], "mg"),
    ("omega-6", "Omega-6 fatty acids", [1269, 1316], "g"),   # линолевая 18:2
    ("omega-9", "Omega-9 fatty acids", [1268, 1315], "g"),   # олеиновая 18:1
    ("arginine", "Arginine", [1220], "g"),
    ("glycine", "Glycine", [1225], "g"),
    ("tyrosine", "Tyrosine", [1218], "g"),
    ("cysteine", "Cysteine", [1216], "g"),        # USDA: Cystine
]

# ----------------------------------------------------------------------------
# Категории USDA -> категории products.json
# ----------------------------------------------------------------------------
CATEGORY_MAP = {
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
    "beverages": "food/beverages",
    "sweets": "food/snacks and sweets",
    "snacks": "food/snacks and sweets",
}

# Запасные правила по ключевым словам (для WWEIA-категорий FNDDS и т.п.)
CATEGORY_RULES = [
    (r"\b(milk|dairy|cheese|yogurt|cream|eggs?|kefir|butter)\b", "food/eggs and dairy"),
    (r"\b(fish|shellfish|seafood|shrimp|crab|salmon|tuna)\b", "food/seafood"),
    (r"\b(beef|pork|poultry|chicken|turkey|lamb|veal|sausage|meats?|ham|bacon)\b", "food/meat"),
    (r"\b(beans?|legumes?|lentils?|peas|soy|tofu)\b", "food/legumes"),
    (r"\b(nuts?|seeds?)\b", "food/seeds and nuts"),
    (r"\bfruits?\b|\b(berries|apples?|bananas?|citrus|melons?)\b", "food/fruits"),
    (r"\b(vegetables?|potatoes?|tomatoes?|lettuce|greens)\b", "food/vegetables"),
    (r"\b(rice|pasta|bread|cereals?|grains?|oats?|noodles?|flour)\b", "food/grains and cereals"),
    (r"\boils?\b|\bfats and oils\b", "food/oils and fats"),
    (r"\b(spices?|herbs?|condiments?|sauces?|seasonings?)\b", "food/herbs and spices"),
    (r"\b(beverages?|juice|coffee|tea|soda|drinks?|water)\b", "food/beverages"),
    (r"\b(candy|sweets?|snacks?|cookies?|cakes?|desserts?|chips|chocolate)\b", "food/snacks and sweets"),
]

# ----------------------------------------------------------------------------
# Единицы
# ----------------------------------------------------------------------------
UG_PER = {"g": 1e6, "mg": 1e3, "ug": 1.0}


def norm_unit(u):
    if not u:
        return None
    u = u.strip().lower().replace("µ", "u").replace("μ", "u")
    return {"mcg": "ug"}.get(u, u)


def convert(amount, from_unit, to_unit):
    if from_unit == to_unit:
        return amount
    if from_unit in UG_PER and to_unit in UG_PER:
        return amount * UG_PER[from_unit] / UG_PER[to_unit]
    return None


def fmt_num(x):
    """До 4 значащих цифр, без экспоненты и хвостовых нулей."""
    if x == 0:
        return "0"
    if abs(x) >= 1000:
        return str(int(round(x)))
    exp = math.floor(math.log10(abs(x)))
    decimals = max(0, 3 - exp)
    s = f"{round(x, decimals):.{decimals}f}"
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    return s or "0"


def slugify(text):
    text = text.replace("'", "").replace("’", "")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text[:90].strip("-")


def category_slug(category):
    """'food/seeds and nuts' -> 'seeds-and-nuts'"""
    return slugify(category.split("/")[-1]) or "other"


# ----------------------------------------------------------------------------
# Потоковое чтение большого JSON
# ----------------------------------------------------------------------------
def iter_records(path, chunk_size=1 << 22, max_record_bytes=64 << 20):
    """Последовательно отдаёт записи-объекты из файла USDA, не загружая файл целиком."""
    decoder = json.JSONDecoder()
    wrapper_re = re.compile(r'\{\s*"[^"]+"\s*:\s*\[')
    with open(path, "r", encoding="utf-8-sig") as f:
        st = {"buf": "", "pos": 0, "eof": False}

        def fill():
            data = f.read(chunk_size)
            if not data:
                st["eof"] = True
                return False
            st["buf"] = st["buf"][st["pos"]:] + data
            st["pos"] = 0
            return True

        def skip(chars):
            """Пропускает символы из chars; False, если файл закончился."""
            while True:
                buf, pos = st["buf"], st["pos"]
                while pos < len(buf) and buf[pos] in chars:
                    pos += 1
                st["pos"] = pos
                if pos < len(buf):
                    return True
                if not fill():
                    return False

        fill()
        if not skip(" \t\r\n"):
            return
        # Определяем структуру файла
        while len(st["buf"]) - st["pos"] < 512 and fill():
            pass
        head = st["buf"][st["pos"]:]
        if head[0] == "[":
            st["pos"] += 1
        elif head[0] == "{":
            m = wrapper_re.match(head)
            if m:  # {"SurveyFoods": [ ... ]}
                st["pos"] += m.end()

        while True:
            if not skip(" \t\r\n,"):
                return
            c = st["buf"][st["pos"]]
            if c in "]}":
                st["pos"] += 1
                continue
            if c != "{":
                raise ValueError(f"Неожиданный символ {c!r} при чтении {path}")
            try:
                obj, end = decoder.raw_decode(st["buf"], st["pos"])
            except json.JSONDecodeError as e:
                if st["eof"] or len(st["buf"]) - st["pos"] > max_record_bytes:
                    raise ValueError(f"Ошибка разбора JSON в {path}: {e}") from e
                fill()
                continue
            st["pos"] = end
            yield obj


# ----------------------------------------------------------------------------
# Извлечение данных
# ----------------------------------------------------------------------------
def nutrient_table(rec):
    table = {}
    for fn in rec.get("foodNutrients") or []:
        n = fn.get("nutrient") or {}
        nid, amt = n.get("id"), fn.get("amount")
        if nid is None or amt is None:
            continue
        try:
            table.setdefault(int(nid), (float(amt), norm_unit(n.get("unitName"))))
        except (TypeError, ValueError):
            continue
    return table


def get_kcal(table):
    for nid in (1008, 2047, 2048):
        if nid in table and table[nid][1] == "kcal":
            return table[nid][0]
    if 1062 in table and table[1062][1] == "kj":
        return table[1062][0] / 4.184
    return None


def get_amount(table, candidates, target_unit):
    for cand in candidates:
        ids = cand if isinstance(cand, tuple) else (cand,)
        total = None
        for nid in ids:
            if nid in table:
                v = convert(table[nid][0], table[nid][1], target_unit)
                if v is not None:
                    total = (total or 0.0) + v
        if total is not None:
            return total
    return None


def usda_category(rec):
    fc = rec.get("foodCategory")
    if isinstance(fc, dict) and fc.get("description"):
        return fc["description"].strip()
    if isinstance(fc, str) and fc.strip():
        return fc.strip()
    w = rec.get("wweiaFoodCategory")
    if isinstance(w, dict) and w.get("wweiaFoodCategoryDescription"):
        return w["wweiaFoodCategoryDescription"].strip()
    if rec.get("brandedFoodCategory"):
        return str(rec["brandedFoodCategory"]).strip()
    return ""


def build_product(rec, dri_slugs, name, slug, category):
    """Возвращает (dict файла продукта, kcal) либо (None, причина)."""
    table = nutrient_table(rec)
    kcal = get_kcal(table)
    if kcal is None:
        return None, "нет данных о калориях"

    macro = [{"id": "calories", "name": "Calories", "slug": "", "amount": f"{int(round(kcal))} kcal"}]
    for nslug, nname, cands, unit in MACRO:
        if nslug not in dri_slugs:
            continue
        v = get_amount(table, cands, norm_unit(unit.split()[0]))
        if v is not None:
            macro.append({"id": nslug, "name": nname, "slug": nslug, "amount": f"{fmt_num(v)} {unit}"})

    micro = []
    for nslug, nname, cands, unit in MICRO:
        if nslug not in dri_slugs:
            continue
        v = get_amount(table, cands, norm_unit(unit.split()[0]))
        if v is not None:
            micro.append({"id": nslug, "name": nname, "slug": nslug, "amount": f"{fmt_num(v)} {unit}"})

    return {
        "slug": slug,
        "name": name,
        "category": category,
        "macroTitle": MACRO_TITLE,
        "macroNutrients": macro,
        "microTitle": MICRO_TITLE,
        "microNutrients": micro,
    }, int(round(kcal))


# ----------------------------------------------------------------------------
# Ввод-вывод, диалоги
# ----------------------------------------------------------------------------
def load_json_file(path, default=None):
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def dialog(kind, title):
    try:
        import tkinter
        from tkinter import filedialog
        root = tkinter.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        res = filedialog.askdirectory(title=title) if kind == "dir" else \
            filedialog.askopenfilename(title=title, filetypes=[("JSON", "*.json"), ("Все файлы", "*.*")])
        root.destroy()
        return res or ""
    except Exception as e:  # tkinter может отсутствовать
        print(f"  (диалог недоступен: {e})")
        return ""


def ask_path(label, default, kind="file", must_exist=True):
    """kind: 'file' | 'dir'. Ввод '?' открывает окно выбора."""
    while True:
        hint = f" [{default}]" if default else ""
        raw = input(f"{label}{hint}\n  путь (или ? для окна выбора): ").strip().strip('"').strip("'")
        if raw == "?":
            raw = dialog(kind, label)
        if not raw:
            raw = default or ""
        raw = os.path.expanduser(raw)
        if not raw:
            print("  Нужно указать путь.")
            continue
        if kind == "dir":
            if os.path.isdir(raw) or not must_exist:
                return raw
            if input(f"  Папки '{raw}' нет. Создать? [Y/n]: ").strip().lower() in ("", "y", "д", "да"):
                os.makedirs(raw, exist_ok=True)
                return raw
        elif os.path.isfile(raw) or not must_exist:
            return raw
        else:
            print(f"  Файл не найден: {raw}")


class ProductsIndex:
    """products.json: чтение, добавление в конец, безопасная запись."""

    def __init__(self, path):
        self.path = path
        with open(path, "rb") as f:
            raw = f.read()
        text = raw.decode("utf-8-sig")
        self.crlf = "\r\n" in text
        self.trailing_newline = text.endswith("\n")
        self.has_bom = raw.startswith(b"\xef\xbb\xbf")
        self.items = json.loads(text)
        if not isinstance(self.items, list):
            raise ValueError("products.json должен быть массивом")
        self.links = {str(i.get("link", "")).lower() for i in self.items}
        self.next_id = max((int(i.get("id", 0)) for i in self.items), default=0) + 1
        self.pending = 0
        self.backed_up = False

    def categories(self):
        return sorted({i.get("category") for i in self.items if i.get("category")})

    def add(self, name, category, calories, slug):
        entry = {
            "id": self.next_id,
            "name": name,
            "category": category,
            "calories": calories,
            "image": IMAGE_TEMPLATE.format(category=category_slug(category)),
            "favorite": False,
            "link": LINK_TEMPLATE.format(slug=slug),
        }
        self.next_id += 1
        self.items.append(entry)
        self.links.add(entry["link"].lower())
        self.pending += 1
        if self.pending >= FLUSH_EVERY:
            self.flush()
        return entry

    def flush(self):
        if not self.pending:
            return
        if not self.backed_up:
            shutil.copyfile(self.path, self.path + ".bak")
            self.backed_up = True
        text = json.dumps(self.items, indent=2, ensure_ascii=False)
        if self.trailing_newline:
            text += "\n"
        if self.crlf:
            text = text.replace("\n", "\r\n")
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8-sig" if self.has_bom else "utf-8", newline="") as f:
            f.write(text)
        os.replace(tmp, self.path)
        self.pending = 0


class CategoriesFile:
    """Отдельный файл со списком категорий: [{id, name, slug, image}, ...].
    Существующие записи сохраняются, новые категории дописываются в конец."""

    def __init__(self, path):
        self.path = path
        data = load_json_file(path, None)
        self.items = data if isinstance(data, list) else []
        self.names = {str(i.get("name", "")).lower() for i in self.items}
        self.next_id = max((int(i.get("id", 0)) for i in self.items), default=0) + 1
        self.dirty = not os.path.exists(path)

    def add(self, name):
        if not name or name.lower() in self.names:
            return
        slug = category_slug(name)
        self.items.append({
            "id": self.next_id,
            "name": name,
            "slug": slug,
            "image": IMAGE_TEMPLATE.format(category=slug),
        })
        self.names.add(name.lower())
        self.next_id += 1
        self.dirty = True

    def flush(self):
        if not self.dirty:
            return
        os.makedirs(os.path.dirname(os.path.abspath(self.path)), exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(self.items, f, indent=2, ensure_ascii=False)
            f.write("\n")
        self.dirty = False


class CategoryResolver:
    def __init__(self, index, interactive, default_category):
        self.index = index
        self.interactive = interactive  # оставлено для совместимости, вопросов не задаёт
        self.default = default_category
        self.learned = load_json_file(CATEGORY_MAP_FILE, {}) or {}

    def resolve(self, usda_cat):
        key = usda_cat.lower().strip()
        if key in self.learned:
            return self.learned[key]
        if key in CATEGORY_MAP:
            return CATEGORY_MAP[key]
        for pattern, target in CATEGORY_RULES:
            if re.search(pattern, key):
                return target
        return self._ask(usda_cat, key)

    def _ask(self, usda_cat, key):
        """Неизвестная категория: без вопросов создаём новую food/<категория USDA>."""
        name = re.sub(r"\s+", " ", usda_cat.lower().replace(",", " ")).strip()
        choice = "food/" + name if name else self.default
        self.learned[key] = choice
        with open(CATEGORY_MAP_FILE, "w", encoding="utf-8") as f:
            json.dump(self.learned, f, indent=2, ensure_ascii=False)
        print(f"  * новая категория: «{usda_cat}» -> {choice}")
        return choice


def write_product_file(out_dir, slug, data):
    path = os.path.join(out_dir, slug + ".json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return path


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------
def parse_args():
    ap = argparse.ArgumentParser(description="Импорт продуктов USDA -> products.json + файлы продуктов")
    ap.add_argument("--source", help="большой JSON-файл USDA")
    ap.add_argument("--dri", help="vitamin-dri.json (источник slug нутриентов)")
    ap.add_argument("--products", help="products.json, куда дописывать записи")
    ap.add_argument("--out", help="папка для файлов продуктов")
    ap.add_argument("--categories", help="файл со списком категорий (по умолчанию categories.json рядом с products.json)")
    ap.add_argument("--review", action="store_true", help="подтверждать каждый продукт (можно править имя и link)")
    ap.add_argument("--overwrite", action="store_true", help="перезаписывать существующие файлы продуктов")
    ap.add_argument("--yes", action="store_true", help="не задавать вопросов (все пути должны быть заданы)")
    ap.add_argument("--skip", type=int, default=0, help="пропустить первые N записей источника")
    ap.add_argument("--limit", type=int, default=0, help="обработать не более N записей источника (0 = все)")
    ap.add_argument("--default-category", default="food/other", help="категория, если у записи USDA нет категории (по умолчанию food/other)")
    return ap.parse_args()


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    args = parse_args()
    saved = load_json_file(SETTINGS_FILE, {}) or {}
    interactive = not args.yes

    def get(name, label, kind="file", must_exist=True):
        val = getattr(args, name)
        if val:
            return val
        if not interactive:
            sys.exit(f"Укажите --{name} (режим --yes).")
        return ask_path(label, saved.get(name), kind, must_exist)

    source = get("source", "1) Большой JSON-файл USDA с записями продуктов")
    products_path = get("products", "2) Файл products.json (куда добавлять записи)")
    out_dir = get("out", "3) Папка, где создавать файлы продуктов", "dir", must_exist=False)
    dri_path = get("dri", "4) Файл vitamin-dri.json (список slug нутриентов)")
    os.makedirs(out_dir, exist_ok=True)

    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump({"source": source, "products": products_path, "out": out_dir, "dri": dri_path},
                  f, indent=2, ensure_ascii=False)

    dri = load_json_file(dri_path)
    if not isinstance(dri, dict):
        sys.exit("vitamin-dri.json должен быть объектом {slug: {...}}")
    dri_slugs = {v.get("slug", k) for k, v in dri.items()} | set(dri.keys())
    unknown = [s for s, *_ in MACRO + MICRO if s not in dri_slugs]
    if unknown:
        print("В vitamin-dri.json нет slug (эти нутриенты будут пропущены): " + ", ".join(unknown))

    index = ProductsIndex(products_path)
    atexit.register(index.flush)
    categories = CategoryResolver(index, interactive, args.default_category)
    categories_path = args.categories or os.path.join(os.path.dirname(os.path.abspath(products_path)), "categories.json")
    categories_file = CategoriesFile(categories_path)
    for c in index.categories():  # уже существующие категории products.json
        categories_file.add(c)
    atexit.register(categories_file.flush)

    stats = {"created": 0, "exists": 0, "no_data": 0, "no_name": 0, "declined": 0}
    seen = 0
    print(f"\nЧитаю {source} ... (следующий id: {index.next_id})\n")
    try:
        for rec in iter_records(source):
            seen += 1
            if seen <= args.skip:
                continue
            if args.limit and seen - args.skip > args.limit:
                break

            name = (rec.get("description") or "").strip()
            if not name:
                stats["no_name"] += 1
                continue
            slug = slugify(name)
            if not slug:
                stats["no_name"] += 1
                continue

            usda_cat = usda_category(rec)
            file_path = os.path.join(out_dir, slug + ".json")
            link = LINK_TEMPLATE.format(slug=slug)
            if link.lower() in index.links or (os.path.exists(file_path) and not args.overwrite):
                stats["exists"] += 1
                continue

            product, kcal = build_product(rec, dri_slugs, name, slug, usda_cat)
            if product is None:
                stats["no_data"] += 1
                print(f"  - пропуск «{name}»: {kcal}")
                continue

            category = categories.resolve(usda_cat) if usda_cat else args.default_category

            if args.review:
                print(f"\n[{seen}] {name}\n    категория: {usda_cat} -> {category}\n    ккал: {kcal}, "
                      f"нутриентов: {len(product['macroNutrients']) - 1} макро + {len(product['microNutrients'])} микро\n"
                      f"    link: {link}")
                while True:
                    ans = input("    Enter = сохранить, n = имя, l = link, c = категория, s = пропустить, q = выход: ").strip().lower()
                    if ans == "":
                        break
                    if ans == "n":
                        new = input("    Новое имя: ").strip()
                        if new:
                            name = product["name"] = new
                    elif ans == "l":
                        new = slugify(input("    Новый slug для link: "))
                        if new:
                            slug = new
                            product["slug"] = slug
                            link = LINK_TEMPLATE.format(slug=slug)
                            file_path = os.path.join(out_dir, slug + ".json")
                            print(f"    link: {link}")
                    elif ans == "c":
                        new = input("    Категория для products.json: ").strip()
                        if new:
                            category = new
                    elif ans in ("s", "q"):
                        break
                if ans == "q":
                    break
                if ans == "s":
                    stats["declined"] += 1
                    continue
                if link.lower() in index.links or (os.path.exists(file_path) and not args.overwrite):
                    print("    Такой link/файл уже существует, пропускаю.")
                    stats["exists"] += 1
                    continue

            write_product_file(out_dir, slug, product)
            entry = index.add(name, category, kcal, slug)
            categories_file.add(category)
            stats["created"] += 1
            if args.review or stats["created"] % 100 == 0:
                print(f"  + id {entry['id']}: {name} -> {slug}.json ({stats['created']} создано)")
    except KeyboardInterrupt:
        print("\nПрервано пользователем, сохраняю прогресс...")
    finally:
        index.flush()
        categories_file.flush()
        with open(CATEGORY_MAP_FILE, "w", encoding="utf-8") as f:
            json.dump(categories.learned, f, indent=2, ensure_ascii=False)

    print("\nГотово.")
    print(f"  прочитано записей:       {seen}")
    print(f"  создано продуктов:       {stats['created']}")
    print(f"  уже существуют (пропуск): {stats['exists']}")
    print(f"  без данных о калориях:   {stats['no_data']}")
    print(f"  без имени:               {stats['no_name']}")
    if args.review:
        print(f"  отклонено вручную:       {stats['declined']}")
    print(f"  файл категорий:          {categories_path} ({len(categories_file.items)} шт.)")
    if index.backed_up:
        print(f"  резервная копия: {products_path}.bak")


if __name__ == "__main__":
    main()
