import express from "express";
import { db } from "../db.js";
import { withCalculatedExpiry } from "../membership.js";

// Same REST behaviour json-server gave the frontend, for one collection.
// Mounted behind the JWT middleware in index.js.
export function collectionRouter(name) {
  const router = express.Router();
  const handle = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);
  router.get("/", handle(async (req, res) => {
    let items = await db.all(name);
    // simple equality filters, e.g. /users_info?Gender=male
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") items = items.filter((i) => String(i[key]) === value);
    }
    res.json(items);
  }));

  router.get("/:id", handle(async (req, res) => {
    const item = await db.find(name, req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  }));

  router.post("/", handle(async (req, res) => {
    if (!isObject(req.body)) return res.status(400).json({ message: "JSON object expected" });
    // The registration form sends id: "" for a new member. Treat an empty
    // value as missing so the API generates a unique ID instead of colliding
    // with legacy records that also have an empty ID.
    const requestedId = req.body.id == null ? "" : String(req.body.id).trim();
    const id = requestedId || db.nextId(name);
    if (await db.find(name, id)) return res.status(409).json({ message: "id already exists" });
    const item = await db.insert(name, withCalculatedExpiry({ ...req.body, id }));
    res.status(201).json(item);
  }));

  router.put("/:id", handle(async (req, res) => {
    if (!isObject(req.body)) return res.status(400).json({ message: "JSON object expected" });
    const item = await db.replace(
      name,
      req.params.id,
      withCalculatedExpiry({ ...req.body, id: req.params.id }),
    );
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  }));

  router.patch("/:id", handle(async (req, res) => {
    if (!isObject(req.body)) return res.status(400).json({ message: "JSON object expected" });
    const current = await db.find(name, req.params.id);
    if (!current) return res.status(404).json({ message: "Not found" });
    const item = await db.replace(
      name,
      req.params.id,
      withCalculatedExpiry({ ...current, ...req.body, id: current.id }),
    );
    res.json(item);
  }));

  router.delete("/:id", handle(async (req, res) => {
    const removed = await db.remove(name, req.params.id);
    if (!removed) return res.status(404).json({ message: "Not found" });
    res.json(removed);
  }));

  return router;
}
