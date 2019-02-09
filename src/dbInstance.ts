import { Database } from './db';

export var db: Database;

export function initDB(_db: Database) {
  db = _db;
}
