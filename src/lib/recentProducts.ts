// lib/recentProducts.ts
// Недавно использованные продукты: последние добавленные — первые.
// Храним slug (а не id), чтобы список работал и в ru, и в en.

const KEY = "recentProductSlugs";
/** Храним с запасом (минимум 30 должны быть в топе). */
const MAX_STORED = 50;

export function getRecentSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Вызывать, когда продукт реально добавлен (съеден или в плане). */
export function markProductUsed(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const next = [slug, ...getRecentSlugs().filter((s) => s !== slug)].slice(0, MAX_STORED);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* хранилище недоступно — не критично */
  }
}