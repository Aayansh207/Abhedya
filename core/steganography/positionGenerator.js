// core/steganography/positionGenerator.js
import { getSodium } from "../crypto/keyDerivation.js";
import { AbhedyaError } from "../errors.js";

/**
 * Creates a cryptographically secure, deterministic PRNG based on ChaCha20 keystream.
 * Employs rejection sampling for unbiased random integer generation.
 *
 * @param {Uint8Array} key - 32-byte key
 * @param {Uint8Array} [baseNonce] - Optional 8-byte nonce
 * @returns {Promise<{ nextUint32: () => number, nextInt: (min: number, max: number) => number }>}
 */
export async function createChaChaPrng(key, baseNonce = new Uint8Array(8)) {
  const sodium = await getSodium();
  let blockIndex = 0;
  let buffer = new Uint8Array(0);
  let offset = 0;

  function refill() {
    const nonce = new Uint8Array(8);
    nonce.set(baseNonce);
    // Increment block counter in upper 4 bytes of nonce
    const view = new DataView(nonce.buffer, nonce.byteOffset, 8);
    view.setUint32(0, blockIndex++, true);

    // Generate 64KB block of ChaCha20 keystream (outLength, key, nonce)
    buffer = sodium.crypto_stream_chacha20(65536, key, nonce);
    offset = 0;
  }

  function nextUint32() {
    if (offset + 4 > buffer.length) {
      refill();
    }
    const val =
      buffer[offset] |
      (buffer[offset + 1] << 8) |
      (buffer[offset + 2] << 16) |
      ((buffer[offset + 3] << 24) >>> 0);
    offset += 4;
    return val >>> 0;
  }

  /**
   * Generates an unbiased integer in [min, max] inclusive using rejection sampling.
   */
  function nextInt(min, max) {
    if (min > max) {
      throw new AbhedyaError(`Invalid range: min (${min}) > max (${max})`);
    }
    const range = max - min + 1;
    if (range <= 1) return min;

    // Largest multiple of range <= 2^32
    const maxAllowed = Math.floor(0x100000000 / range) * range;
    let rand;
    do {
      rand = nextUint32();
    } while (rand >= maxAllowed);

    return min + (rand % range);
  }

  return { nextUint32, nextInt };
}

/**
 * Generates deterministic, collision-free pixel channel slot positions using a sparse
 * Fisher-Yates shuffle. Because the shuffle is an online prefix permutation, requesting
 * K positions produces the exact same prefix as requesting N > K positions.
 *
 * @param {object} params
 * @param {Uint8Array} params.embeddingKey - 32-byte key derived from password
 * @param {number} params.count - Number of positions to select
 * @param {number} params.totalSlots - Total number of available channel slots (e.g. width * height * 3)
 * @param {Array<number> | Int32Array | Uint32Array} [params.slotSubset] - Optional subset of eligible slots (e.g. for decoy mode)
 * @returns {Promise<Int32Array>} Array of selected unique slot indices
 */
export async function generateScatteredPositions({
  embeddingKey,
  count,
  totalSlots,
  slotSubset = null
}) {
  const poolSize = slotSubset ? slotSubset.length : totalSlots;
  if (count > poolSize) {
    throw new AbhedyaError(
      `Requested position count (${count}) exceeds available slot pool size (${poolSize})`
    );
  }
  if (count <= 0) {
    return new Int32Array(0);
  }

  const prng = await createChaChaPrng(embeddingKey);
  const map = new Map();
  const result = new Int32Array(count);

  for (let i = 0; i < count; i++) {
    const j = prng.nextInt(i, poolSize - 1);
    const valJ = map.has(j) ? map.get(j) : j;
    const valI = map.has(i) ? map.get(i) : i;

    map.set(j, valI);
    map.set(i, valJ);

    result[i] = slotSubset ? slotSubset[valJ] : valJ;
  }

  return result;
}

/**
 * Generates sequential positions [0, 1, 2, ... count - 1].
 *
 * @param {number} count
 * @param {Array<number> | Int32Array | Uint32Array} [slotSubset=null]
 * @returns {Int32Array}
 */
export function generateSequentialPositions(count, slotSubset = null) {
  const result = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = slotSubset ? slotSubset[i] : i;
  }
  return result;
}
