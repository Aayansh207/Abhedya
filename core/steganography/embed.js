// core/steganography/embed.js
import { bytesToBits, slotToBufferIndex, setLsb } from "./pixelCodec.js";
import { generateScatteredPositions, generateSequentialPositions } from "./positionGenerator.js";
import { CapacityExceededError, AbhedyaError } from "../errors.js";

/**
 * Embeds a serialized payload into the least-significant bits of a raw RGBA pixel buffer.
 *
 * @param {object} params
 * @param {Buffer | Uint8Array} params.pixelBuffer - Normalized raw RGBA pixel buffer
 * @param {number} params.width - Image width
 * @param {number} params.height - Image height
 * @param {Uint8Array} params.payload - Serialized binary payload bytes
 * @param {"basic" | "scattered"} [params.mode="basic"] - Embedding mode
 * @param {Uint8Array} [params.embeddingKey] - 32-byte embedding key (required if mode === "scattered")
 * @param {Array<number> | Int32Array | Uint32Array} [params.slotSubset=null] - Optional subset of eligible slots (e.g. for decoy mode)
 * @returns {Promise<Buffer>} Modified raw RGBA pixel buffer
 */
export async function embedPayload({
  pixelBuffer,
  width,
  height,
  payload,
  mode = "basic",
  embeddingKey = null,
  slotSubset = null
}) {
  if (!pixelBuffer) {
    throw new AbhedyaError("pixelBuffer is required for embedding");
  }
  if (!payload || !(payload instanceof Uint8Array)) {
    throw new AbhedyaError("payload must be a valid Uint8Array");
  }

  const totalEligibleSlots = width * height * 3;
  const availableSlots = slotSubset ? slotSubset.length : totalEligibleSlots;
  const payloadBits = bytesToBits(payload);

  if (payloadBits.length > availableSlots) {
    const requiredBytes = payload.length;
    const availableBytes = Math.floor(availableSlots / 8);
    throw new CapacityExceededError(requiredBytes, availableBytes);
  }

  let positions;
  if (mode === "scattered") {
    if (!embeddingKey || !(embeddingKey instanceof Uint8Array)) {
      throw new AbhedyaError("embeddingKey is required for scattered mode");
    }
    positions = await generateScatteredPositions({
      embeddingKey,
      count: payloadBits.length,
      totalSlots: totalEligibleSlots,
      slotSubset
    });
  } else {
    positions = generateSequentialPositions(payloadBits.length, slotSubset);
  }

  // Create an explicit copy of the pixel buffer to avoid unexpected mutation
  const modified = Buffer.from(pixelBuffer);

  for (let i = 0; i < payloadBits.length; i++) {
    const slot = positions[i];
    const bufferIndex = slotToBufferIndex(slot);
    modified[bufferIndex] = setLsb(modified[bufferIndex], payloadBits[i]);
  }

  return modified;
}
