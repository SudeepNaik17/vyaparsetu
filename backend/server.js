import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}
import app from "./src/app.js";
import { connectDB } from "./src/config/database.js";
const PORT = Number(process.env.PORT) || 4000;
process.env.TZ ||= "Asia/Kolkata";
try {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    /replace_with|change_this/.test(process.env.JWT_SECRET)
  )
    throw new Error("Set JWT_SECRET to at least 32 random characters");
  await connectDB();
  const server = app.listen(PORT, process.env.HOST || "127.0.0.1", () =>
    console.log("Backend ready on http://127.0.0.1:" + PORT),
  );
  process.on("SIGTERM", () => server.close(() => process.exit(0)));
} catch (error) {
  console.error(
    "Startup failed. Check MONGO_URI, database access, and JWT_SECRET. ",error.message,
  );
  process.exit(1);
}
