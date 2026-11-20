import './config.js';
import { pool as source, db as sourceDb } from './mysql-db.js';
import { pool as target, loadDb, insertRecord } from './postgres-db.js';

// Read the existing local MySQL database; never modifies source records.
try {
  const accounts = await sourceDb.all('accounts');
  const members = await sourceDb.all('users_info');
  if (!accounts.length) throw new Error('No source accounts; refusing an empty migration.');
  await loadDb();
  const client = await target.connect();
  try {
    await client.query('BEGIN');
    let copied = 0, skipped = 0;
    for (const [name, records] of [['accounts', accounts], ['users_info', members]]) {
      for (const item of records) {
        await client.query('SAVEPOINT record_import');
        try { await insertRecord(client, name, item); copied++; }
        catch (error) {
          if (error.code !== '23505') throw error;
          await client.query('ROLLBACK TO SAVEPOINT record_import');
          skipped++;
        }
        await client.query('RELEASE SAVEPOINT record_import');
      }
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({ copied, skipped, accounts: accounts.length, members: members.length }));
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
} catch (error) {
  console.error('Migration failed:', error.code || error.message);
  process.exitCode = 1;
} finally { await source.end(); await target.end(); }
