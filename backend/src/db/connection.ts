import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let db: DatabaseSync | undefined;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    resultJson TEXT NOT NULL,
    fetchedAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS searches (
    id TEXT PRIMARY KEY,
    iocValue TEXT NOT NULL,
    iocType TEXT NOT NULL,
    verdict TEXT NOT NULL,
    score REAL NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_searches_createdAt ON searches (createdAt);
`;

export function getDb(dbPath: string): DatabaseSync {
  if (db) {
    return db;
  }
  if (dbPath !== ':memory:') {
    mkdirSync(dirname(dbPath), { recursive: true });
  }
  db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  return db;
}
