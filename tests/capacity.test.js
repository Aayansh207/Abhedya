// tests/capacity.test.js
import { describe, it, expect } from "vitest";
import {
  calculateCapacity,
  estimateCapacity,
  TOTAL_OVERHEAD_BYTES,
  HEADER_SIZE_BYTES,
  AUTH_TAG_SIZE_BYTES
} from "../core/steganography/capacity.js";
import { ImageValidationError } from "../core/errors.js";

describe("Capacity Estimation", () => {
  it("should have documented exact overhead constants", () => {
    expect(HEADER_SIZE_BYTES).toBe(50);
    expect(AUTH_TAG_SIZE_BYTES).toBe(16);
    expect(TOTAL_OVERHEAD_BYTES).toBe(66);
  });

  it("should accurately calculate raw bit and byte capacities for small image (100x100)", () => {
    // 100 x 100 = 10,000 pixels.
    // 10,000 * 3 channels = 30,000 raw bits.
    // 30,000 / 8 = 3,750 raw bytes.
    const cap = calculateCapacity(100, 100);
    expect(cap.rawBitCapacity).toBe(30_000);
    expect(cap.rawByteCapacity).toBe(3_750);
    expect(cap.payloadOverheadBytes).toBe(66);
    expect(cap.maxCiphertextBytes).toBe(3_750 - 50);
    expect(cap.maxPlaintextBytes).toBe(3_750 - 66);
  });

  it("should calculate capacities for typical large image (1920x1080)", () => {
    // 1920 * 1080 = 2,073,600 pixels.
    // * 3 channels = 6,220,800 raw bits.
    // / 8 = 777,600 raw bytes.
    const cap = calculateCapacity(1920, 1080);
    expect(cap.rawByteCapacity).toBe(777_600);
    expect(cap.maxPlaintextBytes).toBe(777_600 - 66);
  });

  it("should halve capacity in decoy mode to accommodate two carriers", () => {
    const basic = calculateCapacity(200, 200, "basic");
    const decoy = calculateCapacity(200, 200, "decoy");

    expect(decoy.maxPlaintextBytes).toBeLessThan(basic.maxPlaintextBytes);
    expect(decoy.decoyUsableRawBytes).toBe(Math.floor(basic.rawByteCapacity / 2));
  });

  it("should reject invalid dimensions", () => {
    expect(() => calculateCapacity(0, 100)).toThrow(ImageValidationError);
    expect(() => calculateCapacity(100, -10)).toThrow(ImageValidationError);
  });
});
