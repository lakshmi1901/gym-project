import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { once } from 'node:events';
import './config.js';
import app, { initialize } from './app.js';
import { pool, db } from './db.js';
await initialize();
const client = await pool.connect();
await client.query('BEGIN');
const originalQuery = pool.query.bind(pool);
pool.query = client.query.bind(client);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
let token;
async function request(method, path, body, status = 200) {
  const response = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await response.json();
  assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(json)}`);
  return json;
}
try {
  await request('GET','/health');
  await request('GET','/users_info',null,401);
  const credentials = { name:'Deployment Test', email:`test-${crypto.randomUUID()}@example.test`, password:crypto.randomBytes(20).toString('hex') };
  await request('POST','/auth/register',credentials,201);
  await request('POST','/auth/register',credentials,409);
  await request('POST','/auth/login',{...credentials,password:'incorrect'},401);
  token = (await request('POST','/auth/login',credentials)).token;
  const me = await request('GET','/auth/me');
  const item = await request('POST','/users_info',{Name:'Deployment Test',joining_date:'2026-01-31',Membership_duration:'1 month',payment:[{amount:500}],checked:false},201);
  assert.equal(item.expired,'2026-02-28');
  assert.deepEqual((await request('GET',`/users_info/${item.id}`)).payment,[{amount:500}]);
  assert.equal((await request('PATCH',`/users_info/${item.id}`,{Name:'Updated'})).Name,'Updated');
  await request('PUT',`/users_info/${item.id}`,{Name:'Replaced'});
  await request('DELETE',`/users_info/${item.id}`);
  await request('GET',`/users_info/${item.id}`,null,404);
  const account = await db.find('accounts',me.user.id);
  await db.replace('accounts',account.id,{...account,tokenVersion:1});
  await request('GET','/auth/me',null,401);
  console.log('PASS: PostgreSQL login, duplicate rejection, authorization, member CRUD, JSON preservation, expiry and token invalidation. All test data rolled back.');
} finally {
  await new Promise(resolve=>server.close(resolve));
  pool.query = originalQuery;
  await client.query('ROLLBACK');
  client.release();
  await pool.end();
}
