import multer from "multer";
import { HttpError } from "../utils/HttpError.js";

// Allowed MIME types -> safe file extension (never trust the uploaded file name).
const IMAGE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};
const VIDEO = { "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov" };
const AUDIO = {
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "audio/webm": ".weba",
};
const FILES = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "text/plain": ".txt",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
};

const ALL = { ...IMAGE, ...VIDEO, ...AUDIO, ...FILES };

export const mediaTypeOf = (mime) => {
  if (IMAGE[mime]) return "image";
  if (VIDEO[mime]) return "video";
  if (AUDIO[mime]) return "audio";
  return "file";
};

export const extFor = (mime) => ALL[mime] || "";

// Files are kept in memory; utils/storage.js sends them to Cloudinary (or local disk in dev).
const storage = multer.memoryStorage();

const build = (allowed, maxMb, label) =>
  multer({
    storage,
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) =>
      allowed[file.mimetype]
        ? cb(null, true)
        : cb(new HttpError(400, `Unsupported file type. Allowed: ${label}.`)),
  });

export const uploadAvatar = build(IMAGE, 5, "JPG, PNG, GIF, WEBP images").single("picture");
export const uploadMedia = build(
  ALL,
  50,
  "images, videos, audio, PDF, Office documents, TXT, ZIP"
).single("media");
