import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { getUserProfile, saveUserProfile, UserProfile } from "@/lib/userProfile";

import { initDB, getSqlite, closeDB, persistWeb } from "@/lib/db";

const BACKUP_APP = "NutritionLib";
const BACKUP_FORMAT = 1;

type BackupFile = {
  app: string;
  format: number;
  exportedAt: string;
  profile: UserProfile | null;
  db: unknown; // JsonSQLite из @capacitor-community/sqlite
};

export class BackupError extends Error {
  constructor(public code: "invalid-file" | "wrong-app" | "too-new" | "invalid-db") {
    super(code);
  }
}

/** Собирает все данные в один JSON-объект. */
async function buildBackup(): Promise<BackupFile> {
  const db = await initDB();
  if (!db) throw new Error("База данных недоступна");
  const { export: dbJson } = await db.exportToJson("full");
  const profile = await getUserProfile();

  return {
    app: BACKUP_APP,
    format: BACKUP_FORMAT,
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    db: dbJson,
  };
}

/** Экспорт: на устройстве — системное меню «Поделиться», в браузере — скачивание файла. */
export async function exportBackup(): Promise<void> {
  const backup = await buildBackup();
  const json = JSON.stringify(backup);
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `nutritionlib-backup-${stamp}.json`;

  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: fileName, url: uri });
    return;
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Импорт: полностью заменяет текущие данные данными из файла. */
export async function importBackup(file: File): Promise<void> {
  let parsed: BackupFile;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new BackupError("invalid-file");
  }

  if (!parsed || parsed.app !== BACKUP_APP || !parsed.db) {
    throw new BackupError("wrong-app");
  }
  if (typeof parsed.format !== "number" || parsed.format > BACKUP_FORMAT) {
    throw new BackupError("too-new");
  }

  const sqlite = getSqlite();
  const dbJson = { ...(parsed.db as object), overwrite: true };
  const dbJsonString = JSON.stringify(dbJson);

  const { result } = await sqlite.isJsonValid(dbJsonString);
  if (!result) throw new BackupError("invalid-db");

  // Закрываем текущее соединение, затем импортируем.
  await closeDB();
  await sqlite.importFromJson(dbJsonString);

  // В браузере (jeep-sqlite/WASM) сохраняем базу в IndexedDB
  await persistWeb();

  if (parsed.profile) {
    await saveUserProfile(parsed.profile);
  }
}