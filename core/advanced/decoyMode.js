// core/advanced/decoyMode.js
import { deriveEmbeddingKey } from "../crypto/keyDerivation.js";
import { encryptMessage } from "../crypto/encryption.js";
import { decryptMessage } from "../crypto/decryption.js";
import { serializePayload, getHeaderAad, MODES } from "../steganography/payloadFormat.js";
import { embedPayload } from "../steganography/embed.js";
import { extractPayload } from "../steganography/extract.js";
import { calculateCapacity } from "../steganography/capacity.js";
import { CapacityExceededError, AuthenticationError } from "../errors.js";

/**
 * Returns the disjoint subset of eligible channel slots for a given partition.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} partitionIndex - 0 or 1 for dual-carrier decoy mode
 * @param {number} [totalPartitions=2]
 * @returns {Int32Array}
 */
export function getPartitionSlots(width, height, partitionIndex, totalPartitions = 2) {
  const totalSlots = width * height * 3;
  const count = Math.floor(totalSlots / totalPartitions) + (partitionIndex < totalSlots % totalPartitions ? 1 : 0);
  const slots = new Int32Array(count);
  let idx = 0;
  for (let s = partitionIndex; s < totalSlots; s += totalPartitions) {
    slots[idx++] = s;
  }
  return slots;
}

/**
 * Embeds two separate messages into the same image using partitioned, non-overlapping
 * channel slots: a Primary message (under Primary password) and a Decoy message (under Decoy password).
 *
 * @param {object} params
 * @param {Buffer | Uint8Array} params.pixelBuffer - Normalized raw RGBA pixel buffer
 * @param {number} params.width
 * @param {number} params.height
 * @param {{ message: string, password: string }} params.primary - Primary payload
 * @param {{ message: string, password: string }} params.decoy - Decoy payload
 * @returns {Promise<Buffer>} Modified raw RGBA pixel buffer containing both encrypted payloads
 */
export async function embedDecoy({
  pixelBuffer,
  width,
  height,
  primary,
  decoy
}) {
  if (!primary?.password || !primary?.message) {
    throw new AuthenticationError("Primary message and password are required");
  }
  if (!decoy?.password || !decoy?.message) {
    throw new AuthenticationError("Decoy message and password are required");
  }
  if (primary.password === decoy.password) {
    throw new AuthenticationError("Primary and Decoy passwords must be distinct");
  }

  const capacity = calculateCapacity(width, height, "decoy");
  const primaryBytes = Buffer.byteLength(primary.message);
  const decoyBytes = Buffer.byteLength(decoy.message);

  if (primaryBytes > capacity.maxPlaintextBytes) {
    throw new CapacityExceededError(primaryBytes + 66, capacity.decoyUsableRawBytes);
  }
  if (decoyBytes > capacity.maxPlaintextBytes) {
    throw new CapacityExceededError(decoyBytes + 66, capacity.decoyUsableRawBytes);
  }

  // Partition slots: Partition 0 = Primary, Partition 1 = Decoy
  const primarySlots = getPartitionSlots(width, height, 0, 2);
  const decoySlots = getPartitionSlots(width, height, 1, 2);

  // 1. Prepare Primary Payload
  const primaryKey = await deriveEmbeddingKey(primary.password, width, height, "ABHEDYA_DECOY_PRIMARY_V1");
  const primaryCiphertextLen = primaryBytes + 16;
  const primaryAad = getHeaderAad({
    mode: MODES.DECOY_PRIMARY,
    ciphertextLength: primaryCiphertextLen
  });
  const { ciphertext: primaryCiphertext, salt: primarySalt, nonce: primaryNonce } = await encryptMessage({
    message: primary.message,
    password: primary.password,
    aad: primaryAad
  });
  const primaryPayload = serializePayload({
    mode: MODES.DECOY_PRIMARY,
    salt: primarySalt,
    nonce: primaryNonce,
    ciphertext: primaryCiphertext
  });

  // 2. Prepare Decoy Payload
  const decoyKey = await deriveEmbeddingKey(decoy.password, width, height, "ABHEDYA_DECOY_SECONDARY_V1");
  const decoyCiphertextLen = decoyBytes + 16;
  const decoyAad = getHeaderAad({
    mode: MODES.DECOY_SECONDARY,
    ciphertextLength: decoyCiphertextLen
  });
  const { ciphertext: decoyCiphertext, salt: decoySalt, nonce: decoyNonce } = await encryptMessage({
    message: decoy.message,
    password: decoy.password,
    aad: decoyAad
  });
  const decoyPayload = serializePayload({
    mode: MODES.DECOY_SECONDARY,
    salt: decoySalt,
    nonce: decoyNonce,
    ciphertext: decoyCiphertext
  });

  // 3. Embed Primary into Partition 0
  let buffer = await embedPayload({
    pixelBuffer,
    width,
    height,
    payload: primaryPayload,
    mode: "scattered",
    embeddingKey: primaryKey,
    slotSubset: primarySlots
  });

  // 4. Embed Decoy into Partition 1
  buffer = await embedPayload({
    pixelBuffer: buffer,
    width,
    height,
    payload: decoyPayload,
    mode: "scattered",
    embeddingKey: decoyKey,
    slotSubset: decoySlots
  });

  return buffer;
}

/**
 * Attempts to extract and decrypt a message from either partition using the provided password.
 *
 * @param {object} params
 * @param {Buffer | Uint8Array} params.pixelBuffer
 * @param {number} params.width
 * @param {number} params.height
 * @param {string} params.password
 * @returns {Promise<{ plaintext: string, carrierType: "primary" | "decoy" }>}
 */
export async function extractDecoy({ pixelBuffer, width, height, password }) {
  const attempts = [
    {
      carrierType: "primary",
      domain: "ABHEDYA_DECOY_PRIMARY_V1",
      partition: 0
    },
    {
      carrierType: "decoy",
      domain: "ABHEDYA_DECOY_SECONDARY_V1",
      partition: 1
    }
  ];

  for (const attempt of attempts) {
    try {
      const embeddingKey = await deriveEmbeddingKey(password, width, height, attempt.domain);
      const slots = getPartitionSlots(width, height, attempt.partition, 2);

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

      return { plaintext, carrierType: attempt.carrierType };
    } catch (_err) {
      // Continue to next partition attempt
    }
  }

  throw new AuthenticationError("Failed to decrypt decoy message: no partition matched the password");
}
