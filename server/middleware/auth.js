import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { HttpError } from "../utils/HttpError.js";

export const verifyToken = (req, res, next) => {
  let token = req.header("Authorization") || "";
  if (token.startsWith("Bearer ")) token = token.slice(7).trim();
  if (!token) return next(new HttpError(401, "Access denied. Please log in."));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: String(payload.id) };
    next();
  } catch {
    next(new HttpError(401, "Session expired. Please log in again."));
  }
};

export const validateObjectIdParam = (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value)) return next(new HttpError(400, "Invalid id."));
  next();
};
