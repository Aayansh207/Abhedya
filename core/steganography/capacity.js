// core/steganography/capacity.js
import { validateImageInput } from "../image/validate.js";
import { ImageValidationError } from "../errors.js";

/**
 * Fixed payload overhead constants in bytes.
 * Header: 50 bytes
 *   - Magic: 4 bytes ("ABHD")
 *   - Version: 1 byte (0x01)
 *   - Mode: 1 byte
 *   - Ciphertext Length: 4 bytes (uint32BE)
 *   - KDF Salt: 16 bytes (Argon2id)
 *   - AEAD Nonce: 24 bytes (XChaCha20-Poly1305)
 * Auth Tag: 16 bytes (Poly1305)
 */
export const HEADER_SIZE_BYTES = 50;
export const AUTH_TAG_SIZE_BYTES = 16;
export const TOTAL_OVERHEAD_BYTES = HEADER_SIZE_BYTES + AUTH_TAG_SIZE_BYTES; // 66 bytes

/**
 * Eligible color channels per pixel: Red, Green, Blue (3 channels).
 * Alpha is excluded to prevent visual transparency artifacts.
 */
export const ELIGIBLE_CHANNELS_PER_PIXEL = 3;

/**
 * Calculates capacity figures given width, height, and mode.
 *
 * @param {number} width
 * @param {number} height
 * @param {"basic" | "scattered" | "decoy"} [mode="basic"]
 * @returns {object}
 */
export function calculateCapacity(width, height, mode = "basic") {
  if (!width || !height || width <= 0 || height <= 0) {
    throw new ImageValidationError(`Invalid image dimensions: ${width}x${height}`);
  }

  const totalPixels = width * height;
  const rawBitCapacity = totalPixels * ELIGIBLE_CHANNELS_PER_PIXEL;
  const rawByteCapacity = Math.floor(rawBitCapacity / 8);

  const isDecoy = mode === "decoy";
  // In decoy mode, the pixel channel capacity is split across two independent payloads
  const usableRawBytes = isDecoy ? Math.floor(rawByteCapacity / 2) : rawByteCapacity;
  const maxCiphertextBytes = Math.max(0, usableRawBytes - HEADER_SIZE_BYTES);
  const maxPlaintextBytes = Math.max(0, usableRawBytes - TOTAL_OVERHEAD_BYTES);

  return {
    width,
    height,
    mode,
    totalPixels,
    eligibleChannelsPerPixel: ELIGIBLE_CHANNELS_PER_PIXEL,
    rawBitCapacity,
    rawByteCapacity,
    payloadOverheadBytes: TOTAL_OVERHEAD_BYTES,
    headerSizeBytes: HEADER_SIZE_BYTES,
    authTagSizeBytes: AUTH_TAG_SIZE_BYTES,
    maxCiphertextBytes,
    maxPlaintextBytes,
    isDecoy,
    ...(isDecoy
      ? {
          decoyUsableRawBytes: usableRawBytes,
          decoyMaxPlaintextBytes: maxPlaintextBytes
        }
      : {})
  };
}

/**
 * High-level capacity estimation accepting imagePath, imageBuffer, or explicit dimensions.
 *
 * @param {object} options
 * @param {string} [options.imagePath]
 * @param {Buffer | Uint8Array} [options.imageBuffer]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {"basic" | "scattered" | "decoy"} [options.mode="basic"]
 * @returns {Promise<object>}
 */
export async function estimateCapacity(options = {}) {
  const { imagePath, imageBuffer, width, height, mode = "basic" } = options;

  if (width && height) {
    return calculateCapacity(width, height, mode);
  }

  const input = imagePath || imageBuffer;
  if (!input) {
    throw new ImageValidationError(
      "estimateCapacity requires either imagePath, imageBuffer, or width and height"
    );
  }

  const { metadata } = await validateImageInput(input);
  return calculateCapacity(metadata.width, metadata.height, mode);
}
