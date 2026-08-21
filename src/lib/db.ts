// lib/db.ts
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { initWebStore } from './sqlite-web-init';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;
let initPromise: Promise<SQLiteDBConnection | null> | null = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS diary_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_diary_date ON diary(date);
  CREATE INDEX IF NOT EXISTS idx_diary_product_id ON diary(product_id);
`;

async function _initDB() {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    await initWebStore();
    await sqlite.initWebStore();
  }

  const isConn = (await sqlite.isConnection('app_db', false)).result;
  db = isConn
    ? await sqlite.retrieveConnection('app_db', false)
    : await sqlite.createConnection('app_db', false, 'no-encryption', 1, false);

  await db.open();
  await db.execute(SCHEMA);

  if (platform === 'web') {
    await sqlite.saveToStore('app_db');
  }

  return db;
}

// Гарантирует, что инициализация выполнится только один раз,
// даже если initDB() вызовут из нескольких компонентов параллельно
export function initDB() {
  if (!initPromise) initPromise = _initDB();
  return initPromise;
}

export function getDB() {
  return db;
}

export async function persistWeb() {
  if (Capacitor.getPlatform() === 'web') {
    await sqlite.saveToStore('app_db');
  }
}