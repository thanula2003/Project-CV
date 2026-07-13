//app.js 

import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Must be first — before any other imports that read process.env
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cvRoutes from "./src/routes/cv.js";
import paymentRoutes from "./src/routes/payment.js";

const app = express();

const allowedOrigins = [
  // "http://localhost:5173",
  // "http://localhost:5174",
  // "http://192.168.1.100:5173",
  "https://atsfriendlycvbuilder.com",
  // process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json({ limit: "2mb" }));

// ── DB connection ──────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ── API routes ──────────────────────────────────────────────────
app.use("/api/cv", cvRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Serve built frontend ────────────────────────────────────────
// Assumes frontend/dist is uploaded alongside backend, one level up.
// Adjust FRONTEND_DIST_PATH below if your Hostinger folder layout differs.
const frontendDistPath = path.join(__dirname, "../dist");
app.use(express.static(frontendDistPath));

// Catch-all for React Router — must come AFTER /api routes,
// and must NOT swallow /api/* requests.
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));