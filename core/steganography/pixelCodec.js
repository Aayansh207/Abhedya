// core/steganography/pixelCodec.js

/**
 * Converts a Uint8Array or Buffer of bytes into a bit array (MSB first).
 *
 * @param {Uint8Array | Buffer} bytes
 * @returns {Uint8Array} Array of 0s and 1s, length = bytes.length * 8
 */
export function bytesToBits(bytes) {
  const bits = new Uint8Array(bytes.length * 8);
  let bitIdx = 0;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    for (let shift = 7; shift >= 0; shift--) {
      bits[bitIdx++] = (byte >> shift) & 1;
    }
  }
  return bits;
}

/**
 * Converts a bit array (MSB first) into a Uint8Array of bytes.
 * Length of bits must be a multiple of 8.
 *
 * @param {Uint8Array | Array<number>} bits
 * @returns {Uint8Array}
 */
export function bitsToBytes(bits) {
  const byteCount = Math.floor(bits.length / 8);
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    const offset = i * 8;
    let byteVal = 0;
    for (let bit = 0; bit < 8; bit++) {
      byteVal = (byteVal << 1) | (bits[offset + bit] & 1);
    }
    bytes[i] = byteVal;
  }
  return bytes;
}

/**
 * Maps an eligible channel slot index (0 to W*H*3 - 1) to its corresponding
 * offset in the 4-channel (RGBA) raw pixel buffer.
 *
 * Slots map to:
 * - slot 0: Pixel 0, Red (buffer index 0)
 * - slot 1: Pixel 0, Green (buffer index 1)
 * - slot 2: Pixel 0, Blue (buffer index 2)
 * (Alpha at buffer index 3 is skipped)
 * - slot 3: Pixel 1, Red (buffer index 4)
 *
 * @param {number} slot
 * @returns {number} Offset in the raw RGBA buffer
 */
export function slotToBufferIndex(slot) {
  const pixelIndex = Math.floor(slot / 3);
  const channel = slot % 3;
  return pixelIndex * 4 + channel;
}

/**
 * Encodes a single bit into a pixel channel value using LSB replacement.
 *
 * @param {number} pixelChannelValue - 0-255
 * @param {number} bit - 0 or 1
 * @returns {number} Modified channel value (0-255)
 */
export function setLsb(pixelChannelValue, bit) {
  return (pixelChannelValue & 0xfe) | (bit & 0x01);
}

/**
 * Extracts the least significant bit from a pixel channel value.
 *
 * @param {number} pixelChannelValue - 0-255
 * @returns {number} 0 or 1
 */
export function getLsb(pixelChannelValue) {
  return pixelChannelValue & 0x01;
}
