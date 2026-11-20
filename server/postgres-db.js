import pg from 'pg';
import crypto from 'node:crypto';
import fs from 'node:fs';

const connectionUrl = new URL(process.env.POSTGRES_URL || process.env.DATABASE_URL);
// Supply the provider CA explicitly; URL SSL flags would overwrite pg's SSL object.
for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) connectionUrl.searchParams.delete(key);
export const pool = new pg.Pool({
  connectionString: connectionUrl.toString(),
  ssl: { rejectUnauthorized: true, ca: process.env.POSTGRES_SSL_CA || fs.readFileSync(new URL('./supabase-ca.crt', import.meta.url), 'utf8') },
  max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000,
});
pool.on('error', error => console.error('Database pool error:', error.code));
const fields = ['id', 'email', 'name', 'passwordHash', 'createdAt', 'passwordChangedAt', 'tokenVersion'];
const quoted = fields.map(field => `"${field}"`).join(',');
const values = item => fields.map(key => key === 'id' ? String(item.id) : key === 'tokenVersion' ? (item[key] || 0) : (item[key] ?? null));
function table(name) {
  if (!['accounts', 'users_info'].includes(name)) throw new Error('Unknown collection');
  return `gym_private."${name}"`;
}
const decode = (name, row) => !row || name === 'accounts' ? row : row.record;
export async function loadDb() {
  // A private schema keeps gym records out of Supabase's public Data API.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(82741901)');
    await client.query('CREATE SCHEMA IF NOT EXISTS gym_private');
    await client.query(`CREATE TABLE IF NOT EXISTS gym_private.accounts (
      id VARCHAR(191) PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL, "passwordHash" VARCHAR(255) NOT NULL,
      "createdAt" VARCHAR(40), "passwordChangedAt" VARCHAR(40),
      "tokenVersion" INTEGER NOT NULL DEFAULT 0
    )`);
    await client.query('CREATE TABLE IF NOT EXISTS gym_private.users_info (id VARCHAR(191) PRIMARY KEY, record JSONB NOT NULL)');
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function insertRecord(client, name, item) {
  table(name);
  if (name === 'accounts') {
    await client.query(`INSERT INTO ${table(name)} (${quoted}) VALUES ($1,$2,$3,$4,$5,$6,$7)`, values(item));
  } else {
    await client.query(`INSERT INTO ${table(name)} (id, record) VALUES ($1,$2)`, [String(item.id), JSON.stringify(item)]);
  }
  return item;
}
export const db = {
  async all(name) {
    const { rows } = await pool.query(`SELECT * FROM ${table(name)}`);
    return rows.map(row => decode(name, row));
  },
  async find(name, id) {
    const { rows } = await pool.query(`SELECT * FROM ${table(name)} WHERE id=$1`, [String(id)]);
    return decode(name, rows[0]);
  },
  async findBy(name, field, value) {
    if (name !== 'accounts' || field !== 'email') throw new Error('Unsupported lookup');
    const { rows } = await pool.query(`SELECT * FROM ${table(name)} WHERE email=$1`, [value]);
    return rows[0];
  },
  nextId: () => crypto.randomUUID(),
  insert: (name, item) => insertRecord(pool, name, item),
  async replace(name, id, item) {
    table(name);
    const result = name === 'accounts'
      ? await pool.query(`UPDATE ${table(name)} SET ${fields.slice(1).map((field, index) => `"${field}"=$${index + 1}`).join(',')} WHERE id=$7`, [...values(item).slice(1), String(id)])
      : await pool.query(`UPDATE ${table(name)} SET record=$1 WHERE id=$2`, [JSON.stringify(item), String(id)]);
    return result.rowCount ? item : null;
  },
  async remove(name, id) {
    const { rows } = await pool.query(`DELETE FROM ${table(name)} WHERE id=$1 RETURNING *`, [String(id)]);
    return decode(name, rows[0]) || null;
  },
};
