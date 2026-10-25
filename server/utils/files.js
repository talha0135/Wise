import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ASSETS_DIR = path.join(__dirname, "..", "public", "assets");
fs.mkdirSync(ASSETS_DIR, { recursive: true });

export const removeAsset = (fileName) => {
  if (!fileName) return;
  const safe = path.basename(fileName);
  fs.unlink(path.join(ASSETS_DIR, safe), () => {});
};
