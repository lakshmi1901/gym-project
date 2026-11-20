import fs from 'node:fs/promises';
import { DB_FILE } from './config.js';
import { loadDb, pool, insertRecord } from './db.js';
import { withCalculatedExpiry } from './membership.js';
try {
  const source = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  await loadDb();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let imported = 0, skipped = 0;
    for (const name of ['accounts', 'users_info']) {
      for (const original of source[name] || []) {
        const item = name === 'users_info' ? withCalculatedExpiry(original) : original;
        if (item.id == null) throw new Error(`Missing ID in ${name}; import cancelled.`);
        try { await insertRecord(connection, name, item); imported++; }
        catch (error) { if (error.code !== 'ER_DUP_ENTRY') throw error; skipped++; }
      }
    }
    await connection.commit();
    console.log(`Import complete: ${imported} imported, ${skipped} existing records skipped. db.json unchanged.`);
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
} catch (error) {
  console.error(`Import failed: ${error.message}`);
  process.exitCode = 1;
} finally { await pool.end(); }
