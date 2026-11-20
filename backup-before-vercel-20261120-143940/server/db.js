import mysql from 'mysql2/promise';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { IS_PRODUCTION, SQL_CONFIG } from './config.js';

export const pool = mysql.createPool({ ...SQL_CONFIG, connectionLimit: 5 });
const fields = ['id', 'email', 'name', 'passwordHash', 'createdAt', 'passwordChangedAt', 'tokenVersion'];
function table(name) {
  if (!['accounts', 'users_info'].includes(name)) throw new Error('Unknown collection');
  return `\`${name}\``;
}
function decode(name, row) {
  if (!row || name === 'accounts') return row;
  return typeof row.record === 'string' ? JSON.parse(row.record) : row.record;
}
const values = item => fields.map(key => key === 'id' ? String(item.id) : key === 'tokenVersion' ? (item[key] || 0) : (item[key] ?? null));
export async function loadDb() {
  if (IS_PRODUCTION) {
    const missing = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter(key => !process.env[key]);
    if (missing.length) throw new Error(`Missing production database configuration: ${missing.join(', ')}`);
  }
  if (!/^[A-Za-z0-9_]+$/.test(SQL_CONFIG.database)) throw new Error('Invalid DB_NAME');
  if (!IS_PRODUCTION && ['127.0.0.1', 'localhost', '::1'].includes(SQL_CONFIG.host)) {
    const connection = await mysql.createConnection({ ...SQL_CONFIG, database: undefined });
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${SQL_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } finally { await connection.end(); }
  }
  const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  for (const statement of schema.split(';').filter(s => s.trim())) await pool.query(statement);
}
export async function insertRecord(connection, name, item) {
  table(name);
  if (name === 'accounts') {
    await connection.execute(`INSERT INTO accounts (${fields.map(f => `\`${f}\``).join(',')}) VALUES (?,?,?,?,?,?,?)`, values(item));
  } else {
    await connection.execute('INSERT INTO users_info (id, record) VALUES (?, ?)', [String(item.id), JSON.stringify(item)]);
  }
  return item;
}
export const db = {
  async all(name) {
    const [rows] = await pool.query(`SELECT * FROM ${table(name)}`);
    return rows.map(row => decode(name, row));
  },
  async find(name, id) {
    const [rows] = await pool.execute(`SELECT * FROM ${table(name)} WHERE id = ?`, [String(id)]);
    return decode(name, rows[0]);
  },
  async findBy(name, field, value) {
    if (name !== 'accounts' || field !== 'email') throw new Error('Unsupported lookup');
    const [rows] = await pool.execute('SELECT * FROM accounts WHERE email = ?', [value]);
    return rows[0];
  },
  nextId: () => crypto.randomUUID(),
  insert: (name, item) => insertRecord(pool, name, item),
  async replace(name, id, item) {
    table(name);
    let result;
    if (name === 'accounts') {
      [result] = await pool.execute(`UPDATE accounts SET ${fields.slice(1).map(f => `\`${f}\` = ?`).join(',')} WHERE id = ?`, [...values(item).slice(1), String(id)]);
    } else {
      [result] = await pool.execute('UPDATE users_info SET record = ? WHERE id = ?', [JSON.stringify(item), String(id)]);
    }
    return result.affectedRows ? item : null;
  },
  async remove(name, id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(`SELECT * FROM ${table(name)} WHERE id = ? FOR UPDATE`, [String(id)]);
      await connection.execute(`DELETE FROM ${table(name)} WHERE id = ?`, [String(id)]);
      await connection.commit();
      return decode(name, rows[0]) || null;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
  },
};
