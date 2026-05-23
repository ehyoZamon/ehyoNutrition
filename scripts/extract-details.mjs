import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const productinfoDir = path.join(root, "src/app/productinfo");
const vitamininfoDir = path.join(root, "src/app/vitamininfo");

function readSourceFile(filePath, gitPath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }

  try {
    return execSync(`git show HEAD:${gitPath}`, {
      cwd: root,
      encoding: "utf8",
    });
  } catch {
    return null;
  }
}

function parseArray(source, name) {
  const re = new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`);
  const m = source.match(re);
  if (!m) return [];
  // eslint-disable-next-line no-new-func
  return new Function(`return ${m[1]}`)();
}

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function extractLiItems(block) {
  const items = [];
  const re = /<li>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    items.push(m[1].trim());
  }
  return items;
}

function extractProduct(slug, filePath) {
  const source = readSourceFile(
    filePath,
    `src/app/productinfo/${slug}/productInfoClient.tsx`
  );
  if (!source) return null;

  const imageMatch = source.match(
    /src="(\/productinfo\/[^"]+)"[\s\S]*?className=\{styles\["product-img"\]\}/
  );
  const altMatch = source.match(
    /src="\/productinfo\/[^"]+"\s+alt="([^"]*)"/
  );
  const nameMatch = source.match(
    /<h1 className=\{styles\["product-name"\]\}>([^<]*)<\/h1>/
  );
  const categoryMatch = source.match(
    /<div className=\{styles\["product-category"\]\}>([^<]*)<\/div>/
  );
  const descMatch = source.match(
    /className=\{styles\["product-description"\]\}>([\s\S]*?)<\/div>\s*\n\s*{\/\*/
  );
  const macroTitleMatch = source.match(
    /macro-nutrients[\s\S]*?<h3>([^<]*(?:<span[\s\S]*?<\/span>)?[^<]*)<\/h3>/
  );
  const macroIntroMatch = source.match(
    /macro-nutrients[\s\S]*?<\/h3>\s*([\s\S]*?)\{MACRO_NUTRIENTS\.map/
  );
  const microIntroMatch = source.match(
    /nutrients-and-microelements[\s\S]*?<\/h3>\s*([\s\S]*?)\{MICRO_NUTRIENTS\.map/
  );
  const healthMatch = source.match(
    /health-benefits[\s\S]*?<ul>([\s\S]*?)<\/ul>/
  );
  const precautionsMatch = source.match(
    /precautions[\s\S]*?<h3>Important Precautions<\/h3>([\s\S]*?)<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*\n\s*<div className=\{styles\["navigation"\]\}/
  );

  let precautionsIntro = "";
  let precautionsItems = [];
  if (precautionsMatch) {
    const block = precautionsMatch[1];
    const ulMatch = block.match(/<ul>([\s\S]*?)<\/ul>/);
    if (ulMatch) {
      precautionsItems = extractLiItems(ulMatch[1]);
      precautionsIntro = block.replace(/<ul>[\s\S]*?<\/ul>/, "").trim();
    } else {
      precautionsIntro = block.trim();
    }
  }

  return {
    slug,
    name: nameMatch?.[1]?.trim() ?? slug,
    category: categoryMatch?.[1]?.trim() ?? "",
    image: imageMatch?.[1] ?? `/productinfo/${slug}.png`,
    imageAlt: altMatch?.[1] ?? slug,
    description: descMatch ? stripTags(descMatch[1]) : "",
    macroTitle: macroTitleMatch
      ? macroTitleMatch[1].replace(/<span[\s\S]*?<\/span>/g, "").trim()
      : "Macro Nutrients",
    macroIntro: macroIntroMatch ? stripTags(macroIntroMatch[1]) : "",
    microIntro: microIntroMatch ? stripTags(microIntroMatch[1]) : "",
    macroNutrients: parseArray(source, "MACRO_NUTRIENTS"),
    microNutrients: parseArray(source, "MICRO_NUTRIENTS"),
    healthBenefits: healthMatch ? extractLiItems(healthMatch[1]) : [],
    precautionsIntro: precautionsIntro ? stripTags(precautionsIntro) : "",
    precautions: precautionsItems,
  };
}

function extractFoodSources(source) {
  const sources = [];
  const re =
    /src=\{"([^"]+)"\}[\s\S]*?className=\{styles\["food-source-img"\]\}[\s\S]*?<div className=\{styles\["product-name"\]\}>([^<]*)<\/div>/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    sources.push({ image: m[1], name: m[2].trim() });
  }
  return sources;
}

function extractVitamin(slug, filePath) {
  const source = readSourceFile(
    filePath,
    `src/app/vitamininfo/${slug}/vitaminInfoClient.tsx`
  );
  if (!source) return null;

  const nameMatch = source.match(
    /<h1 className=\{styles\["vitamin-name"\]\}>([^<]*)<\/h1>/
  );
  const categoryMatch = source.match(
    /<div className=\{styles\["vitamin-category"\]\}>([^<]*)<\/div>/
  );
  const descMatch = source.match(
    /className=\{styles\["vitamin-description"\]\}>([\s\S]*?)<\/div>\s*\n\s*<div style=\{\{background: '#fbf2d8'\}\}/
  );
  const keyFunctionsMatch = source.match(
    /key-functions[\s\S]*?<h3>Key Functions<\/h3>([\s\S]*?)<\/div>\s*\n\s*<div style=\{\{background: "none"\}\}/
  );
  const rdiMarker = "<h3>Recommended Daily Intake (RDI)</h3>";
  const rdiSectionMarker =
    'className={`${styles["nutrients-and-microelements"]}';
  const topFoodStart = source.indexOf('className={`${styles["top-food-sources"]}');
  const rdiSectionStart =
    source.indexOf(rdiSectionMarker) >= 0
      ? source.indexOf(rdiSectionMarker)
      : source.indexOf(rdiMarker);
  let topFoodBlock = "";
  if (topFoodStart >= 0 && rdiSectionStart > topFoodStart) {
    topFoodBlock = source.slice(topFoodStart, rdiSectionStart);
    const h3Idx = topFoodBlock.indexOf("<h3>Top Food Sources</h3>");
    if (h3Idx >= 0) {
      topFoodBlock = topFoodBlock.slice(h3Idx + "<h3>Top Food Sources</h3>".length);
    }
  }

  const rdiMatch = source.match(
    /nutrients-and-microelements[\s\S]*?<h3>Recommended Daily Intake \(RDI\)<\/h3>([\s\S]*?)<\/div>\s*\n\s*<div style=\{\{ background: '#fff2f0' \}\}/
  );
  function extractTabHtml(source, tabClass) {
    const marker = `styles["${tabClass}"]`;
    const idx = source.indexOf(marker);
    if (idx < 0) return "";
    const contentStart = source.indexOf(">", idx) + 1;
    const contentEnd = source.indexOf("</div>", contentStart);
    if (contentEnd < 0) return "";
    return source.slice(contentStart, contentEnd).trim();
  }

  const deficiencyHtml = extractTabHtml(source, "deficiency-symptoms-content");
  const overdoseHtml = extractTabHtml(source, "overdose-symptoms-content");

  function stripFoodSourcesContainer(block) {
    const marker = 'className={styles["food-sources-container"]}';
    const idx = block.indexOf(marker);
    if (idx < 0) return { intro: block.trim(), notes: "" };

    const openDiv = block.lastIndexOf("<div", idx);
    const intro = block.slice(0, openDiv >= 0 ? openDiv : idx).trim();
    const contentStart = block.indexOf(">", idx) + 1;
    let depth = 1;
    let i = contentStart;
    while (i < block.length && depth > 0) {
      if (block.startsWith("<div", i)) depth++;
      if (block.startsWith("</div>", i)) {
        depth--;
        if (depth === 0) {
          let notes = block.slice(i + 6).trim();
          notes = notes.replace(/^\s*<\/div>\s*/, "").trim();
          notes = notes.replace(/\s*<\/div>\s*$/, "").trim();
          return { intro, notes };
        }
      }
      i++;
    }
    return { intro, notes: "" };
  }

  let foodSourcesIntro = "";
  let foodSourcesNotes = "";
  let foodSources = [];
  if (topFoodBlock) {
    foodSources = extractFoodSources(topFoodBlock);
    const { intro, notes } = stripFoodSourcesContainer(topFoodBlock);
    foodSourcesIntro = intro;
    foodSourcesNotes = notes;
  }

  return {
    slug,
    title: nameMatch?.[1]?.trim() ?? slug,
    category: categoryMatch?.[1]?.trim() ?? "Nutrients/vitamins",
    description: descMatch ? stripTags(descMatch[1]) : "",
    keyFunctionsHtml: keyFunctionsMatch ? keyFunctionsMatch[1].trim() : "",
    foodSourcesIntro: foodSourcesIntro ? stripTags(foodSourcesIntro) : "",
    foodSources,
    foodSourcesNotesHtml: foodSourcesNotes,
    rdiHtml: rdiMatch ? rdiMatch[1].trim() : "",
    deficiencyHtml,
    overdoseHtml,
  };
}

const products = {};
for (const entry of fs.readdirSync(productinfoDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const clientPath = path.join(
    productinfoDir,
    entry.name,
    "productInfoClient.tsx"
  );
  const product = extractProduct(entry.name, clientPath);
  if (product) products[entry.name] = product;
}

const vitamins = {};
const vitaminSlugs = [
  "vitamin-a",
  "vitamin-b1",
  "vitamin-b2",
  "vitamin-b3",
  "vitamin-b5",
  "vitamin-b6",
  "vitamin-b7",
  "vitamin-b9",
  "vitamin-b12",
  "vitamin-c",
  "vitamin-d",
  "vitamin-e",
  "vitamin-k",
];

for (const slug of vitaminSlugs) {
  const clientPath = path.join(vitamininfoDir, slug, "vitaminInfoClient.tsx");
  const vitamin = extractVitamin(slug, clientPath);
  if (vitamin) vitamins[slug] = vitamin;
}

const dataDir = path.join(root, "src/data");
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(
  path.join(dataDir, "productDetails.json"),
  JSON.stringify(products, null, 2)
);
fs.writeFileSync(
  path.join(dataDir, "vitaminDetails.json"),
  JSON.stringify(vitamins, null, 2)
);

console.log(
  `Extracted ${Object.keys(products).length} products, ${Object.keys(vitamins).length} vitamins`
);
