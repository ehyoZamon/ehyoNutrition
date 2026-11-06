import type { ProductInfoData } from "@/components/product-info/productInfoModule";

// ВАЖНО: SHARDS и shardOf должны совпадать с scripts/packProductInfo.mjs
export const SHARDS = 1024;

export const shardOf = (slug: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % SHARDS;
};

type Locale = "en" | "ru";
type Shard = Record<string, ProductInfoData>;

// Кэш промисов: параллельные запросы к одному шарду делят один fetch,
// а повторные открытия товаров из того же шарда не ходят в сеть.
const shardCache = new Map<string, Promise<Shard>>();

const loadShard = (loc: Locale, n: number): Promise<Shard> => {
  const key = `${loc}/${n}`;
  let p = shardCache.get(key);
  if (!p) {
    p = fetch(`/data/${loc}/productInfo-packed/${n}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        // если хостинг вместо 404 отдаёт index.html со статусом 200, json() бросит ошибку
        return r.json() as Promise<Shard>;
      })
      .catch((e) => {
        shardCache.delete(key); // ошибку не кэшируем
        throw e;
      });
    shardCache.set(key, p);
  }
  return p;
};

/** Данные продукта из шарда. Бросает ошибку, если продукта нет. */
export const loadProductInfo = async (loc: Locale, slug: string): Promise<ProductInfoData> => {
  const shard = await loadShard(loc, shardOf(slug));
  if (!Object.prototype.hasOwnProperty.call(shard, slug)) {
    throw new Error(`productInfo not found: ${loc}/${slug}`);
  }
  return shard[slug];
};
