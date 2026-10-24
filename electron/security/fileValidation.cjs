// electron/security/fileValidation.cjs
const fs = require("node:fs");
const path = require("node:path");

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif", ".avif"]);
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("Invalid file path: path must be a non-empty string");
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Unsupported file extension: ${ext}`);
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    throw new Error(`Target is not a file: ${filePath}`);
  }

  if (stats.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(stats.size / (1024 * 1024)).toFixed(2)} MB) exceeds 100 MB limit`);
  }

  return true;
}

module.exports = {
  validateFilePath,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES
};
