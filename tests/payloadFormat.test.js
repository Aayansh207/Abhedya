// tests/payloadFormat.test.js
import { describe, it, expect } from "vitest";
import {
  serializePayload,
  parseHeader,
  parsePayload,
  getHeaderAad,
  MAGIC_BYTES,
  CURRENT_FORMAT_VERSION,
  MODES
} from "../core/steganography/payloadFormat.js";
import { InvalidPayloadError } from "../core/errors.js";

describe("Payload Format Serialization & Parsing", () => {
  const dummySalt = new Uint8Array(16).fill(0xaa);
  const dummyNonce = new Uint8Array(24).fill(0xbb);
  const dummyCiphertext = new Uint8Array(32).fill(0xcc);

  it("should serialize and deserialize a valid payload", () => {
    const serialized = serializePayload({
      version: CURRENT_FORMAT_VERSION,
      mode: MODES.BASIC,
      salt: dummySalt,
      nonce: dummyNonce,
      ciphertext: dummyCiphertext
    });

    expect(serialized.length).toBe(50 + 32);

    const header = parseHeader(serialized);
    expect(header.magic).toBe("ABHD");
    expect(header.version).toBe(CURRENT_FORMAT_VERSION);
    expect(header.mode).toBe(MODES.BASIC);
    expect(header.ciphertextLength).toBe(32);
    expect(header.salt).toEqual(dummySalt);
    expect(header.nonce).toEqual(dummyNonce);

    const parsed = parsePayload(serialized);
    expect(parsed.ciphertext).toEqual(dummyCiphertext);
    expect(parsed.aad.length).toBe(10);
  });

  it("should reject payloads with invalid magic signature", () => {
    const serialized = serializePayload({
      salt: dummySalt,
      nonce: dummyNonce,
      ciphertext: dummyCiphertext
    });

    const corrupt = new Uint8Array(serialized);
    corrupt[0] = 0x58; // 'X' instead of 'A'

    expect(() => parseHeader(corrupt)).toThrow(InvalidPayloadError);
    expect(() => parseHeader(corrupt)).toThrow(/Invalid magic signature/);
  });

  it("should reject payloads with unsupported version", () => {
    const serialized = serializePayload({
      salt: dummySalt,
      nonce: dummyNonce,
      ciphertext: dummyCiphertext
    });

    const corrupt = new Uint8Array(serialized);
    corrupt[4] = 0x99; // Version 0x99

    expect(() => parseHeader(corrupt)).toThrow(InvalidPayloadError);
    expect(() => parseHeader(corrupt)).toThrow(/Unsupported format version/);
  });

  it("should reject payload if truncated", () => {
    const serialized = serializePayload({
      salt: dummySalt,
      nonce: dummyNonce,
      ciphertext: dummyCiphertext
    });

    const truncated = serialized.subarray(0, 50 + 10); // only 10 bytes of ciphertext instead of 32
    expect(() => parsePayload(truncated)).toThrow(InvalidPayloadError);
    expect(() => parsePayload(truncated)).toThrow(/Payload buffer truncated/);
  });

  it("should generate 10-byte AAD header prefix correctly", () => {
    const aad = getHeaderAad({
      version: CURRENT_FORMAT_VERSION,
      mode: MODES.SCATTERED,
      ciphertextLength: 64
    });

    expect(aad.length).toBe(10);
    expect(Buffer.from(aad.subarray(0, 4))).toEqual(MAGIC_BYTES);
    expect(aad[4]).toBe(CURRENT_FORMAT_VERSION);
    expect(aad[5]).toBe(MODES.SCATTERED);
    expect(Buffer.from(aad).readUInt32BE(6)).toBe(64);
  });
});
