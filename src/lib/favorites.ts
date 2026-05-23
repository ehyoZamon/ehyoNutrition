const STORAGE_KEY = "favorites";

export type FavoritesStore = {
  products: number[];
  vitamins: number[];
};

const emptyStore: FavoritesStore = { products: [], vitamins: [] };

export function loadFavorites(): FavoritesStore {
  if (typeof window === "undefined") return emptyStore;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore;

    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return { products: parsed as number[], vitamins: [] };
    }

    if (parsed && typeof parsed === "object") {
      const data = parsed as Partial<FavoritesStore>;
      return {
        products: Array.isArray(data.products) ? data.products : [],
        vitamins: Array.isArray(data.vitamins) ? data.vitamins : [],
      };
    }
  } catch {
    // ignore corrupt data
  }

  return emptyStore;
}

export function saveFavorites(store: FavoritesStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function isProductFavorite(id: number, store = loadFavorites()): boolean {
  return store.products.includes(id);
}

export function isVitaminFavorite(id: number, store = loadFavorites()): boolean {
  return store.vitamins.includes(id);
}

export function toggleProductFavorite(id: number): FavoritesStore {
  const store = loadFavorites();
  const next = store.products.includes(id)
    ? store.products.filter((item) => item !== id)
    : [...store.products, id];

  const updated = { ...store, products: next };
  saveFavorites(updated);
  return updated;
}

export function toggleVitaminFavorite(id: number): FavoritesStore {
  const store = loadFavorites();
  const next = store.vitamins.includes(id)
    ? store.vitamins.filter((item) => item !== id)
    : [...store.vitamins, id];

  const updated = { ...store, vitamins: next };
  saveFavorites(updated);
  return updated;
}
