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
