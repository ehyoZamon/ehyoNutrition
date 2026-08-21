// lib/foodDiary.ts
import { getDB, persistWeb } from './db';

export interface FoodEntry {
  id?: number;
  productName: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  eatenAt: string; // ISO строка
}

export async function addFoodEntry(entry: FoodEntry) {
  const db = getDB();
  if (!db) throw new Error('DB не инициализирована');

  await db.run(
    `INSERT INTO food_entries (product_name, calories, protein, fat, carbs, eaten_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [entry.productName, entry.calories, entry.protein, entry.fat, entry.carbs, entry.eatenAt]
  );
  await persistWeb();
}

export async function getEntriesByDate(date: string): Promise<FoodEntry[]> {
  const db = getDB();
  if (!db) return [];

  const result = await db.query(`SELECT * FROM food_entries WHERE eaten_at LIKE ?`, [`${date}%`]);
  return (result.values ?? []) as FoodEntry[];
}

export async function deleteFoodEntry(id: number) {
  const db = getDB();
  if (!db) throw new Error('DB не инициализирована');

  await db.run(`DELETE FROM food_entries WHERE id = ?`, [id]);
  await persistWeb();
}

export async function updateFoodEntry(id: number, entry: Partial<FoodEntry>) {
  const db = getDB();
  if (!db) throw new Error('DB не инициализирована');

  const fields = Object.keys(entry);
  const values = Object.values(entry);
  const setClause = fields.map((f) => `${f} = ?`).join(', ');

  await db.run(`UPDATE food_entries SET ${setClause} WHERE id = ?`, [...values, id]);
  await persistWeb();
}