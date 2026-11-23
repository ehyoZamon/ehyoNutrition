// Добавляет поле `source` всем продуктам после заданного элемента.
//
//   node add-source.mjs                          # id > 185 получают source: "USDA"
//   node add-source.mjs --after 185 --by index   # по позиции в массиве (186-й элемент и дальше)
//   node add-source.mjs --file data/en/products.json --source USDA --dry
//
// Опции:
//   --file    путь к JSON (по умолчанию products.json)
//   --after   порог (по умолчанию 185)
//   --by      "id" — сравнивать product.id (по умолчанию), "index" — номер в массиве, считая с 1
//   --source  значение поля (по умолчанию "USDA")
//   --force   перезаписать source, если он уже есть (по умолчанию уже заданные не трогаются)
//   --dry     только показать, что изменится, файл не записывать
//
// Формат файла (CRLF/LF, отступ в 2 пробела, наличие финального перевода строки) сохраняется.
import fs from "node:fs";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

const file = opt("file", "products.json");
const after = Number(opt("after", 185));
const by = opt("by", "id");
const source = opt("source", "USDA");
const force = flag("force");
const dry = flag("dry");

if (!Number.isFinite(after)) throw new Error("--after должен быть числом");
if (by !== "id" && by !== "index") throw new Error('--by должен быть "id" или "index"');

const raw = fs.readFileSync(file, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
const endsWithNewline = /\r?\n$/.test(raw);
const products = JSON.parse(raw);
if (!Array.isArray(products)) throw new Error("Ожидался JSON-массив продуктов");

let added = 0;
let skipped = 0;
products.forEach((product, i) => {
  const position = by === "id" ? product.id : i + 1;
  if (!(position > after)) return;
  if (product.source !== undefined && !force) {
    skipped++;
    return;
  }
  product.source = source;
  added++;
});

console.log(
  `${file}: всего ${products.length}, добавлено source="${source}": ${added}` +
    (skipped ? `, пропущено (source уже есть): ${skipped}` : "")
);

if (dry) {
  console.log("--dry: файл не изменён");
} else {
  let out = JSON.stringify(products, null, 2);
  if (eol === "\r\n") out = out.replace(/\n/g, "\r\n");
  fs.writeFileSync(file, out + (endsWithNewline ? eol : ""));
}
