import fs from "fs";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { ASSETS_DIR, removeAsset } from "./files.js";
import { extFor, mediaTypeOf } from "../middleware/upload.js";

// Cloudinary is used when all three variables are set (production).
// Otherwise files go to server/public/assets (local development).
const cloudEnabled = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const configure = () =>
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

/** Saves an uploaded (in-memory) file. Returns a full https URL (Cloudinary) or a local file name. */
export const saveFile = async (file) => {
  const random = crypto.randomBytes(8).toString("hex");

  if (cloudEnabled()) {
    configure();
    const options = { folder: "wise", resource_type: "auto" };
    if (mediaTypeOf(file.mimetype) === "file") {
      // documents/zips are stored as raw files; keep the extension so downloads open correctly
      options.resource_type = "raw";
      options.public_id = `${random}${extFor(file.mimetype)}`;
    }
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(options, (err, r) => (err ? reject(err) : resolve(r)))
        .end(file.buffer);
    });
    return result.secure_url;
  }

  const name = `${Date.now()}-${random}${extFor(file.mimetype)}`;
  await fs.promises.writeFile(path.join(ASSETS_DIR, name), file.buffer);
  return name;
};

/** Deletes a file previously returned by saveFile. Never throws. */
export const removeFile = async (ref) => {
  if (!ref) return;
  if (/^https?:\/\//.test(ref)) {
    if (!cloudEnabled()) return;
    const m = ref.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)$/);
    if (!m) return;
    configure();
    const publicId = m[1] === "raw" ? m[2] : m[2].replace(/\.[^./]+$/, "");
    try {
      await cloudinary.uploader.destroy(decodeURIComponent(publicId), { resource_type: m[1] });
    } catch (e) {
      console.error("Cloudinary delete failed:", e.message);
    }
    return;
  }
  removeAsset(ref);
};
