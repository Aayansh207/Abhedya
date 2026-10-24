import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  detectFormatFromBuffer,
  extractDimensions,
  validateImageFile,
  validateOutputPath,
  MAX_FILE_SIZE_BYTES,
  MIN_FILE_SIZE_BYTES
} from "../../electron/security/fileValidation.cjs";

describe("File Validation Security Module", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "abhedya-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("Magic Byte Format Detection", () => {
    it("identifies valid PNG magic bytes", () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      expect(detectFormatFromBuffer(pngHeader)).toBe("png");
    });

    it("identifies valid JPEG magic bytes", () => {
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      expect(detectFormatFromBuffer(jpegHeader)).toBe("jpeg");
    });

    it("identifies valid WebP magic bytes", () => {
      const webpHeader = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50, // WEBP
        0x56, 0x50, 0x38, 0x20  // VP8
      ]);
      expect(detectFormatFromBuffer(webpHeader)).toBe("webp");
    });

    it("identifies valid BMP magic bytes", () => {
      const bmpHeader = Buffer.from([0x42, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      expect(detectFormatFromBuffer(bmpHeader)).toBe("bmp");
    });

    it("rejects malicious or unsupported files disguised with image extensions", () => {
      // Shell script or HTML disguised as .png
      const fakePng = Buffer.from("#!/bin/bash\necho 'hello world'\n");
      expect(detectFormatFromBuffer(fakePng)).toBeNull();

      const htmlBuffer = Buffer.from("<!DOCTYPE html><html><body>x</body></html>");
      expect(detectFormatFromBuffer(htmlBuffer)).toBeNull();
    });
  });

  describe("Dimension Extraction", () => {
    it("extracts width and height from PNG IHDR chunk", () => {
      // Construct minimal PNG header with IHDR: 100x200
      const pngBuffer = Buffer.alloc(32);
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(pngBuffer, 0);
      pngBuffer.writeUInt32BE(13, 8); // chunk len
      pngBuffer.write("IHDR", 12, "ascii");
      pngBuffer.writeUInt32BE(100, 16); // width = 100
      pngBuffer.writeUInt32BE(200, 20); // height = 200

      const dims = extractDimensions(pngBuffer, "png");
      expect(dims).toEqual({ width: 100, height: 200 });
    });

    it("extracts dimensions from BMP DIB header", () => {
      const bmpBuffer = Buffer.alloc(30);
      bmpBuffer.write("BM", 0, "ascii");
      bmpBuffer.writeInt32LE(640, 18); // width = 640
      bmpBuffer.writeInt32LE(480, 22); // height = 480

      const dims = extractDimensions(bmpBuffer, "bmp");
      expect(dims).toEqual({ width: 640, height: 480 });
    });
  });

  describe("File Validation & Security Guards", () => {
    it("rejects non-existent file paths", () => {
      const result = validateImageFile(path.join(tempDir, "non_existent.png"));
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/does not exist/i);
    });

    it("rejects files below minimum header size", () => {
      const tinyFile = path.join(tempDir, "tiny.png");
      fs.writeFileSync(tinyFile, Buffer.from([0x01, 0x02]));

      const result = validateImageFile(tinyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/too small/i);
    });

    it("accepts valid PNG image file", () => {
      const validPng = path.join(tempDir, "valid.png");
      const buffer = Buffer.alloc(128);
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
      buffer.writeUInt32BE(13, 8);
      buffer.write("IHDR", 12, "ascii");
      buffer.writeUInt32BE(800, 16);
      buffer.writeUInt32BE(600, 20);
      fs.writeFileSync(validPng, buffer);

      const result = validateImageFile(validPng);
      expect(result.valid).toBe(true);
      expect(result.details.format).toBe("png");
      expect(result.details.dimensions).toEqual({ width: 800, height: 600 });
    });

    it("enforces requirePng: true rule for steganography reveal mode", () => {
      const validJpeg = path.join(tempDir, "test.jpg");
      const buffer = Buffer.alloc(128);
      Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]).copy(buffer, 0);
      fs.writeFileSync(validJpeg, buffer);

      // In general mode, JPEG is accepted as a carrier
      const carrierRes = validateImageFile(validJpeg, { requirePng: false });
      expect(carrierRes.valid).toBe(true);

      // In reveal mode, non-PNG must be strictly rejected
      const revealRes = validateImageFile(validJpeg, { requirePng: true });
      expect(revealRes.valid).toBe(false);
      expect(revealRes.error).toMatch(/lossless PNG/i);
    });
  });

  describe("Output Path Validation", () => {
    it("appends .png extension if missing", () => {
      const out = validateOutputPath(path.join(tempDir, "my_secret"));
      expect(out.valid).toBe(true);
      expect(out.safePath.endsWith(".png")).toBe(true);
    });

    it("preserves existing .png extension", () => {
      const out = validateOutputPath(path.join(tempDir, "my_secret.png"));
      expect(out.valid).toBe(true);
      expect(out.safePath.endsWith(".png")).toBe(true);
      expect(out.safePath.endsWith(".png.png")).toBe(false);
    });

    it("rejects non-existent destination directories", () => {
      const out = validateOutputPath("/invalid/directory/path/secret.png");
      expect(out.valid).toBe(false);
      expect(out.error).toMatch(/does not exist/i);
    });
  });
});
