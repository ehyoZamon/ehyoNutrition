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

// Открывает (или переиспользует) соединение 'app_db', устойчиво
// к ситуации, когда нативное соединение уже существует после
// window.location.reload() на Android, а JS-обёртка плагина
// (свежий модуль после релоада) об этом ещё не знает.
async function openConnection(): Promise<SQLiteDBConnection> {
  try {
    const isConn = (await sqlite.isConnection('app_db', false)).result;

    const conn = isConn
      ? await sqlite.retrieveConnection('app_db', false)
      : await sqlite.createConnection('app_db', false, 'no-encryption', 1, false);

    await conn.open();
    return conn;
  } catch (err) {
    console.warn('[db] Первая попытка открытия соединения не удалась, пробуем retrieveConnection:', err);

    try {
      const conn = await sqlite.retrieveConnection('app_db', false);
      await conn.open();
      return conn;
    } catch (fallbackErr) {
      console.warn('[db] retrieveConnection тоже не сработал, закрываем и пересоздаём:', fallbackErr);

      // closeConnection может сам кинуть ошибку, если соединения и так нет —
      // это ожидаемо, поэтому глушим её и идём дальше
      await sqlite.closeConnection('app_db', false).catch(() => {});

      const conn = await sqlite.createConnection('app_db', false, 'no-encryption', 1, false);
      await conn.open();
      return conn;
    }
  }
}

async function _initDB() {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    await initWebStore();
    await sqlite.initWebStore();
  }

  db = await openConnection();
  await db.execute(SCHEMA);

  if (platform === 'web') {
    await sqlite.saveToStore('app_db');
  }

  return db;
}

// Гарантирует, что инициализация выполнится только один раз,
// даже если initDB() вызовут из нескольких компонентов параллельно.
// Важно: initPromise — module-level переменная, значит после
// window.location.reload() JS-контекст полностью пересоздаётся,
// и следующий initDB() всегда начинает с чистого initPromise = null.
export function initDB() {
  if (!initPromise) {
    initPromise = _initDB().catch((err) => {
      // Сбрасываем initPromise, чтобы следующий вызов initDB()
      // (например, при повторной попытке из DBProvider) не был
      // заблокирован навсегда зареджекченным промисом
      initPromise = null;
      throw err;
    });
  }
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