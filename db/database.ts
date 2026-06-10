import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('homevault.db');
  await initTables(db);
  return db;
}

async function initTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS room (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ratio_x REAL DEFAULT 3.0,
      ratio_y REAL DEFAULT 1.0,
      ratio_z REAL DEFAULT 2.0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS storage_unit (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES room(id),
      parent_id TEXT REFERENCES storage_unit(id),
      name TEXT NOT NULL DEFAULT '',
      pos_x REAL DEFAULT 0,
      pos_y REAL DEFAULT 0,
      pos_z REAL DEFAULT 0,
      scale_x REAL DEFAULT 1,
      scale_y REAL DEFAULT 1,
      scale_z REAL DEFAULT 1,
      color TEXT DEFAULT '#AADDFF',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS item (
      id TEXT PRIMARY KEY,
      storage_unit_id TEXT NOT NULL REFERENCES storage_unit(id),
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      notes TEXT DEFAULT '',
      category_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      item_ids TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
