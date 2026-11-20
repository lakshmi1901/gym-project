import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { DEFAULT_ADMIN } from "./config.js";
import { loadDb, db } from "./db.js";
import { authenticate, hashPassword } from "./auth.js";
import authRouter from "./routes/auth.js";
import { collectionRouter } from "./routes/members.js";

let initialization;
export function initialize() {
  if (!initialization) initialization = (async () => {
await loadDb();

// First start: create the default admin account (password is stored hashed).
if ((await db.all("accounts")).length === 0) {
  if (!DEFAULT_ADMIN.password) throw new Error("Set DEFAULT_ADMIN_PASSWORD before starting with an empty production database.");
  await db.insert("accounts", {
    id: crypto.randomUUID(),
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    passwordHash: await hashPassword(DEFAULT_ADMIN.password),
    createdAt: new Date().toISOString(),
  });
  console.log(`Default account created: ${DEFAULT_ADMIN.email}`);
}

  })().catch(error => { initialization = undefined; throw error; });
  return initialization;
}

const app = express();
const allowedOrigins = new Set((process.env.CORS_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean));

app.use(
  cors({
    origin: (origin, cb) =>
      cb(null, !origin || allowedOrigins.has(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)),
  })
);
app.use(express.json({ limit: "10mb" })); // profile photos are stored as base64

// ---------- public routes (no token needed) ----------
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/auth", authRouter);

// ---------- everything below needs a valid JWT ----------
app.use(authenticate);
app.use("/users_info", collectionRouter("users_info"));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ message: "Invalid JSON body" });
  if (err.type === "entity.too.large")
    return res.status(413).json({ message: "Request body too large" });
  if (err.code === "ER_DUP_ENTRY" || err.code === "23505") return res.status(409).json({ message: "An account or member with this identifier already exists." });
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

export default app;

