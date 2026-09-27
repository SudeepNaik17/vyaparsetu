import "dotenv/config";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

const root = fileURLToPath(new URL("../", import.meta.url));
const dbPath = path.join(root, ".local-data-mongo");
await mkdir(dbPath, { recursive: true });
process.env.MONGOMS_DOWNLOAD_DIR ||= path.join(root, ".cache", "mongodb");
process.env.MONGOMS_PREFER_GLOBAL_PATH = "false";
process.env.JWT_SECRET =
  process.env.JWT_SECRET?.length >= 32 &&
  !/replace_with|change_this/.test(process.env.JWT_SECRET)
    ? process.env.JWT_SECRET
    : crypto.randomBytes(48).toString("hex");
process.env.TZ ||= "Asia/Kolkata";

let repl;
let server;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (repl) await repl.stop({ doCleanup: false });
  process.exit(code);
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());
try {
  console.log("Starting local MongoDB (first run may download the database binary)...");
  repl = await MongoMemoryReplSet.create({
    instanceOpts: [{ port: 27028, dbPath }],
    replSet: { count: 1, name: "vyaparsetu-local", ip: "127.0.0.1", storageEngine: "wiredTiger" },
  });
  // Local mode deliberately uses its own persistent database, not the hosted URI.
  process.env.MONGO_URI = repl.getUri("vyaparsetu");
  const { connectDB } = await import("../src/config/database.js");
  const { default: app } = await import("../src/app.js");
  await connectDB();
  const port = Number(process.env.PORT) || 4000;
  server = app.listen(port, "127.0.0.1", () => {
    console.log(`Backend ready on http://127.0.0.1:${port}`);
    console.log(`Local records are saved in ${dbPath}`);
  });
  server.on("error", (error) => {
    console.error("API startup failed:", error.message);
    void stop(1);
  });
} catch (error) {
  console.error("Local startup failed:", error.message);
  await stop(1);
}
