import crypto from "node:crypto";
import express from "express";
import { db } from "../db.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config.js";
import {
  hashPassword,
  verifyPassword,
  verifyAgainstDummy,
  signAccessToken,
  signResetToken,
  verifyToken,
  authenticate,
} from "../auth.js";
import { rateLimit } from "../rateLimit.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (v) => String(v ?? "").trim().toLowerCase();
const publicUser = (a) => ({ id: a.id, name: a.name, email: a.email });

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function passwordProblem(password) {
  if (typeof password !== "string" || password.length < 8)
    return "Password must be at least 8 characters long.";
  if (password.length > 128) return "Password must be at most 128 characters long.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    return "Password must contain at least one letter and one number.";
  return null;
}

// --- rate limits -------------------------------------------------------------
const emailKey = (req) => `${req.ip}|${normalizeEmail(req.body?.email)}`;
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: emailKey,
  message: "Too many login attempts. Please try again in a few minutes.",
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  key: (req) => req.ip,
  message: "Too many accounts created. Please try again later.",
});
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  key: emailKey,
  message: "Too many OTP requests. Please try again in a few minutes.",
});

// =============================================================================
// POST /auth/register  -> create an account (password stored as an Argon2id hash)
// =============================================================================
router.post(
  "/register",
  registerLimiter,
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (name.length < 2 || name.length > 60)
      return res.status(400).json({ message: "Name must be between 2 and 60 characters." });
    if (!EMAIL_RE.test(email) || email.length > 254)
      return res.status(400).json({ message: "Please enter a valid email address." });
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });

    if (await db.findBy("accounts", "email", email))
      return res.status(409).json({ message: "An account with this email already exists." });

    const account = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    // Re-check: another request may have registered the same email while hashing.
    if (await db.findBy("accounts", "email", email))
      return res.status(409).json({ message: "An account with this email already exists." });

    await db.insert("accounts", account);
    res.status(201).json({ message: "Account created successfully.", user: publicUser(account) });
  })
);

// =============================================================================
// POST /auth/login  -> verify password, return a JWT
// =============================================================================
router.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || typeof password !== "string" || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const account = await db.findBy("accounts", "email", email);
    const ok = account
      ? await verifyPassword(account.passwordHash, password)
      : await verifyAgainstDummy(password);

    if (!account || !ok)
      return res.status(401).json({ message: "Email or password is incorrect!" });

    loginLimiter.reset(req.rateLimitKey);
    res.json({
      message: "Login successful.",
      token: signAccessToken(account),
      tokenType: "Bearer",
      expiresIn: JWT_EXPIRES_IN,
      user: publicUser(account),
    });
  })
);

// GET /auth/me  -> who am I (needs the JWT)
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

// =============================================================================
// Forgot password: forgot-password -> verify-otp -> reset-password
// =============================================================================
// There is no email service in this project, so the OTP is printed in the
// terminal where the server is running (instead of being emailed).
const otps = new Map(); // email -> { hash, expiresAt, attempts }
const usedResetTokens = new Set();
const otpHash = (otp) => crypto.createHmac("sha256", JWT_SECRET).update(String(otp)).digest();

router.post(
  "/forgot-password",
  otpRequestLimiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ message: "Please enter a valid email address." });

    // Same answer whether or not the email exists (no account enumeration).
    if (await db.findBy("accounts", "email", email)) {
      const otp = crypto.randomInt(1000, 10000);
      otps.set(email, { hash: otpHash(otp), expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 });
      console.log(`\n[PASSWORD RESET OTP] ${email} -> ${otp}  (valid for 10 minutes)\n`);
    }
    res.json({ message: "If this email is registered, an OTP has been generated." });
  })
);

router.post(
  "/verify-otp",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    key: emailKey,
    message: "Too many attempts. Please try again later.",
  }),
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp ?? "").trim();
    const entry = otps.get(email);

    if (!entry || entry.expiresAt < Date.now()) {
      otps.delete(email);
      return res.status(400).json({ message: "OTP expired or not requested. Please request a new one." });
    }
    if (entry.attempts >= 5) {
      otps.delete(email);
      return res.status(429).json({ message: "Too many wrong attempts. Please request a new OTP." });
    }

    const given = otpHash(otp);
    if (!crypto.timingSafeEqual(given, entry.hash)) {
      entry.attempts += 1;
      return res.status(400).json({ message: "OTP is incorrect !" });
    }

    otps.delete(email);
    const account = await db.findBy("accounts", "email", email);
    if (!account) return res.status(400).json({ message: "Account not found." });
    res.json({ message: "OTP verified.", resetToken: signResetToken(account) });
  })
);

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { resetToken, password } = req.body ?? {};

    let payload;
    try {
      payload = verifyToken(String(resetToken ?? ""));
    } catch {
      return res.status(401).json({ message: "Reset session expired. Please start again." });
    }
    if (payload.purpose !== "password-reset" || usedResetTokens.has(payload.jti))
      return res.status(401).json({ message: "Reset session is not valid. Please start again." });

    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });

    const account = await db.find("accounts", payload.sub);
    if (!account) return res.status(400).json({ message: "Account not found." });

    usedResetTokens.add(payload.jti);
    account.passwordHash = await hashPassword(password);
    account.passwordChangedAt = new Date().toISOString();
    account.tokenVersion = (account.tokenVersion || 0) + 1; // logs out old sessions
    await db.replace("accounts", account.id, account);
    res.json({ message: "Password updated. Please login with your new password." });
  })
);

export default router;
