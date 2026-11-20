<<<<<<< HEAD
# Beast Forces Gym

React/Vite frontend, Express API, and MySQL database.

## Run locally with XAMPP

1. Start **MySQL** in the XAMPP Control Panel. Start **Apache** if you want to use phpMyAdmin.
2. Run `npm install`.
3. Copy `.env.example` to `.env`. The defaults use XAMPP's local MySQL (`127.0.0.1:3306`, user `root`, no password, database `gym_project`).
4. Run `npm start`.

The frontend is at `http://localhost:5173`, the API at `http://localhost:3000`, and phpMyAdmin at `http://localhost/phpmyadmin`. The API creates the local database and tables if needed. You can also run the API and frontend separately with `npm run server` and `npm run dev`.

## Deploy on Render with hosted MySQL

The application uses SQL/MySQL; it does not use XAMPP or `db.json` as its live database. For deployment, use a MySQL-compatible database provider that accepts connections from Render, then deploy the API and frontend as separate Render services.

### API service

Create a Render **Web Service** for this repository. Use `npm install` as the build command and `npm run server` as the start command. Set these environment variables in Render (do not commit credentials):

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: connection details from the hosted MySQL provider. The database must already exist; the API creates its tables at startup.
- `DB_SSL=true` if required by the provider. If it supplies a CA certificate, set `DB_SSL_CA` to that certificate.
- `JWT_SECRET`: a private random value of at least 32 characters.
- `DEFAULT_ADMIN_PASSWORD`: a strong password, required when the hosted database has no accounts yet.
- `CORS_ORIGINS`: the exact public URL of the frontend, for example `https://your-site.onrender.com`.

Render sets `NODE_ENV=production`; the API will refuse to start if database credentials or `JWT_SECRET` are missing instead of silently trying a local database.

### Frontend service

Create a Render **Static Site** for the same repository. Set the build command to `npm install && npm run build`, the publish directory to `dist`, and the build environment variable `VITE_API_URL` to the public API URL, for example `https://your-api.onrender.com`. This value is embedded during the frontend build, so set it before deploying.

### Move existing data

For data already in local XAMPP MySQL, export the `gym_project` database from phpMyAdmin and import it into the hosted MySQL database. For data still in the legacy `db.json`, configure the database environment variables locally to point at the hosted database and run `npm run db:import`. The importer skips duplicate IDs/emails; it does not overwrite existing SQL records. Keep backups private.

## Database and authentication

- `server/schema.sql` defines `accounts` and `users_info`. Member records use a JSON column so existing mixed-case fields, profile pictures, and payment history are retained.
- All live reads and writes use MySQL. `db.json` is only a legacy import source.
- Passwords are stored as Argon2id hashes. JWTs use `JWT_SECRET`; never expose it or database credentials.
- Password reset OTPs print in the API terminal; email delivery is not configured.
=======
# gym-project
>>>>>>> c7cd9869f97c2ba2e38340bc5bf93e5502877b10
