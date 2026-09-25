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
    meal TEXT NOT NULL DEFAULT 'uncategorized',
    status TEXT NOT NULL DEFAULT 'consumed',
    from_plan INTEGER NOT NULL DEFAULT 0
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

  // Индекс теперь точно есть (либо была изначально, либо только что
  // добавлена) — индекс безопасно (пере)создать в любом случае.
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_diary_meal ON diary(meal)`);
}

// Та же миграция "на лету", что и выше, но для колонок status/from_plan —
// нужны для планирования приёма пищи (Daily Plan): status различает
// 'consumed' (уже съедено, как раньше) и 'planned' (запланировано, ещё не
// съедено и не учитывается в подсчёте суточной нормы); from_plan=1
// отмечает запись, которая была подтверждена из плана (для бейджа "from
// your daily plan" в списке Consumed).
async function ensureDiaryPlanColumns(database: SQLiteDBConnection) {
  const info = await database.query(`PRAGMA table_info(diary)`);
  const columns = (info.values ?? []) as { name: string }[];

  if (!columns.some((c) => c.name === "status")) {
    await database.execute(
      `ALTER TABLE diary ADD COLUMN status TEXT NOT NULL DEFAULT 'consumed'`
    );
  }
  if (!columns.some((c) => c.name === "from_plan")) {
    await database.execute(
      `ALTER TABLE diary ADD COLUMN from_plan INTEGER NOT NULL DEFAULT 0`
    );
  }

  await database.execute(`CREATE INDEX IF NOT EXISTS idx_diary_status ON diary(status)`);
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
  await ensureDiaryPlanColumns(db);

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