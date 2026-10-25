import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HttpError } from "../utils/HttpError.js";
import { removeFile, saveFile } from "../utils/storage.js";
import { buildUser } from "../utils/serialize.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v) => (typeof v === "string" ? v.trim() : "");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const register = async (req, res) => {
  const file = req.file;
  const firstName = str(req.body.firstName);
  const lastName = str(req.body.lastName);
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const location = str(req.body.location);
  const occupation = str(req.body.occupation);

  if (firstName.length < 2 || firstName.length > 50) throw new HttpError(400, "First name must be 2-50 characters.");
  if (lastName.length < 2 || lastName.length > 50) throw new HttpError(400, "Last name must be 2-50 characters.");
  if (!EMAIL_RE.test(email) || email.length > 100) throw new HttpError(400, "Please enter a valid email address.");
  if (password.length < 8 || password.length > 72) throw new HttpError(400, "Password must be 8-72 characters.");
  if (!location || location.length > 100) throw new HttpError(400, "Location is required (max 100 characters).");
  if (!occupation || occupation.length > 100) throw new HttpError(400, "Occupation is required (max 100 characters).");
  if (!file) throw new HttpError(400, "Profile picture is required.");

  if (await User.exists({ email })) throw new HttpError(409, "An account with this email already exists.");

  const passwordHash = await bcrypt.hash(password, 12);
  const picturePath = await saveFile(file);
  try {
    await User.create({ firstName, lastName, email, password: passwordHash, picturePath, location, occupation });
  } catch (err) {
    await removeFile(picturePath);
    throw err;
  }
  res.status(201).json({ message: "Registered successfully." });
};

export const login = async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!email || !password) throw new HttpError(400, "Email and password are required.");

  const user = await User.findOne({ email }).select("+password");
  const ok = user ? await bcrypt.compare(password, user.password) : false;
  if (!ok) throw new HttpError(401, "Invalid email or password.");

  res.json({ token: signToken(user._id), user: await buildUser(user._id, { self: true }) });
};

export const me = async (req, res) => {
  const user = await buildUser(req.user.id, { self: true });
  if (!user) throw new HttpError(401, "Account no longer exists.");
  res.json(user);
};
