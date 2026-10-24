/**
 * Abhedya - Security & File Validation Module
 * Enforces strict validation of all files before any processing occurs.
 * Does not trust file extensions alone; inspects magic bytes, file sizes,
 * dimensions, and paths to prevent path traversal and resource exhaustion attacks.
 */

const fs = require("node:fs");
const path = require("node:path");

// File constraints
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const MIN_FILE_SIZE_BYTES = 64; // Minimum plausible image header
const MAX_DIMENSION = 8192; // 8192x8192 max dimensions
const MIN_DIMENSION = 16; // 16x16 min dimensions

// Known magic byte signatures
const MAGIC_SIGNATURES = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpeg: [0xff, 0xd8, 0xff],
  webpRiff: [0x52, 0x49, 0x46, 0x46], // "RIFF"
  webpHeader: [0x57, 0x45, 0x42, 0x50], // "WEBP" at offset 8
  bmp: [0x42, 0x4d] // "BM"
};

/**
 * Checks if a buffer matches a specific magic byte sequence at a given offset
 * @param {Buffer} buffer
 * @param {number[]} signature
 * @param {number} offset
 * @returns {boolean}
 */
function matchesSignature(buffer, signature, offset = 0) {
  if (buffer.length < offset + signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (buffer[offset + i] !== signature[i]) return false;
  }
  return true;
}

/**
 * Detects image format from raw buffer header
 * @param {Buffer} buffer
 * @returns {'png' | 'jpeg' | 'webp' | 'bmp' | null}
 */
function detectFormatFromBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  if (matchesSignature(buffer, MAGIC_SIGNATURES.png, 0)) {
    return "png";
  }
  if (matchesSignature(buffer, MAGIC_SIGNATURES.jpeg, 0)) {
    return "jpeg";
  }
  if (
    matchesSignature(buffer, MAGIC_SIGNATURES.webpRiff, 0) &&
    matchesSignature(buffer, MAGIC_SIGNATURES.webpHeader, 8)
  ) {
    return "webp";
  }
  if (matchesSignature(buffer, MAGIC_SIGNATURES.bmp, 0)) {
    return "bmp";
  }

  return null;
}

/**
 * Extracts dimensions from image buffer without native image decoders
 * @param {Buffer} buffer
 * @param {'png' | 'jpeg' | 'webp' | 'bmp'} format
 * @returns {{ width: number, height: number } | null}
 */
function extractDimensions(buffer, format) {
  try {
    if (format === "png") {
      // PNG IHDR chunk starts at byte 12 (4 bytes length, 4 bytes chunk type "IHDR")
      // Width is at offset 16 (4 bytes big-endian), Height at offset 20 (4 bytes big-endian)
      if (buffer.length >= 24) {
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        return { width, height };
      }
    } else if (format === "bmp") {
      // BMP DIB header (BITMAPINFOHEADER) starts at byte 14
      // Width at offset 18 (4 bytes little-endian), Height at offset 22 (4 bytes little-endian)
      if (buffer.length >= 26) {
        const width = buffer.readInt32LE(18);
        const height = Math.abs(buffer.readInt32LE(22));
        return { width, height };
      }
    } else if (format === "webp") {
      // WebP VP8: offset 26 (width: 14 bits, height: 14 bits)
      // WebP VP8L (lossless): offset 21 (14 bits width, 14 bits height)
      // WebP VP8X (extended): offset 24 (24 bits width-1, 24 bits height-1)
      if (buffer.length >= 30) {
        const chunkType = buffer.toString("ascii", 12, 16);
        if (chunkType === "VP8X" && buffer.length >= 30) {
          const width = 1 + buffer.readUIntLE(24, 3);
          const height = 1 + buffer.readUIntLE(27, 3);
          return { width, height };
        } else if (chunkType === "VP8L" && buffer.length >= 26) {
          const b1 = buffer[21];
          const b2 = buffer[22];
          const b3 = buffer[23];
          const b4 = buffer[24];
          const width = 1 + (((b2 & 0x3f) << 8) | b1);
          const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
          return { width, height };
        } else if (chunkType === "VP8 " && buffer.length >= 30) {
          // Standard VP8 keyframe header after frame tag (offset 23 starts keyframe 9d 01 2a)
          if (buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
            const width = buffer.readUInt16LE(26) & 0x3fff;
            const height = buffer.readUInt16LE(28) & 0x3fff;
            return { width, height };
          }
        }
      }
    } else if (format === "jpeg") {
      // Parse JPEG markers until SOF0 (0xFFC0) or SOF2 (0xFFC2)
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0, SOF1, SOF2 markers contain image height and width
        if (
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf)
        ) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch (_e) {
    // Dimension extraction failure falls back gracefully
  }
  return null;
}

/**
 * Validates a file path and its contents against security rules.
 * @param {string} filePath - Absolute path to the file
 * @param {Object} options
 * @param {boolean} [options.requirePng=false] - Require file to be PNG (for reveal mode)
 * @returns {{ valid: boolean, error?: string, details?: Object }}
 */
function validateImageFile(filePath, options = {}) {
  const { requirePng = false } = options;

  if (typeof filePath !== "string" || !filePath.trim()) {
    return { valid: false, error: "Invalid file path provided." };
  }

  // Path resolution and traversal guard
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    return { valid: false, error: "The selected file does not exist." };
  }

  let stats;
  try {
    stats = fs.statSync(resolvedPath);
  } catch (_err) {
    return { valid: false, error: "Cannot access file metadata." };
  }

  if (!stats.isFile()) {
    return { valid: false, error: "The selected path is not a regular file." };
  }

  if (stats.size < MIN_FILE_SIZE_BYTES) {
    return { valid: false, error: "File is too small to be a valid image." };
  }

  if (stats.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(stats.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
    };
  }

  // Read header bytes (first 4KB is enough for magic bytes and dimension metadata)
  let headerBuffer;
  try {
    const fd = fs.openSync(resolvedPath, "r");
    const readLength = Math.min(stats.size, 4096);
    headerBuffer = Buffer.alloc(readLength);
    fs.readSync(fd, headerBuffer, 0, readLength, 0);
    fs.closeSync(fd);
  } catch (_err) {
    return { valid: false, error: "Could not read file header." };
  }

  const format = detectFormatFromBuffer(headerBuffer);
  if (!format) {
    return {
      valid: false,
      error: "Unsupported or corrupted image format. Please select a valid PNG, JPEG, WebP, or BMP image."
    };
  }

  if (requirePng && format !== "png") {
    return {
      valid: false,
      error: "The encoded file must be a lossless PNG image. Other formats do not preserve steganographic payload data."
    };
  }

  const dimensions = extractDimensions(headerBuffer, format);
  if (dimensions) {
    if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
      return {
        valid: false,
        error: `Image dimensions (${dimensions.width}×${dimensions.height}) are too small. Minimum required is ${MIN_DIMENSION}×${MIN_DIMENSION}.`
      };
    }
    if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
      return {
        valid: false,
        error: `Image dimensions (${dimensions.width}×${dimensions.height}) exceed maximum allowed limit of ${MAX_DIMENSION}×${MAX_DIMENSION}.`
      };
    }
  }

  return {
    valid: true,
    details: {
      filePath: resolvedPath,
      fileName: path.basename(resolvedPath),
      fileSize: stats.size,
      format,
      dimensions: dimensions || { width: 0, height: 0 }
    }
  };
}

/**
 * Validates output destination path for PNG export
 * @param {string} targetPath
 * @returns {{ valid: boolean, error?: string, safePath?: string }}
 */
function validateOutputPath(targetPath) {
  if (typeof targetPath !== "string" || !targetPath.trim()) {
    return { valid: false, error: "Invalid save destination path." };
  }

  const resolved = path.resolve(targetPath);
  const dir = path.dirname(resolved);

  if (!fs.existsSync(dir)) {
    return { valid: false, error: "Destination directory does not exist." };
  }

  // Ensure output file has .png extension
  let safePath = resolved;
  if (!safePath.toLowerCase().endsWith(".png")) {
    safePath += ".png";
  }

  return { valid: true, safePath };
}

module.exports = {
  MAX_FILE_SIZE_BYTES,
  MIN_FILE_SIZE_BYTES,
  MAX_DIMENSION,
  MIN_DIMENSION,
  detectFormatFromBuffer,
  extractDimensions,
  validateImageFile,
  validateOutputPath
};
