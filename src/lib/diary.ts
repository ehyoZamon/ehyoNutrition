// lib/diary.ts
import { getDB, persistWeb } from "./db";
import { requestMealReminderSync } from "./reminderEvents";

export type DiaryEntryRow = {
  id: number;
  product_id: number;
  amount: number;
  date: string;
  meal: string;
  status: string; // 'consumed' | 'planned'
  from_plan: number; // 0/1 — was this 'consumed' row confirmed from a plan?
};

async function ensureDiaryDate(date: string) {
  const db = getDB();
  if (!db) return;
  await db.run(`INSERT OR IGNORE INTO diary_dates (date) VALUES (?)`, [date]);
}

// Удаляет запись из diary_dates, если для этой даты больше не осталось
// ни одной записи в diary — держим вспомогательную таблицу в актуальном состоянии.
async function cleanupDiaryDateIfEmpty(date: string) {
  const db = getDB();
  if (!db) return;

  const res = await db.query(`SELECT COUNT(*) as cnt FROM diary WHERE date = ?`, [date]);
  const count = (res.values?.[0] as any)?.cnt ?? 0;

  if (count === 0) {
    await db.run(`DELETE FROM diary_dates WHERE date = ?`, [date]);
  }
}

export async function addDiaryEntry(
  productId: number,
  amount: number,
  date: string,
  meal: string = "uncategorized",
  status: "consumed" | "planned" = "consumed"
) {
  const db = getDB();
  if (!db) throw new Error("DB не инициализирована");

  await ensureDiaryDate(date);
  await db.run(
    `INSERT INTO diary (product_id, amount, date, meal, status) VALUES (?, ?, ?, ?, ?)`,
    [productId, amount, date, meal, status]
  );
  await persistWeb();
  // Новое блюдо в Daily Plan — нужно (пере)запланировать напоминание о приёме пищи
  if (status === "planned") requestMealReminderSync();
}

// Обновляет количество (amount) уже существующей записи по id — используется
// окном редактирования (QuantitySheet в режиме "edit"). Дата записи не
// меняется, поэтому diary_dates трогать не нужно.
export async function updateDiaryEntry(id: number, amount: number, date: string) {
  const db = getDB();
  if (!db) throw new Error("DB не инициализирована");

  await db.run(`UPDATE diary SET amount = ? WHERE id = ? AND date = ?`, [amount, id, date]);
  await persistWeb();
}

// Подтверждает запланированный приём пищи ("Have you consumed this planned
// meal?" → "Yes"): переводит запись из 'planned' в 'consumed' и помечает
// from_plan=1, чтобы список "Consumed" мог показать бейдж "from your daily
// plan" рядом с типом приёма пищи. Дата не меняется — запись остаётся там,
// где была запланирована.
export async function confirmPlannedEntry(id: number, date: string) {
  const db = getDB();
  if (!db) throw new Error("DB не инициализирована");

  await db.run(
    `UPDATE diary SET status = 'consumed', from_plan = 1 WHERE id = ? AND date = ?`,
    [id, date]
  );
  await persistWeb();
  // Блюдо съедено — убираем его из напоминания
  requestMealReminderSync();
}

export async function deleteDiaryEntry(id: number, date: string) {
  const db = getDB();
  if (!db) throw new Error("DB не инициализирована");

  await db.run(`DELETE FROM diary WHERE id = ?`, [id]);
  await cleanupDiaryDateIfEmpty(date);
  await persistWeb();
  // Могла быть удалена запись из Daily Plan
  requestMealReminderSync();
}

export async function getDiaryEntriesByDate(date: string): Promise<DiaryEntryRow[]> {
  const db = getDB();
  if (!db) return [];

  const res = await db.query(`SELECT * FROM diary WHERE date = ? ORDER BY id ASC`, [date]);
  return (res.values ?? []) as DiaryEntryRow[];
}

// Возвращает набор дат (yyyy-MM-dd), за которые есть хотя бы одна запись,
// в диапазоне [from, to] включительно — используется для покраски календаря.
export async function getDatesWithEntriesInRange(from: string, to: string): Promise<Set<string>> {
  const db = getDB();
  if (!db) return new Set();

  const res = await db.query(
    `SELECT DISTINCT date FROM diary WHERE date BETWEEN ? AND ?`,
    [from, to]
  );
  const values = (res.values ?? []) as { date: string }[];
  return new Set(values.map((v) => v.date));
}