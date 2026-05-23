import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2] || "vitamin-c";

const source = execSync(
  `git show HEAD:src/app/vitamininfo/${slug}/vitaminInfoClient.tsx`,
  { cwd: root, encoding: "utf8" }
);

const rdiMarker = "<h3>Recommended Daily Intake (RDI)</h3>";
const topFoodStart = source.indexOf('className={`${styles["top-food-sources"]}');
const rdiSectionStart = source.indexOf(rdiMarker);
let topFoodBlock = source.slice(topFoodStart, rdiSectionStart);
const h3Idx = topFoodBlock.indexOf("<h3>Top Food Sources</h3>");
topFoodBlock = topFoodBlock.slice(h3Idx + "<h3>Top Food Sources</h3>".length);

const marker = 'className={styles["food-sources-container"]}';
const idx = topFoodBlock.indexOf(marker);
const contentStart = topFoodBlock.indexOf(">", idx) + 1;

let depth = 1;
let i = contentStart;
let containerEnd = -1;

while (i < topFoodBlock.length && depth > 0) {
  if (topFoodBlock.startsWith("<div", i)) {
    depth++;
    i += 4;
    continue;
  }
  if (topFoodBlock.startsWith("</div>", i)) {
    depth--;
    if (depth === 0) {
      containerEnd = i;
      break;
    }
    i += 6;
    continue;
  }
  i++;
}

let notes = containerEnd >= 0 ? topFoodBlock.slice(containerEnd + 6).trim() : "";
const rawNotes = notes;
notes = notes.replace(/^<\/div>\s*/, "").trim();
const cleared =
  notes.includes("nutrients-and-microelements") ||
  notes.startsWith("<div style=");

console.log("containerEnd", containerEnd);
console.log("raw notes:", JSON.stringify(rawNotes.slice(0, 120)));
console.log("after trim:", JSON.stringify(notes.slice(0, 120)));
console.log("cleared?", cleared);
console.log("has nutrients?", rawNotes.includes("nutrients-and-microelements"));
console.log("raw len", rawNotes.length);
if (rawNotes.includes("nutrients")) {
  console.log("index", rawNotes.indexOf("nutrients"));
  console.log(rawNotes.slice(rawNotes.indexOf("nutrients") - 30, rawNotes.indexOf("nutrients") + 80));
}
