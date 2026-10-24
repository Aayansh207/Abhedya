// core/advanced/multiMessage.js
import { deriveEmbeddingKey } from "../crypto/keyDerivation.js";
import { encryptMessage } from "../crypto/encryption.js";
import { decryptMessage } from "../crypto/decryption.js";
import { serializePayload, getHeaderAad, MODES } from "../steganography/payloadFormat.js";
import { embedPayload } from "../steganography/embed.js";
import { extractPayload } from "../steganography/extract.js";
import { getPartitionSlots } from "./decoyMode.js";
import { CapacityExceededError, AuthenticationError } from "../errors.js";

/**
 * Embeds multiple independent messages under distinct passwords into separate
 * non-overlapping partitions of an image's eligible channel slots.
 *
 * @param {object} params
 * @param {Buffer | Uint8Array} params.pixelBuffer
 * @param {number} params.width
 * @param {number} params.height
 * @param {Array<{ message: string, password: string }>} params.entries
 * @returns {Promise<Buffer>} Modified raw pixel buffer
 */
export async function embedMultipleMessages({
  pixelBuffer,
  width,
  height,
  entries
}) {
  if (!entries || !Array.isArray(entries) || entries.length < 2) {
    throw new AuthenticationError("At least 2 entries (message & password) are required for multi-message embedding");
  }

  const totalPartitions = entries.length;
  let currentBuffer = Buffer.from(pixelBuffer);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.message || !entry.password) {
      throw new AuthenticationError(`Entry at index ${i} is missing message or password`);
    }

    const slots = getPartitionSlots(width, height, i, totalPartitions);
    const availableBytes = Math.floor(slots.length / 8);
    const msgBytes = Buffer.byteLength(entry.message);
    const totalRequiredBytes = msgBytes + 66;

    if (totalRequiredBytes > availableBytes) {
      throw new CapacityExceededError(totalRequiredBytes, availableBytes);
    }

    const domain = `ABHEDYA_MULTI_PARTITION_${i}_V1`;
    const embeddingKey = await deriveEmbeddingKey(entry.password, width, height, domain);
    const ciphertextLength = msgBytes + 16;
    const aad = getHeaderAad({
      mode: MODES.SCATTERED,
      ciphertextLength
    });

    const { ciphertext, salt, nonce } = await encryptMessage({
      message: entry.message,
      password: entry.password,
      aad
    });

    const payload = serializePayload({
      mode: MODES.SCATTERED,
      salt,
      nonce,
      ciphertext
    });

    currentBuffer = await embedPayload({
      pixelBuffer: currentBuffer,
      width,
      height,
      payload,
      mode: "scattered",
      embeddingKey,
      slotSubset: slots
    });
  }

  return currentBuffer;
}

/**
 * Extracts and decrypts whichever message in the partitioned image corresponds
 * to the provided password.
 *
 * @param {object} params
 * @param {Buffer | Uint8Array} params.pixelBuffer
 * @param {number} params.width
 * @param {number} params.height
 * @param {string} params.password
 * @param {number} [params.maxPartitions=4] - Maximum number of partitions to scan
 * @returns {Promise<{ plaintext: string, partitionIndex: number }>}
 */
export async function extractMultipleMessage({
  pixelBuffer,
  width,
  height,
  password,
  maxPartitions = 4
}) {
  for (let totalPartitions = 2; totalPartitions <= maxPartitions; totalPartitions++) {
    for (let i = 0; i < totalPartitions; i++) {
      try {
        const domain = `ABHEDYA_MULTI_PARTITION_${i}_V1`;
        const embeddingKey = await deriveEmbeddingKey(password, width, height, domain);
        const slots = getPartitionSlots(width, height, i, totalPartitions);

        const extracted = await extractPayload({
          pixelBuffer,
          width,
          height,
          mode: "scattered",
          embeddingKey,
          slotSubset: slots
        });

        const { plaintext } = await decryptMessage({
          ciphertext: extracted.ciphertext,
          password,
          salt: extracted.header.salt,
          nonce: extracted.header.nonce,
          aad: extracted.aad
        });

        return { plaintext, partitionIndex: i };
      } catch (_err) {
        // Continue scanning
      }
    }
  }

  throw new AuthenticationError("Failed to decrypt: no partition matched the provided password");
}
