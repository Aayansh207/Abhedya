// tests/roundTrip.test.js
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { hideMessage, revealMessage, estimateCapacity } from "../core/index.js";

describe("End-to-End Round-Trip Integration", () => {
  // Generate a valid 256x256 test image PNG buffer using Sharp
  async function generateTestPng(width = 256, height = 256) {
    const raw = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        raw[idx + 0] = (x * 7) % 256; // R
        raw[idx + 1] = (y * 11) % 256; // G
        raw[idx + 2] = ((x + y) * 13) % 256; // B
        raw[idx + 3] = 255; // A
      }
    }
    return sharp(raw, { raw: { width, height, channels: 4 } })
      .png()
      .toBuffer();
  }

  const password = "SuperSecretPassword#2026!";
  const secretMessage = "Abhedya: The Vishanti Cipher. Hidden in plain sight, protected by Argon2id & XChaCha20-Poly1305. 🕉️✨🛡️";

  it("should complete a full round-trip in scattered mode using in-memory buffers", async () => {
    const initialPng = await generateTestPng(200, 200);

    // 1. Hide message
    const hideResult = await hideMessage({
      imageBuffer: initialPng,
      message: secretMessage,
      password,
      mode: "scattered"
    });

    expect(hideResult.success).toBe(true);
    expect(hideResult.pngBuffer).toBeInstanceOf(Buffer);
    expect(hideResult.bytesEmbedded).toBeGreaterThan(66);

    // 2. Reveal message
    const revealResult = await revealMessage({
      imageBuffer: hideResult.pngBuffer,
      password,
      mode: "scattered"
    });

    expect(revealResult.success).toBe(true);
    expect(revealResult.message).toBe(secretMessage);
  });

  it("should complete a full round-trip in basic (sequential) mode", async () => {
    const initialPng = await generateTestPng(200, 200);

    const hideResult = await hideMessage({
      imageBuffer: initialPng,
      message: secretMessage,
      password,
      mode: "basic"
    });

    const revealResult = await revealMessage({
      imageBuffer: hideResult.pngBuffer,
      password,
      mode: "basic"
    });

    expect(revealResult.message).toBe(secretMessage);
  });

  it("should auto-detect embedding mode during revealMessage", async () => {
    const initialPng = await generateTestPng(200, 200);

    const hideResult = await hideMessage({
      imageBuffer: initialPng,
      message: "Auto-detect works smoothly!",
      password,
      mode: "scattered"
    });

    // Call revealMessage without explicit mode (defaults to "auto")
    const revealResult = await revealMessage({
      imageBuffer: hideResult.pngBuffer,
      password
    });

    expect(revealResult.success).toBe(true);
    expect(revealResult.message).toBe("Auto-detect works smoothly!");
  });

  it("should complete a round-trip through file system (save PNG to disk, read from path)", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "abhedya-test-"));
    const inputPath = path.join(tempDir, "source.png");
    const outputPath = path.join(tempDir, "encoded.png");

    try {
      const initialPng = await generateTestPng(150, 150);
      await fs.writeFile(inputPath, initialPng);

      const hideResult = await hideMessage({
        imagePath: inputPath,
        outputPath,
        message: secretMessage,
        password,
        mode: "scattered"
      });

      expect(hideResult.outputPath).toBe(outputPath);

      // Verify file exists on disk
      const fileStat = await fs.stat(outputPath);
      expect(fileStat.size).toBeGreaterThan(0);

      // Reveal from disk path
      const revealResult = await revealMessage({
        imagePath: outputPath,
        password
      });

      expect(revealResult.message).toBe(secretMessage);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("should accurately estimate capacity from image buffer or path", async () => {
    const initialPng = await generateTestPng(300, 200);
    const report = await estimateCapacity({ imageBuffer: initialPng });

    expect(report.width).toBe(300);
    expect(report.height).toBe(200);
    expect(report.rawBitCapacity).toBe(300 * 200 * 3);
    expect(report.rawByteCapacity).toBe(22500);
    expect(report.maxPlaintextBytes).toBe(22500 - 66);
  });
});
