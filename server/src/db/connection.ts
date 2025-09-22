import Database from 'better-sqlite3';
import { env } from '../config/env';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const pathDir = dirname(env.databasePath);
mkdirSync(pathDir, { recursive: true });

export const db = new Database(env.databasePath);
db.pragma('foreign_keys = ON');


