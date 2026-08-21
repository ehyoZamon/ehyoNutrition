// lib/diary.ts
import { getDB, persistWeb } from "./db";

export type DiaryEntryRow = {
  id: number;
  product_id: number;
  amount: number;
  date: string;
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

export async function addDiaryEntry(productId: number, amount: number, date: string) {
  const db = getDB();
  if (!db) throw new Error("DB не инициализирована");

  await ensureDiaryDate(date);
  await db.run(
    `INSERT INTO diary (product_id, amount, date) VALUES (?, ?, ?)`,
    [productId, amount, date]
  );
  await persistWeb();
}

export async function deleteDiaryEntry(id: number, date: string) {
  const db = getDB();
  if (!db) throw new Error("DB не инициализирована");

  await db.run(`DELETE FROM diary WHERE id = ?`, [id]);
  await cleanupDiaryDateIfEmpty(date);
  await persistWeb();
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