// core/index.js
// Public API for the Abhedya Core Engine

import { decodeImage } from "./image/decode.js";
import { encodePng } from "./image/encode.js";
import { estimateCapacity as estCap, calculateCapacity } from "./steganography/capacity.js";
import { deriveEmbeddingKey } from "./crypto/keyDerivation.js";
import { encryptMessage } from "./crypto/encryption.js";
import { decryptMessage } from "./crypto/decryption.js";
import { serializePayload, getHeaderAad, MODES } from "./steganography/payloadFormat.js";
import { embedPayload } from "./steganography/embed.js";
import { extractPayload } from "./steganography/extract.js";
import { embedDecoy, extractDecoy } from "./advanced/decoyMode.js";
import { embedMultipleMessages, extractMultipleMessage } from "./advanced/multiMessage.js";
import { analyzeChiSquare } from "./analysis/chiSquare.js";
import { analyzeRS, compareSteganalysis } from "./analysis/rsAnalysis.js";
import {
  AbhedyaError,
  ImageValidationError,
  CapacityExceededError,
  AuthenticationError,
  InvalidPayloadError,
  USER_FACING_REVEAL_ERROR,
  toUserFacingError
} from "./errors.js";

export {
  calculateCapacity,
  embedMultipleMessages,
  extractMultipleMessage,
  analyzeChiSquare,
  analyzeRS,
  compareSteganalysis,
  // Errors
  AbhedyaError,
  ImageValidationError,
  CapacityExceededError,
  AuthenticationError,
  InvalidPayloadError,
  USER_FACING_REVEAL_ERROR,
  toUserFacingError
};

/**
 * Estimates exact usable capacity for an image.
 */
export async function estimateCapacity(options = {}) {
  return estCap(options);
}

/**
 * Encrypts a message and embeds it into an image, exporting a lossless PNG.
 *
 * @param {object} params
 * @param {string} [params.imagePath] - Input image file path
 * @param {Buffer | Uint8Array} [params.imageBuffer] - Input image buffer
 * @param {string} [params.outputPath] - Optional path to save resulting PNG
 * @param {string} params.message - Secret plaintext message to conceal
 * @param {string} params.password - Passphrase for encryption and key-seeding
 * @param {"basic" | "scattered"} [params.mode="scattered"] - Embedding mode (default: scattered)
 * @param {object} [params.options] - Optional settings (e.g. compressionLevel)
 * @returns {Promise<{ success: true, pngBuffer: Buffer, outputPath?: string, width: number, height: number, bytesEmbedded: number }>}
 */
export async function hideMessage({
  imagePath,
  imageBuffer,
  outputPath,
  message,
  password,
  mode = "scattered",
  options = {}
}) {
  if (message === undefined || message === null || typeof message !== "string") {
    throw new AbhedyaError("Secret message must be a string");
  }
  if (!password || typeof password !== "string") {
    throw new AuthenticationError("Password must be a non-empty string");
  }

  const input = imagePath || imageBuffer;
  const { data: pixelBuffer, width, height } = await decodeImage(input);

  const capacity = calculateCapacity(width, height, mode === "decoy" ? "decoy" : "basic");
  const messageBytes = Buffer.byteLength(message);

  if (messageBytes > capacity.maxPlaintextBytes) {
    throw new CapacityExceededError(messageBytes + 66, capacity.rawByteCapacity);
  }

  const numericMode = mode === "basic" ? MODES.BASIC : MODES.SCATTERED;
  const ciphertextLength = messageBytes + 16; // 16 bytes for Poly1305 MAC tag
  const aad = getHeaderAad({
    mode: numericMode,
    ciphertextLength
  });

  // 1. Authenticated Encryption
  const { ciphertext, salt, nonce } = await encryptMessage({
    message,
    password,
    aad,
    kdfOptions: options.kdfOptions
  });

  // 2. Binary Payload Serialization
  const payload = serializePayload({
    mode: numericMode,
    salt,
    nonce,
    ciphertext
  });

  // 3. Pixel Embedding
  let embeddingKey = null;
  if (numericMode === MODES.SCATTERED) {
    embeddingKey = await deriveEmbeddingKey(password, width, height);
  }

  const modifiedBuffer = await embedPayload({
    pixelBuffer,
    width,
    height,
    payload,
    mode: numericMode === MODES.SCATTERED ? "scattered" : "basic",
    embeddingKey
  });

  // 4. Encode to Lossless PNG
  const { pngBuffer } = await encodePng(modifiedBuffer, width, height, {
    outputPath,
    compressionLevel: options.compressionLevel ?? 9
  });

  return {
    success: true,
    pngBuffer,
    outputPath,
    width,
    height,
    bytesEmbedded: payload.length
  };
}

/**
 * Extracts, parses, verifies authentication, and decrypts a hidden message from an image.
 * Returns plaintext string only upon successful authenticated decryption.
 *
 * @param {object} params
 * @param {string} [params.imagePath] - Encoded PNG image path
 * @param {Buffer | Uint8Array} [params.imageBuffer] - Encoded PNG buffer
 * @param {string} params.password - Passphrase
 * @param {"auto" | "basic" | "scattered" | "decoy"} [params.mode="auto"]
 * @returns {Promise<{ success: true, message: string, mode: string }>}
 */
export async function revealMessage({
  imagePath,
  imageBuffer,
  password,
  mode = "auto"
}) {
  if (!password || typeof password !== "string") {
    throw new AuthenticationError("Password must be a non-empty string");
  }

  const input = imagePath || imageBuffer;
  const { data: pixelBuffer, width, height } = await decodeImage(input);

  // Strategy list based on requested mode
  const strategies = [];
  if (mode === "auto") {
    strategies.push("scattered", "decoy", "basic");
  } else {
    strategies.push(mode === "standard" ? "basic" : mode);
  }

  for (const strategy of strategies) {
    try {
      if (strategy === "scattered") {
        const embeddingKey = await deriveEmbeddingKey(password, width, height);
        const extracted = await extractPayload({
          pixelBuffer,
          width,
          height,
          mode: "scattered",
          embeddingKey
        });

        const { plaintext } = await decryptMessage({
          ciphertext: extracted.ciphertext,
          password,
          salt: extracted.header.salt,
          nonce: extracted.header.nonce,
          aad: extracted.aad
        });

        return {
          success: true,
          message: plaintext,
          mode: "scattered"
        };
      } else if (strategy === "basic") {
        const extracted = await extractPayload({
          pixelBuffer,
          width,
          height,
          mode: "basic"
        });

        const { plaintext } = await decryptMessage({
          ciphertext: extracted.ciphertext,
          password,
          salt: extracted.header.salt,
          nonce: extracted.header.nonce,
          aad: extracted.aad
        });

        return {
          success: true,
          message: plaintext,
          mode: "basic"
        };
      } else if (strategy === "decoy") {
        const result = await extractDecoy({ pixelBuffer, width, height, password });
        return {
          success: true,
          message: result.plaintext,
          mode: `decoy (${result.carrierType})`
        };
      }
    } catch (_err) {
      // Safe fallback: try next strategy
    }
  }

  throw new AuthenticationError(USER_FACING_REVEAL_ERROR);
}

/**
 * Decoy embedding helper.
 */
export async function hideDecoyMessages({
  imagePath,
  imageBuffer,
  outputPath,
  primary,
  decoy,
  options = {}
}) {
  const input = imagePath || imageBuffer;
  const { data: pixelBuffer, width, height } = await decodeImage(input);

  const modifiedBuffer = await embedDecoy({
    pixelBuffer,
    width,
    height,
    primary,
    decoy
  });

  const { pngBuffer } = await encodePng(modifiedBuffer, width, height, {
    outputPath,
    compressionLevel: options.compressionLevel ?? 9
  });

  return {
    success: true,
    pngBuffer,
    outputPath,
    width,
    height
  };
}

/**
 * Decoy reveal helper.
 */
export async function revealDecoyMessage({ imagePath, imageBuffer, password }) {
  const input = imagePath || imageBuffer;
  const { data: pixelBuffer, width, height } = await decodeImage(input);

  const result = await extractDecoy({ pixelBuffer, width, height, password });
  return {
    success: true,
    message: result.plaintext,
    carrierType: result.carrierType
  };
}
