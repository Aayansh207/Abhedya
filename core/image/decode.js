// core/image/decode.js
import sharp from "sharp";
import { validateImageInput } from "./validate.js";
import { ImageValidationError } from "../errors.js";

/**
 * Decodes an image file or buffer into a normalized raw RGBA pixel buffer.
 *
 * @param {string | Buffer | Uint8Array} input
 * @returns {Promise<{
 *   data: Buffer,
 *   width: number,
 *   height: number,
 *   channels: number,
 *   format: string
 * }>}
 */
export async function decodeImage(input) {
  const { buffer, metadata } = await validateImageInput(input);

  try {
    const { data, info } = await sharp(buffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.channels !== 4) {
      throw new ImageValidationError(
        `Expected 4 channels (RGBA) after normalization, but got ${info.channels}`
      );
    }

    const expectedLength = info.width * info.height * 4;
    if (data.length !== expectedLength) {
      throw new ImageValidationError(
        `Pixel buffer length mismatch: expected ${expectedLength} bytes, got ${data.length}`
      );
    }

    return {
      data,
      width: info.width,
      height: info.height,
      channels: 4,
      format: metadata.format
    };
  } catch (err) {
    if (err instanceof ImageValidationError) throw err;
    throw new ImageValidationError(`Failed to decode image pixels: ${err.message}`);
  }
}
