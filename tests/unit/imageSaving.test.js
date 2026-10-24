import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { validateOutputPath } from "../../electron/security/fileValidation.cjs";

describe("Image Output Saving and Export Verification", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "abhedya-save-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("safely decodes base64 data URLs and writes a genuine PNG image file", () => {
    // Standard 1x1 transparent PNG base64 data URL
    const pngDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const base64Content = pngDataUrl.split(",")[1];
    const buffer = Buffer.from(base64Content, "base64");

    const targetFile = path.join(tempDir, "output_encoded.png");
    const validation = validateOutputPath(targetFile);
    expect(validation.valid).toBe(true);

    fs.writeFileSync(validation.safePath, buffer);

    expect(fs.existsSync(validation.safePath)).toBe(true);
    const stat = fs.statSync(validation.safePath);
    expect(stat.size).toBe(buffer.length);
    expect(stat.size).toBeGreaterThan(0);

    // Verify PNG magic bytes
    const header = Buffer.alloc(8);
    const fd = fs.openSync(validation.safePath, "r");
    fs.readSync(fd, header, 0, 8, 0);
    fs.closeSync(fd);

    expect(header).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  });

  it("guarantees output path always enforces .png extension", () => {
    const rawPath = path.join(tempDir, "exported_image");
    const validated = validateOutputPath(rawPath);
    expect(validated.valid).toBe(true);
    expect(validated.safePath.endsWith(".png")).toBe(true);
  });
});
