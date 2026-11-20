import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';

// Isolated disposable database; never touches the configured application DB.
process.env.DB_NAME = `gym_test_${crypto.randomBytes(8).toString('hex')}`;
process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
process.env.PORT = '31987';
const { loadDb, db, pool } = await import('./db.js');
const { DB_FILE } = await import('./config.js');
process.env.DB_FILE = DB_FILE;
let server;
try {
  await loadDb();
  const source = JSON.parse(await fs.readFile(process.env.DB_FILE, 'utf8'));
  for (let pass = 0; pass < 2; pass++) {
    const result = spawnSync(process.execPath, ['server/import-json.js'], { env: process.env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
  assert.equal((await db.all('accounts')).length, source.accounts.length);
  assert.equal((await db.all('users_info')).length, source.users_info.length);
  for (const account of source.accounts) {
    assert.equal((await db.find('accounts', account.id)).passwordHash, account.passwordHash);
  }
  server = spawn(process.execPath, ['server/index.js'], { env: process.env, stdio: 'ignore' });
  const url = `http://127.0.0.1:${process.env.PORT}`;
  for (let n = 0; n < 60; n++) {
    try { if ((await fetch(`${url}/health`)).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  let token;
  async function request(method, path, body, status = 200) {
    const response = await fetch(url + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = await response.json();
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(json)}`);
    return json;
  }
  await request('GET', '/users_info', null, 401);
  const credentials = { name: 'SQL Test', email: 'sql-test@example.test', password: 'TestPassword8274' };
  await request('POST', '/auth/register', credentials, 201);
  await request('POST', '/auth/register', credentials, 409);
  await request('POST', '/auth/login', { ...credentials, password: 'wrong' }, 401);
  token = (await request('POST', '/auth/login', credentials)).token;
  const me = await request('GET', '/auth/me');
  const item = await request('POST', '/users_info', { id: '', Name: 'SQL Test', joining_date: '2026-01-31', Membership_duration: '1 month', payment: [{ amount: 500 }], checked: false }, 201);
  assert.equal(item.expired, '2026-02-28');
  assert.deepEqual((await request('GET', `/users_info/${item.id}`)).payment, [{ amount: 500 }]);
  assert.equal((await request('PATCH', `/users_info/${item.id}`, { Name: 'Updated' })).Name, 'Updated');
  assert.equal((await request('GET', '/users_info?Name=Updated')).length, 1);
  await request('PUT', `/users_info/${item.id}`, { Name: 'Replaced' });
  await request('DELETE', `/users_info/${item.id}`);
  await request('GET', `/users_info/${item.id}`, null, 404);
  const account = await db.find('accounts', me.user.id);
  await db.replace('accounts', account.id, { ...account, tokenVersion: 1 });
  await request('GET', '/auth/me', null, 401);
  console.log('PASS: repeatable import, hashes preserved, authentication, duplicate rejection, member CRUD/filter/expiry, token invalidation.');
} finally {
  if (server && server.exitCode === null) {
    await new Promise(resolve => { server.once('exit', resolve); server.kill(); });
  }
  await pool.query(`DROP DATABASE \`${process.env.DB_NAME}\``);
  await pool.end();
}
