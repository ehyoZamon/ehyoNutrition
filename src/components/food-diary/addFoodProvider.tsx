"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { format } from "date-fns";
import AddFoodSheet, { DiaryProduct } from "@/components/food-diary/addFoodSheet";
import QuantitySheet from "@/components/food-diary/quantitySheet";
import { addDiaryEntry } from "@/lib/diary";
import { getUserProfile, UserProfile } from "@/lib/userProfile";

// "uncategorized" is never chosen by the user directly — it's only the
// fallback stored on an entry auto-added between 22:00–04:59 while on
// the "All" tab. It has no tab of its own but still shows up under "All".
export type MealType = "breakfast" | "lunch" | "dinner" | "snacks" | "uncategorized";
export type MealFilter = "all" | MealType;

// Time-of-day → meal, used only when a product is added while no specific
// meal tab is active (so the app has to guess which meal it belongs to):
//   05:00–10:59 breakfast · 11:00–15:59 lunch · 16:00–21:59 dinner
//   snacks is never picked by time, only by the user selecting that tab
//   22:00–04:59 (or anything outside the windows above) → uncategorized
export const resolveMealByTime = (date: Date): Exclude<MealType, "snacks"> => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 22) return "dinner";
  return "uncategorized";
};

type AddFoodContextValue = {
  /** Открывает AddFoodSheet поверх любой страницы. */
  openAddFood: () => void;
  /**
   * Страница дневника сообщает, какая вкладка приёма пищи сейчас выбрана —
   * тогда продукт уходит именно в неё. Со всех остальных страниц (и на
   * вкладке "All") приём пищи определяется по времени суток.
   */
  setPreferredMeal: (meal: MealFilter) => void;
  /** Увеличивается после каждой успешной записи — по нему дневник перезагружает список. */
  diaryVersion: number;
};

const AddFoodContext = createContext<AddFoodContextValue | null>(null);

export function useAddFood(): AddFoodContextValue {
  const ctx = useContext(AddFoodContext);
  if (!ctx) {
    throw new Error("useAddFood must be used inside <AddFoodProvider>");
  }
  return ctx;
}

export default function AddFoodProvider({ children }: { children: ReactNode }) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isQuantitySheetOpen, setIsQuantitySheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DiaryProduct | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [diaryVersion, setDiaryVersion] = useState(0);

  // ref, а не state: страница дневника пишет сюда при каждой смене вкладки,
  // и перерисовывать из-за этого весь layout не нужно.
  const preferredMealRef = useRef<MealFilter>("all");

  const setPreferredMeal = useCallback((meal: MealFilter) => {
    preferredMealRef.current = meal;
  }, []);

  const openAddFood = useCallback(() => {
    // Профиль (вес, рост, пол) мог измениться в настройках, пока провайдер
    // жил в layout — перечитываем при каждом открытии.
    getUserProfile()
      .then(setProfile)
      .catch((e) => console.error("Не удалось загрузить профиль:", e));
    setIsAddSheetOpen(true);
  }, []);

  const handleSelectProduct = useCallback((product: DiaryProduct) => {
    setSelectedProduct(product);
    setIsAddSheetOpen(false);
    setIsQuantitySheetOpen(true);
  }, []);

  const handleQuantityAdd = useCallback(
    async (
      product: DiaryProduct,
      _amountLabel: string,
      grams: number,
      status: "consumed" | "planned" = "consumed"
    ) => {
      const dateStr = format(new Date(), "yyyy-MM-dd"); // всегда текущий день
      const preferred = preferredMealRef.current;
      const meal: MealType =
        preferred === "all" ? resolveMealByTime(new Date()) : preferred;

      try {
        await addDiaryEntry(product.id, grams, dateStr, meal, status);
        setDiaryVersion((v) => v + 1);
      } catch (e) {
        console.error("Не удалось добавить запись:", e);
      } finally {
        setIsQuantitySheetOpen(false);
        setSelectedProduct(null);
      }
    },
    []
  );

  const handleQuantityClose = useCallback(() => {
    setIsQuantitySheetOpen(false);
    setSelectedProduct(null);
  }, []);

  const value = useMemo<AddFoodContextValue>(
    () => ({ openAddFood, setPreferredMeal, diaryVersion }),
    [openAddFood, setPreferredMeal, diaryVersion]
  );

  return (
    <AddFoodContext.Provider value={value}>
      {children}

      <AddFoodSheet
        open={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      <QuantitySheet
        open={isQuantitySheetOpen}
        product={selectedProduct}
        onClose={handleQuantityClose}
        onAdd={handleQuantityAdd}
        userProfile={profile}
      />
    </AddFoodContext.Provider>
  );
}
