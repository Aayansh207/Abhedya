// core/image/encode.js
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ImageValidationError } from "../errors.js";

/**
 * Encodes a normalized raw RGBA pixel buffer back into a lossless PNG image.
 *
 * @param {Buffer | Uint8Array} pixelData - Raw RGBA pixel buffer
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {object} [options]
 * @param {string} [options.outputPath] - Optional path to write output PNG file
 * @param {number} [options.compressionLevel=9] - PNG zlib compression level (0-9)
 * @returns {Promise<{ pngBuffer: Buffer, width: number, height: number, outputPath?: string }>}
 */
export async function encodePng(pixelData, width, height, options = {}) {
  if (!pixelData || (!Buffer.isBuffer(pixelData) && !(pixelData instanceof Uint8Array))) {
    throw new ImageValidationError("pixelData must be a Buffer or Uint8Array");
  }

  if (!width || !height || width <= 0 || height <= 0) {
    throw new ImageValidationError(`Invalid image dimensions for encode: ${width}x${height}`);
  }

  const expectedLength = width * height * 4;
  if (pixelData.length !== expectedLength) {
    throw new ImageValidationError(
      `Pixel data length (${pixelData.length}) does not match expected RGBA length (${expectedLength}) for ${width}x${height}`
    );
  }

  const compressionLevel =
    typeof options.compressionLevel === "number" ? Math.max(0, Math.min(9, options.compressionLevel)) : 9;

  let pngBuffer;
  try {
    pngBuffer = await sharp(Buffer.from(pixelData), {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png({
        compressionLevel,
        adaptiveFiltering: true,
        force: true
      })
      .toBuffer();
  } catch (err) {
    throw new ImageValidationError(`Failed to encode pixels to PNG: ${err.message}`);
  }

  if (options.outputPath) {
    try {
      const dir = path.dirname(options.outputPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(options.outputPath, pngBuffer);
    } catch (err) {
      throw new ImageValidationError(`Failed to write encoded PNG to disk: ${err.message}`);
    }
  }

  return {
    pngBuffer,
    width,
    height,
    outputPath: options.outputPath
  };
}
