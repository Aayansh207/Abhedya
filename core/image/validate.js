// core/image/validate.js
import fs from "node:fs/promises";
import sharp from "sharp";
import { ImageValidationError } from "../errors.js";

export const IMAGE_LIMITS = {
  MIN_WIDTH: 16,
  MIN_HEIGHT: 16,
  MAX_WIDTH: 8192,
  MAX_HEIGHT: 8192,
  MAX_TOTAL_PIXELS: 67_108_864, // 64 Megapixels (e.g. 8192 x 8192)
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024 // 100 MB
};

export const SUPPORTED_FORMATS = new Set([
  "png",
  "jpeg",
  "jpg",
  "webp",
  "tiff",
  "tif",
  "avif",
  "bmp"
]);

/**
 * Validates an image source (file path or Buffer) and retrieves Sharp metadata.
 * Enforces security limits on file size, dimensions, and total pixels.
 *
 * @param {string | Buffer | Uint8Array} input
 * @returns {Promise<{ metadata: import("sharp").Metadata, buffer: Buffer }>}
 */
export async function validateImageInput(input) {
  if (!input) {
    throw new ImageValidationError("Image input is required (file path or Buffer)");
  }

  let buffer;
  if (typeof input === "string") {
    try {
      const stats = await fs.stat(input);
      if (!stats.isFile()) {
        throw new ImageValidationError(`Image path is not a file: ${input}`);
      }
      if (stats.size > IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
        throw new ImageValidationError(
          `Image file exceeds maximum allowed size of ${IMAGE_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB (size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB)`
        );
      }
      if (stats.size === 0) {
        throw new ImageValidationError("Image file is empty (0 bytes)");
      }
      buffer = await fs.readFile(input);
    } catch (err) {
      if (err instanceof ImageValidationError) throw err;
      throw new ImageValidationError(`Failed to read image file from path: ${err.message}`);
    }
  } else if (Buffer.isBuffer(input) || input instanceof Uint8Array) {
    buffer = Buffer.from(input);
    if (buffer.length > IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
      throw new ImageValidationError(
        `Image buffer exceeds maximum allowed size of ${IMAGE_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`
      );
    }
    if (buffer.length === 0) {
      throw new ImageValidationError("Image buffer is empty (0 bytes)");
    }
  } else {
    throw new ImageValidationError("Image input must be a file path string or Buffer/Uint8Array");
  }

  let metadata;
  try {
    metadata = await sharp(buffer, { failOn: "error" }).metadata();
  } catch (err) {
    throw new ImageValidationError(`Failed to parse image metadata or corrupt image format: ${err.message}`);
  }

  if (!metadata || !metadata.format) {
    throw new ImageValidationError("Could not determine image format");
  }

  const format = metadata.format.toLowerCase();
  if (!SUPPORTED_FORMATS.has(format)) {
    throw new ImageValidationError(
      `Unsupported image format: "${format}". Supported formats: ${Array.from(SUPPORTED_FORMATS).join(", ")}`
    );
  }

  const width = metadata.width;
  const height = metadata.height;

  if (!width || !height || width < IMAGE_LIMITS.MIN_WIDTH || height < IMAGE_LIMITS.MIN_HEIGHT) {
    throw new ImageValidationError(
      `Image dimensions are too small (${width}x${height}). Minimum is ${IMAGE_LIMITS.MIN_WIDTH}x${IMAGE_LIMITS.MIN_HEIGHT}`
    );
  }

  if (width > IMAGE_LIMITS.MAX_WIDTH || height > IMAGE_LIMITS.MAX_HEIGHT) {
    throw new ImageValidationError(
      `Image dimensions exceed maximum allowed (${width}x${height}). Maximum is ${IMAGE_LIMITS.MAX_WIDTH}x${IMAGE_LIMITS.MAX_HEIGHT}`
    );
  }

  const totalPixels = width * height;
  if (totalPixels > IMAGE_LIMITS.MAX_TOTAL_PIXELS) {
    throw new ImageValidationError(
      `Total pixel count (${totalPixels}) exceeds maximum allowed limit of ${IMAGE_LIMITS.MAX_TOTAL_PIXELS}`
    );
  }

  return { metadata, buffer };
}
