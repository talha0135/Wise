import express from "express";
import rateLimit from "express-rate-limit";
import { login, register, me } from "../controllers/auth.js";
import { uploadAvatar } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/HttpError.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

router.post("/register", limiter, uploadAvatar, asyncHandler(register));
router.post("/login", limiter, asyncHandler(login));
router.get("/me", verifyToken, asyncHandler(me));

export default router;
