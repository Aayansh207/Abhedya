// core/steganography/extract.js
import { bitsToBytes, slotToBufferIndex, getLsb } from "./pixelCodec.js";
import { generateScatteredPositions, generateSequentialPositions } from "./positionGenerator.js";
import { parseHeader, parsePayload } from "./payloadFormat.js";
import { HEADER_SIZE_BYTES } from "./capacity.js";
import { InvalidPayloadError, AbhedyaError } from "../errors.js";

const HEADER_BITS = HEADER_SIZE_BYTES * 8; // 400 bits

/**
 * Extracts candidate payload bits from a raw RGBA pixel buffer, validates header,
 * and recovers the parsed payload structure.
 *
 * @param {object} params
 * @param {Buffer | Uint8Array} params.pixelBuffer - Normalized raw RGBA pixel buffer
 * @param {number} params.width - Image width
 * @param {number} params.height - Image height
 * @param {"basic" | "scattered"} [params.mode="basic"] - Extraction mode
 * @param {Uint8Array} [params.embeddingKey] - 32-byte embedding key (required if mode === "scattered")
 * @param {Array<number> | Int32Array | Uint32Array} [params.slotSubset=null] - Optional subset of eligible slots (e.g. for decoy mode)
 * @returns {Promise<{ header: object, ciphertext: Uint8Array, aad: Uint8Array }>}
 */
export async function extractPayload({
  pixelBuffer,
  width,
  height,
  mode = "basic",
  embeddingKey = null,
  slotSubset = null
}) {
  if (!pixelBuffer) {
    throw new AbhedyaError("pixelBuffer is required for extraction");
  }

  const totalEligibleSlots = width * height * 3;
  const availableSlots = slotSubset ? slotSubset.length : totalEligibleSlots;

  if (availableSlots < HEADER_BITS) {
    throw new InvalidPayloadError(
      `Image slot pool (${availableSlots}) is too small to contain a 50-byte Abhedya header (${HEADER_BITS} bits)`
    );
  }

  // 1. Generate positions for the 50-byte (400-bit) header
  let headerPositions;
  if (mode === "scattered") {
    if (!embeddingKey || !(embeddingKey instanceof Uint8Array)) {
      throw new AbhedyaError("embeddingKey is required for scattered mode");
    }
    headerPositions = await generateScatteredPositions({
      embeddingKey,
      count: HEADER_BITS,
      totalSlots: totalEligibleSlots,
      slotSubset
    });
  } else {
    headerPositions = generateSequentialPositions(HEADER_BITS, slotSubset);
  }

  // 2. Extract header bits and parse header
  const headerBits = new Uint8Array(HEADER_BITS);
  for (let i = 0; i < HEADER_BITS; i++) {
    const slot = headerPositions[i];
    const bufferIndex = slotToBufferIndex(slot);
    headerBits[i] = getLsb(pixelBuffer[bufferIndex]);
  }

  const headerBytes = bitsToBytes(headerBits);
  const header = parseHeader(headerBytes);

  // 3. Check total payload bit bounds against available slots
  const totalPayloadBits = header.totalPayloadBytes * 8;
  if (totalPayloadBits > availableSlots) {
    throw new InvalidPayloadError(
      `Payload size in header (${header.totalPayloadBytes} bytes) exceeds available image slot capacity (${Math.floor(availableSlots / 8)} bytes)`
    );
  }

  // 4. Generate positions for the entire payload
  let allPositions;
  if (mode === "scattered") {
    allPositions = await generateScatteredPositions({
      embeddingKey,
      count: totalPayloadBits,
      totalSlots: totalEligibleSlots,
      slotSubset
    });
  } else {
    allPositions = generateSequentialPositions(totalPayloadBits, slotSubset);
  }

  // 5. Extract all bits (copy header bits directly, then extract remaining ciphertext bits)
  const allBits = new Uint8Array(totalPayloadBits);
  allBits.set(headerBits, 0);

  for (let i = HEADER_BITS; i < totalPayloadBits; i++) {
    const slot = allPositions[i];
    const bufferIndex = slotToBufferIndex(slot);
    allBits[i] = getLsb(pixelBuffer[bufferIndex]);
  }

  // 6. Convert bits to bytes and parse full payload
  const payloadBytes = bitsToBytes(allBits);
  return parsePayload(payloadBytes);
}
