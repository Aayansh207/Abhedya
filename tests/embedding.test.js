// tests/embedding.test.js
import { describe, it, expect } from "vitest";
import { embedPayload } from "../core/steganography/embed.js";
import { extractPayload } from "../core/steganography/extract.js";
import { serializePayload, MODES } from "../core/steganography/payloadFormat.js";
import { deriveEmbeddingKey } from "../core/crypto/keyDerivation.js";
import { CapacityExceededError } from "../core/errors.js";

describe("Pixel Embedding & Extraction (Basic & Scattered)", () => {
  const width = 100;
  const height = 100;
  // 100 * 100 * 4 = 40,000 bytes. Fill with a predictable test pattern.
  const createTestBuffer = () => {
    const buf = Buffer.alloc(width * height * 4);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = (i * 37 + 13) % 256;
    }
    return buf;
  };

  const dummySalt = new Uint8Array(16).fill(0x12);
  const dummyNonce = new Uint8Array(24).fill(0x34);
  const dummyCiphertext = new Uint8Array(48).fill(0x56); // 48 bytes

  const payload = serializePayload({
    mode: MODES.BASIC,
    salt: dummySalt,
    nonce: dummyNonce,
    ciphertext: dummyCiphertext
  });

  it("should embed and extract a payload in basic (sequential) mode", async () => {
    const originalBuffer = createTestBuffer();
    const modified = await embedPayload({
      pixelBuffer: originalBuffer,
      width,
      height,
      payload,
      mode: "basic"
    });

    // Check original was not mutated
    expect(originalBuffer.equals(modified)).toBe(false);

    // Extract payload
    const extracted = await extractPayload({
      pixelBuffer: modified,
      width,
      height,
      mode: "basic"
    });

    expect(extracted.header.magic).toBe("ABHD");
    expect(extracted.header.ciphertextLength).toBe(48);
    expect(extracted.header.salt).toEqual(dummySalt);
    expect(extracted.header.nonce).toEqual(dummyNonce);
    expect(extracted.ciphertext).toEqual(dummyCiphertext);
  });

  it("should embed and extract a payload in scattered (key-seeded) mode", async () => {
    const originalBuffer = createTestBuffer();
    const embeddingKey = await deriveEmbeddingKey("my-secret-pass", width, height);

    const scatteredPayload = serializePayload({
      mode: MODES.SCATTERED,
      salt: dummySalt,
      nonce: dummyNonce,
      ciphertext: dummyCiphertext
    });

    const modified = await embedPayload({
      pixelBuffer: originalBuffer,
      width,
      height,
      payload: scatteredPayload,
      mode: "scattered",
      embeddingKey
    });

    // Extract with correct embedding key
    const extracted = await extractPayload({
      pixelBuffer: modified,
      width,
      height,
      mode: "scattered",
      embeddingKey
    });

    expect(extracted.header.mode).toBe(MODES.SCATTERED);
    expect(extracted.header.ciphertextLength).toBe(48);
    expect(extracted.ciphertext).toEqual(dummyCiphertext);
  });

  it("should fail extraction in scattered mode if wrong embedding key is provided", async () => {
    const originalBuffer = createTestBuffer();
    const embeddingKey = await deriveEmbeddingKey("my-secret-pass", width, height);
    const wrongEmbeddingKey = await deriveEmbeddingKey("wrong-pass", width, height);

    const scatteredPayload = serializePayload({
      mode: MODES.SCATTERED,
      salt: dummySalt,
      nonce: dummyNonce,
      ciphertext: dummyCiphertext
    });

    const modified = await embedPayload({
      pixelBuffer: originalBuffer,
      width,
      height,
      payload: scatteredPayload,
      mode: "scattered",
      embeddingKey
    });

    // Extracting with wrong key hits random pseudorandom positions where magic check will fail
    await expect(
      extractPayload({
        pixelBuffer: modified,
        width,
        height,
        mode: "scattered",
        embeddingKey: wrongEmbeddingKey
      })
    ).rejects.toThrow();
  });

  it("should reject embedding if payload exceeds capacity", async () => {
    const smallBuffer = Buffer.alloc(16 * 16 * 4); // 16x16 = 256 pixels = 768 bits = 96 bytes capacity
    const hugeCiphertext = new Uint8Array(500); // 500 bytes ciphertext + 50 bytes header = 550 bytes > 96 bytes
    const hugePayload = serializePayload({
      salt: dummySalt,
      nonce: dummyNonce,
      ciphertext: hugeCiphertext
    });

    await expect(
      embedPayload({
        pixelBuffer: smallBuffer,
        width: 16,
        height: 16,
        payload: hugePayload,
        mode: "basic"
      })
    ).rejects.toThrow(CapacityExceededError);
  });

  it("should never modify the alpha channel of any pixel", async () => {
    const originalBuffer = createTestBuffer();
    // Ensure all alpha channels have specific values (e.g. 255)
    for (let i = 3; i < originalBuffer.length; i += 4) {
      originalBuffer[i] = 255;
    }

    const modified = await embedPayload({
      pixelBuffer: originalBuffer,
      width,
      height,
      payload,
      mode: "basic"
    });

    for (let i = 3; i < modified.length; i += 4) {
      expect(modified[i]).toBe(255);
    }
  });
});
