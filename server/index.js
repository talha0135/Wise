import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { ASSETS_DIR } from "./utils/files.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const { MONGO_URL, JWT_SECRET } = process.env;
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

if (!MONGO_URL) {
  console.error("Missing MONGO_URL. Copy .env.example to .env and fill it in.");
  process.exit(1);
}
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error("JWT_SECRET must be set in .env and be at least 16 characters long.");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1); // needed behind Render/Vercel proxies (rate limiting, IPs)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "media-src": ["'self'", "blob:", "https:"],
        "upgrade-insecure-requests": null,
      },
    },
  })
);
app.use(morgan("dev"));
app.use(cors({ origin: CLIENT_URL.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/assets", express.static(ASSETS_DIR, { maxAge: "7d" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// Production: serve the built React website from this same server (one URL, no CORS).
const clientDist = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (/^\/(auth|users|posts|assets|health)(\/|$)/.test(req.path)) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`WISE API running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  });
