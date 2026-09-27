import express from "express";
import reportsRoutes from "./routes/reports.routes.js";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import udhaarRoutes from "./routes/udhaar.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import supportRoutes from "./routes/support.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import {
  notFound,
  errorHandler,
} from "./middlewares/errorHandler.middleware.js";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((value) => value.trim())
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "VyaparSetu Backend",
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/udhaar", udhaarRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/reports", reportsRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
