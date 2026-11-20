# Beast Forces Gym

React/Vite frontend, Express API, local MySQL or hosted Supabase PostgreSQL.

## Vercel production

Connect the Supabase integration to the project in Vercel. It supplies POSTGRES_URL
and SUPABASE_JWT_SECRET. The API selects PostgreSQL when POSTGRES_URL or DATABASE_URL
is present; otherwise it uses MySQL. The frontend uses the same-origin /api endpoint.

Gym records are kept in the private gym_private schema. Database connections verify
TLS using the official bundled Supabase CA; POSTGRES_SSL_CA can override the CA for
another provider. An explicit JWT_SECRET takes priority; otherwise a separate gym
signing key is derived from the server-only Supabase secret. Never expose these
secrets using VITE_ variables or commit .env files.

Production registration requires an existing staff login, since all accounts share
member records. Existing accounts and passwords are preserved during migration.
Password reset email delivery is not configured; the existing reset flow logs OTPs.

## Local MySQL

Start MySQL in XAMPP, configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME in
.env (see .env.example), and run npm install followed by npm start.
The frontend runs on localhost:5173 and the API on localhost:3000.
For the legacy JSON-to-MySQL import, run npm run db:import before starting the server.

## Migration and checks

With the local MySQL settings and destination POSTGRES_URL configured, run
node server/migrate-postgres.js. This copies accounts and members, preserves password
hashes, skips duplicates and never modifies the local source. Back up data first.

Run npm run build to validate the frontend. Run node server/postgres-smoke-test.js
against PostgreSQL for login, authorization, member CRUD, expiry and token tests.
All test records are contained in a transaction which is rolled back.
