import './config.js';
export const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const backend = await import(DATABASE_URL ? './postgres-db.js' : './mysql-db.js');
export const { pool, loadDb, insertRecord, db } = backend;
