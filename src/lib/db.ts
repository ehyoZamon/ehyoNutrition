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
    date TEXT NOT NULL,
    meal TEXT NOT NULL DEFAULT 'uncategorized'
  );

  CREATE INDEX IF NOT EXISTS idx_diary_date ON diary(date);
  CREATE INDEX IF NOT EXISTS idx_diary_product_id ON diary(product_id);
`;

// Для установок, где таблица diary уже существовала до появления колонки
// meal (миграция "на лету"): CREATE TABLE IF NOT EXISTS не добавит колонку
// в уже созданную таблицу, поэтому проверяем и дополняем схему вручную.
// Индекс по meal тоже создаётся здесь, а не в SCHEMA — SCHEMA выполняется
// одним batch-ом ДО этой миграции, и на старой БД (diary уже есть, но без
// колонки meal) CREATE INDEX ... ON diary(meal) там упал бы с "no such
// column: meal", поскольку CREATE TABLE IF NOT EXISTS в этом случае — no-op.
async function ensureDiaryMealColumn(database: SQLiteDBConnection) {
  const info = await database.query(`PRAGMA table_info(diary)`);
  const columns = (info.values ?? []) as { name: string }[];
  const hasMeal = columns.some((c) => c.name === "meal");

  if (!hasMeal) {
    await database.execute(
      `ALTER TABLE diary ADD COLUMN meal TEXT NOT NULL DEFAULT 'uncategorized'`
    );
  }

  // Колонка теперь точно есть (либо была изначально, либо только что
  // добавлена) — индекс безопасно (пере)создать в любом случае.
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_diary_meal ON diary(meal)`);
}

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
  await ensureDiaryMealColumn(db);

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