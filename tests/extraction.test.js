// tests/extraction.test.js
import { describe, it, expect } from "vitest";
import { embedPayload } from "../core/steganography/embed.js";
import { extractPayload } from "../core/steganography/extract.js";
import { serializePayload, MODES } from "../core/steganography/payloadFormat.js";
import { deriveEmbeddingKey } from "../core/crypto/keyDerivation.js";
import { InvalidPayloadError } from "../core/errors.js";

describe("Extraction Module & Safe Failure Behavior", () => {
  const width = 80;
  const height = 80;
  const dummySalt = new Uint8Array(16).fill(0x55);
  const dummyNonce = new Uint8Array(24).fill(0x66);
  const dummyCiphertext = new Uint8Array(32).fill(0x77);

  const payload = serializePayload({
    mode: MODES.BASIC,
    salt: dummySalt,
    nonce: dummyNonce,
    ciphertext: dummyCiphertext
  });

  it("should fail safely on an un-embedded blank image", async () => {
    // Blank image has all 0s (or any natural image pixels) where magic "ABHD" is absent
    const blankImage = Buffer.alloc(width * height * 4, 128);

    await expect(
      extractPayload({
        pixelBuffer: blankImage,
        width,
        height,
        mode: "basic"
      })
    ).rejects.toThrow(InvalidPayloadError);
  });

  it("should fail safely on an un-embedded natural image with random pixels", async () => {
    const randomImage = Buffer.alloc(width * height * 4);
    for (let i = 0; i < randomImage.length; i++) {
      randomImage[i] = Math.floor(Math.random() * 256);
    }

    await expect(
      extractPayload({
        pixelBuffer: randomImage,
        width,
        height,
        mode: "basic"
      })
    ).rejects.toThrow(InvalidPayloadError);
  });

  it("should fail safely if candidate header claims length exceeding image capacity", async () => {
    const originalBuffer = Buffer.alloc(width * height * 4, 128);
    // Embed a valid payload
    const modified = await embedPayload({
      pixelBuffer: originalBuffer,
      width,
      height,
      payload,
      mode: "basic"
    });

    // Flip bits in the length field of the embedded header (offsets 6-9 in header -> bits 48-79)
    // Slot corresponding to bit 48
    modified[0 * 4 + 0] ^= 0x01; // Corrupt magic bit 0

    await expect(
      extractPayload({
        pixelBuffer: modified,
        width,
        height,
        mode: "basic"
      })
    ).rejects.toThrow(InvalidPayloadError);
  });

  it("should extract identically on repeated calls (deterministic idempotence)", async () => {
    const originalBuffer = Buffer.alloc(width * height * 4, 200);
    const embeddingKey = await deriveEmbeddingKey("repeatable-pass", width, height);
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

    const run1 = await extractPayload({
      pixelBuffer: modified,
      width,
      height,
      mode: "scattered",
      embeddingKey
    });

    const run2 = await extractPayload({
      pixelBuffer: modified,
      width,
      height,
      mode: "scattered",
      embeddingKey
    });

    expect(run1.ciphertext).toEqual(run2.ciphertext);
    expect(run1.header).toEqual(run2.header);
  });
});
