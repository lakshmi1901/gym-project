import app, { initialize } from "./app.js";
import { PORT } from "./config.js";
import { pool } from "./db.js";

try {
  await initialize();
  app.listen(PORT, () => console.log(`Gym API running on http://localhost:${PORT}`));
} catch (error) {
  console.error("Gym API could not start. Start MySQL in XAMPP and check .env database settings.");
  console.error(error.code || error.message);
  await pool.end();
  process.exitCode = 1;
}
