// components/food-diary/createFoodSheet.tsx
//
// Модуль "Create Food" целиком: экран блюда (2), подтверждение удаления
// ингредиента (3), выбор ингредиента (4, переиспользует AddFoodSheet),
// количество при добавлении (5) и при редактировании (6) — в одном файле.
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import styles from "./createFoodSheet.module.css";
import BodyPortal from "@/components/BodyPortal";
import AddFoodSheet, { type DiaryProduct } from "./addFoodSheet";
import { getSlug, loadProductsIndex } from "@/lib/productsIndex";
import { useBackHandler } from "@/lib/backHandler";
import { useNutrientName } from "@/lib/useNutrientName";
import { useLocalizeUnits } from "@/lib/useLocalizeUnits";
import {
  CUSTOM_FOOD_IMAGE,
  computeFoodNutrition,
  countCustomFoodDiaryEntries,
  createCustomFood,
  deleteCustomFood,
  loadCustomFoodForEdit,
  updateCustomFood,
  type CustomProduct,
  type FoodNutrition,
} from "@/lib/customFoods";

type Ingredient = { product: DiaryProduct; grams: number };
type QtyState = { product: DiaryProduct; editIndex: number | null };

type CreateFoodSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Блюдо сохранено (создано или изменено) — провайдер закрывает модуль, список обновляется сам. */
  onCreated: (food: CustomProduct) => void;
  /** id блюда в custom_foods: если задан — модуль работает в режиме редактирования. */
  editId?: number | null;
  /** Блюдо удалено (только в режиме редактирования). */
  onDeleted?: () => void;
};

// Насколько нижний край экрана закрыт клавиатурой (тот же приём, что в QuantitySheet).
function useKeyboardInset(enabled: boolean): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) {
      setInset(0);
      return;
    }
    const handle = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setInset(covered > 0 ? covered : 0);
    };
    handle();
    vv.addEventListener("resize", handle);
    vv.addEventListener("scroll", handle);
    return () => {
      vv.removeEventListener("resize", handle);
      vv.removeEventListener("scroll", handle);
      setInset(0);
    };
  }, [enabled]);
  return inset;
}

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Экраны 5 и 6: ввод количества (граммы)
// ---------------------------------------------------------------------------
function GramsSheet({
  product,
  initialGrams,
  confirmLabel,
  cancelLabel,
  unit,
  onCancel,
  onConfirm,
}: {
  product: DiaryProduct;
  initialGrams: number;
  confirmLabel: string;
  cancelLabel: string;
  unit: string;
  onCancel: () => void;
  onConfirm: (grams: number) => void;
}) {
  const [value, setValue] = useState(String(initialGrams));
  const keyboardInset = useKeyboardInset(true);
  const grams = parseFloat(value);
  const valid = Number.isFinite(grams) && grams > 0;

  return (
    <BodyPortal>
      <div className={`${styles["overlay"]} ${styles["overlay-top"]}`} onClick={onCancel}>
        <div
          className={styles["small-sheet"]}
          onClick={(e) => e.stopPropagation()}
          style={{ transform: keyboardInset ? `translateY(-${keyboardInset}px)` : undefined }}
        >
          <div className={styles["image-circle"]}>
            <Image src={product.image} alt={product.name} width={76} height={76} />
          </div>

          <div className={styles["quantity-row"]}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              autoFocus
              className={styles["quantity-input"]}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <span className={styles["quantity-unit"]}>{unit}</span>
          </div>

          <div className={styles["actions-row"]}>
            <button type="button" className={styles["cancel-btn"]} onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={styles["submit-btn"]}
              disabled={!valid}
              onClick={() => valid && onConfirm(grams)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </BodyPortal>
  );
}

// ---------------------------------------------------------------------------
// Экран 3: подтверждение удаления ингредиента
// ---------------------------------------------------------------------------
function DeleteSheet({
  item,
  title,
  unit,
  cancelLabel,
  submitLabel,
  onCancel,
  onConfirm,
}: {
  item: Ingredient;
  title: string;
  unit: string;
  cancelLabel: string;
  submitLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <BodyPortal>
      <div className={`${styles["overlay"]} ${styles["overlay-top"]}`} onClick={onCancel}>
        <div className={styles["small-sheet"]} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles["sheet-title"]}>{title}</h2>

          <div className={styles["entry-row"]}>
            <div className={styles["entry-img"]}>
              <Image src={item.product.image} alt="" width={36} height={36} />
            </div>
            <span className={styles["entry-label"]}>
              {item.product.name} - {item.grams} {unit}
            </span>
          </div>

          <div className={styles["actions-row"]}>
            <button type="button" className={styles["cancel-btn"]} onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className={styles["submit-btn"]} onClick={onConfirm}>
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </BodyPortal>
  );
}

// ---------------------------------------------------------------------------
// Подтверждение удаления всего блюда (режим редактирования)
// ---------------------------------------------------------------------------
function DeleteFoodSheet({
  name,
  title,
  warning,
  cancelLabel,
  submitLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  name: string;
  title: string;
  warning: string;
  cancelLabel: string;
  submitLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <BodyPortal>
      <div className={`${styles["overlay"]} ${styles["overlay-top"]}`} onClick={onCancel}>
        <div className={styles["small-sheet"]} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles["sheet-title"]}>{title}</h2>

          <div className={styles["entry-row"]}>
            <div className={styles["entry-img"]}>
              <Image src={CUSTOM_FOOD_IMAGE} alt="" width={36} height={36} />
            </div>
            <span className={styles["entry-label"]}>{name}</span>
          </div>

          <p className={styles["warning-text"]}>{warning}</p>

          <div className={styles["actions-row"]}>
            <button type="button" className={styles["cancel-btn"]} onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className={styles["submit-btn"]} disabled={busy} onClick={onConfirm}>
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </BodyPortal>
  );
}

// ---------------------------------------------------------------------------
// Экран 2: само создание блюда
// ---------------------------------------------------------------------------
const CreateFoodSheet = ({ open, onClose, onCreated, editId = null, onDeleted }: CreateFoodSheetProps) => {
  const locale = useLocale();
  const t = useTranslations("FoodDiary");
  const gramUnit = t("gramUnit");
  const kcalUnit = t("kcalUnit");
  const nutrientName = useNutrientName();
  const localizeUnits = useLocalizeUnits();
  const isEdit = editId !== null;

  // Ключи для режима редактирования необязательны: без них в messages/*.json
  // остаётся встроенный текст (тот же приём, что в AddFoodSheet).
  const tt = (key: string, ru: string, en: string, values?: Record<string, string | number>) => {
    if (t.has(key)) return t(key, values as never);
    const raw = locale === "ru" ? ru : en;
    return values
      ? Object.entries(values).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), raw)
      : raw;
  };

  const [name, setName] = useState("");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [qty, setQty] = useState<QtyState | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [nutrition, setNutrition] = useState<FoodNutrition | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deleteFoodOpen, setDeleteFoodOpen] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);

  // Закрыли модуль — черновик не храним
  useEffect(() => {
    if (open) return;
    setName("");
    setItems([]);
    setPickerOpen(false);
    setQty(null);
    setDeleteIndex(null);
    setNutrition(null);
    setSaving(false);
    setFailed(false);
    setLoadingEdit(false);
    setDeleteFoodOpen(false);
  }, [open]);

  // Режим редактирования: подставляем название и состав сохранённого блюда
  useEffect(() => {
    if (!open || editId === null) return;
    let cancelled = false;
    setLoadingEdit(true);
    (async () => {
      try {
        const [food, index] = await Promise.all([loadCustomFoodForEdit(editId), loadProductsIndex(locale)]);
        if (cancelled || !food) return;
        setName(food.name);
        const loaded: Ingredient[] = [];
        for (const it of food.items) {
          const product = index.bySlug.get(it.slug);
          if (product) loaded.push({ product, grams: it.grams });
        }
        setItems(loaded);
      } catch (e) {
        console.error("Не удалось загрузить блюдо для редактирования:", e);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // locale намеренно не в deps: смена языка не должна затирать правки пользователя
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  // Пересчёт сводки (белки / ккал / жиры / углеводы) при любом изменении состава
  useEffect(() => {
    if (!open || items.length === 0) {
      setNutrition(null);
      return;
    }
    let cancelled = false;
    computeFoodNutrition(items.map((i) => ({ slug: getSlug(i.product.link), grams: i.grams })))
      .then((n) => {
        if (!cancelled) setNutrition(n);
      })
      .catch((e) => console.error("Не удалось посчитать состав блюда:", e));
    return () => {
      cancelled = true;
    };
  }, [open, items]);

  const macroRows = useMemo(() => {
    if (!nutrition) return [];
    const calories = nutrition.macroTotal.find((n) => !n.slug);
    const macros = nutrition.macroTotal.filter((n) => n.slug).slice(0, 3);
    return [...(calories ? [calories] : []), ...macros].map((n) => ({
      key: n.slug || String(n.id),
      name: nutrientName(n),
      amount: localizeUnits(n.amount),
    }));
    // locale — чтобы названия перечитались при смене языка
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nutrition, locale]);

  const totalGrams = items.reduce((sum, i) => sum + i.grams, 0);
  const canCreate = name.trim().length > 0 && items.length > 0 && totalGrams > 0 && !saving && !loadingEdit;

  // "Назад" (Android): закрываем самое верхнее окно; условия взаимоисключающие
  useBackHandler(() => {
    setDeleteIndex(null);
    return true;
  }, deleteIndex !== null);
  useBackHandler(() => {
    setQty(null);
    return true;
  }, qty !== null && deleteIndex === null);
  useBackHandler(() => {
    setPickerOpen(false);
    return true;
  }, pickerOpen && qty === null && deleteIndex === null);
  useBackHandler(() => {
    setDeleteFoodOpen(false);
    return true;
  }, deleteFoodOpen);
  useBackHandler(() => {
    onClose();
    return true;
  }, open && !pickerOpen && qty === null && deleteIndex === null && !deleteFoodOpen);

  // Экран 4 → выбрали ингредиент. Если он уже в составе — открываем его на редактирование.
  const handlePick = (product: DiaryProduct) => {
    const slug = getSlug(product.link);
    const existing = items.findIndex((i) => getSlug(i.product.link) === slug);
    setQty({ product, editIndex: existing >= 0 ? existing : null });
  };

  // Экраны 5/6 → подтвердили количество
  const handleQtyConfirm = (grams: number) => {
    if (!qty) return;
    setItems((prev) =>
      qty.editIndex !== null
        ? prev.map((it, i) => (i === qty.editIndex ? { ...it, grams } : it))
        : [...prev, { product: qty.product, grams }]
    );
    setQty(null);
    setPickerOpen(false); // вернулись на экран блюда
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex === null) return;
    setItems((prev) => prev.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    setSaving(true);
    setFailed(false);
    try {
      const payload = items.map((i) => ({ slug: getSlug(i.product.link), grams: i.grams }));
      const food =
        editId !== null
          ? await updateCustomFood(editId, name, payload, locale)
          : await createCustomFood(name, payload, locale);
      onCreated(food);
    } catch (e) {
      console.error("Не удалось создать блюдо:", e);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  // Перед удалением блюда показываем, сколько записей дневника исчезнет вместе с ним
  const openDeleteFood = async () => {
    if (editId === null) return;
    try {
      setDiaryCount(await countCustomFoodDiaryEntries(editId));
    } catch {
      setDiaryCount(0);
    }
    setDeleteFoodOpen(true);
  };

  const handleDeleteFood = async () => {
    if (editId === null) return;
    setSaving(true);
    try {
      await deleteCustomFood(editId);
      setDeleteFoodOpen(false);
      onDeleted?.();
    } catch (e) {
      console.error("Не удалось удалить блюдо:", e);
      setDeleteFoodOpen(false);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <BodyPortal>
      <div className={styles["overlay"]} onClick={onClose}>
        <div className={styles["sheet"]} onClick={(e) => e.stopPropagation()}>
          <div className={styles["scroll"]}>
            <div className={styles["hero"]}>
              <Image src={CUSTOM_FOOD_IMAGE} alt="" width={96} height={96} />
              <span className={styles["name-label"]}>{t("createFoodNamePrompt")}</span>
              <input
                type="text"
                className={styles["name-input"]}
                placeholder={t("createFoodNamePlaceholder")}
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {macroRows.length > 0 && (
              <div className={styles["macro-band"]}>
                {macroRows.map((row) => (
                  <div className={styles["macro-col"]} key={row.key}>
                    <span className={styles["macro-label"]}>{row.name}</span>
                    <span className={styles["macro-value"]}>{row.amount}</span>
                  </div>
                ))}
              </div>
            )}

            <h3 className={styles["section-title"]}>
              {t("ingredientsTitle")}
              {totalGrams > 0 && (
                <span className={styles["section-total"]}>
                  {Math.round(totalGrams)} {gramUnit}
                </span>
              )}
            </h3>

            {items.length === 0 && !loadingEdit && <p className={styles["empty"]}>{t("ingredientsEmpty")}</p>}

            {items.map((item, index) => (
              <div className={styles["ingredient"]} key={getSlug(item.product.link)}>
                <button
                  type="button"
                  className={styles["ingredient-main"]}
                  onClick={() => setQty({ product: item.product, editIndex: index })}
                >
                  <Image src={item.product.image} alt="" width={28} height={28} />
                  <span className={styles["ingredient-name"]}>{item.product.name}</span>
                  <span className={styles["ingredient-amount"]}>
                    {item.grams}
                    {gramUnit}/{Math.round(nutrition?.itemKcal[index] ?? 0)}
                    {kcalUnit}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles["trash-btn"]}
                  aria-label={t("delete")}
                  onClick={() => setDeleteIndex(index)}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}

            <button type="button" className={styles["add-ingredient-btn"]} onClick={() => setPickerOpen(true)}>
              {t("addIngredient")}
            </button>

            {isEdit && (
              <button
                type="button"
                className={styles["delete-food-btn"]}
                disabled={saving || loadingEdit}
                onClick={openDeleteFood}
              >
                {tt("deleteFoodBtn", "Удалить блюдо", "Delete food")}
              </button>
            )}

            {failed && <p className={styles["error"]}>{t("createFoodError")}</p>}
          </div>

          <div className={styles["actions"]}>
            <button type="button" className={styles["cancel-btn"]} onClick={onClose}>
              {t("cancelBtn")}
            </button>
            <button type="button" className={styles["submit-btn"]} disabled={!canCreate} onClick={handleCreate}>
              {isEdit ? t("saveBtn") : t("createBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* Экран 4: тот же список, что в AddFoodSheet, но поверх (z-index) и без своих блюд */}
      <AddFoodSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectProduct={handlePick}
        title={t("selectIngredient")}
        zIndex={1200}
        hideCustom
      />

      {qty && (
        <GramsSheet
          key={`${getSlug(qty.product.link)}-${qty.editIndex}`}
          product={qty.product}
          initialGrams={qty.editIndex !== null ? items[qty.editIndex]?.grams ?? 100 : 100}
          confirmLabel={qty.editIndex !== null ? t("saveBtn") : t("addBtn")}
          cancelLabel={t("cancelBtn")}
          unit={gramUnit}
          onCancel={() => setQty(null)}
          onConfirm={handleQtyConfirm}
        />
      )}

      {deleteFoodOpen && (
        <DeleteFoodSheet
          name={name}
          title={tt("deleteFoodTitle", "Удалить блюдо?", "Delete this food?")}
          warning={
            diaryCount > 0
              ? tt(
                  "deleteFoodWithEntries",
                  "Записей в дневнике, которые будут удалены вместе с блюдом: {count}.",
                  "Diary entries that will be removed with it: {count}.",
                  { count: diaryCount }
                )
              : tt("deleteFoodNoEntries", "Это действие нельзя отменить.", "This can't be undone.")
          }
          cancelLabel={t("cancelBtn")}
          submitLabel={t("submitBtn")}
          busy={saving}
          onCancel={() => setDeleteFoodOpen(false)}
          onConfirm={handleDeleteFood}
        />
      )}

      {deleteIndex !== null && items[deleteIndex] && (
        <DeleteSheet
          item={items[deleteIndex]}
          title={t("deleteIngredientTitle")}
          unit={gramUnit}
          cancelLabel={t("cancelBtn")}
          submitLabel={t("submitBtn")}
          onCancel={() => setDeleteIndex(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </BodyPortal>
  );
};

export default CreateFoodSheet;