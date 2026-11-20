import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env"), quiet: true });
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const SQL_CONFIG = {
  host: process.env.DB_HOST || (IS_PRODUCTION ? "" : "127.0.0.1"),
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || (IS_PRODUCTION ? "" : "root"),
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || (IS_PRODUCTION ? "" : "gym_project"),
  charset: "utf8mb4",
  ...(process.env.DB_SSL === "true"
    ? {
        ssl: {
          rejectUnauthorized: true,
          ...(process.env.DB_SSL_CA
            ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, "\n") }
            : {}),
        },
      }
    : {}),
};
export const PORT = Number(process.env.PORT) || 3000;

// Legacy JSON file used only by the one-time importer.
export const DB_FILE = process.env.DB_FILE || path.join(ROOT, "db.json");

// JWT settings --------------------------------------------------------------
// Use JWT_SECRET from the environment if you have one. Otherwise a strong
// random secret is generated once and saved in server/.jwt-secret so that
// tokens keep working across server restarts (no setup needed).
function loadSecret() {
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length >= 32) return process.env.JWT_SECRET;
    if (IS_PRODUCTION) throw new Error("JWT_SECRET must be at least 32 characters in production.");
  }
  if (IS_PRODUCTION) throw new Error("JWT_SECRET must be configured in production.");
  const file = path.join(__dirname, ".jwt-secret");
  try {
    const existing = fs.readFileSync(file, "utf8").trim();
    if (existing.length >= 32) return existing;
  } catch {
    /* file does not exist yet */
  }
  const secret = crypto.randomBytes(48).toString("hex");
  fs.writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}

export const JWT_SECRET = loadSecret();
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
export const JWT_ISSUER = "beast-forces-gym";

// Account that is created automatically the first time the server starts
// (this is the login the project already used: beastgym@gmail.com / 1234).
export const DEFAULT_ADMIN = {
  name: "Beast Gym Admin",
  email: (process.env.DEFAULT_ADMIN_EMAIL || "beastgym@gmail.com").toLowerCase(),
  password: process.env.DEFAULT_ADMIN_PASSWORD || (IS_PRODUCTION ? "" : "1234"),
};
