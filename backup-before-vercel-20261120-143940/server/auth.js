import crypto from "node:crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_ISSUER } from "./config.js";
import { db } from "./db.js";

// Password hashing (Argon2id, OWASP recommended minimum settings) ------------
const ARGON_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export const hashPassword = (plain) => argon2.hash(plain, ARGON_OPTIONS);

export async function verifyPassword(hash, plain) {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// Used so a login for an unknown email takes as long as a real one.
let dummyHash = null;
export async function verifyAgainstDummy(plain) {
  if (!dummyHash) dummyHash = await hashPassword(crypto.randomBytes(16).toString("hex"));
  return verifyPassword(dummyHash, plain);
}

// JWT -----------------------------------------------------------------------
export function signAccessToken(account) {
  return jwt.sign(
    {
      purpose: "access",
      email: account.email,
      name: account.name,
      tv: account.tokenVersion || 0, // bumped on password change
    },
    JWT_SECRET,
    {
      algorithm: "HS256",
      subject: String(account.id),
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
    }
  );
}

export function signResetToken(account) {
  return jwt.sign({ purpose: "password-reset" }, JWT_SECRET, {
    algorithm: "HS256",
    subject: String(account.id),
    expiresIn: "10m",
    issuer: JWT_ISSUER,
    jwtid: crypto.randomUUID(),
  });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: JWT_ISSUER,
  });
}

// Express middleware: every route behind this needs "Authorization: Bearer <jwt>"
export async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required. Please login." });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please login again."
        : "Invalid token. Please login again.";
    return res.status(401).json({ message });
  }

  if (payload.purpose !== "access") {
    return res.status(401).json({ message: "Invalid token. Please login again." });
  }

  let account;
  try { account = await db.find("accounts", payload.sub); }
  catch (error) { return next(error); }
  if (!account) {
    return res.status(401).json({ message: "Account no longer exists." });
  }

  // Tokens issued before the last password change stop working.
  if ((payload.tv ?? 0) !== (account.tokenVersion || 0)) {
    return res.status(401).json({ message: "Password was changed. Please login again." });
  }

  req.user = { id: account.id, name: account.name, email: account.email };
  next();
}
