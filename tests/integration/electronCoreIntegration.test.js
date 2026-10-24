// tests/integration/electronCoreIntegration.test.js
import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import sharp from "sharp";
import { pathToFileURL } from "node:url";
import { GENERIC_REVEAL_ERROR } from "../../electron/ipc/revealHandlers.cjs";

describe("Electron IPC & Core Engine Integration", () => {
  let coreModule = null;

  it("should successfully import core/index.js via dynamic pathToFileURL import", async () => {
    const corePath = path.resolve(__dirname, "../../core/index.js");
    coreModule = await import(pathToFileURL(corePath).href);

    expect(coreModule).toBeDefined();
    expect(typeof coreModule.hideMessage).toBe("function");
    expect(typeof coreModule.revealMessage).toBe("function");
    expect(typeof coreModule.estimateCapacity).toBe("function");
    expect(typeof coreModule.analyzeChiSquare).toBe("function");
    expect(typeof coreModule.analyzeRS).toBe("function");
  });

  it("should estimate capacity with normalized maxPayloadBytes", async () => {
    const cap = await coreModule.estimateCapacity({
      width: 600,
      height: 400,
      mode: "scattered"
    });

    const maxPayload = cap.maxPlaintextBytes ?? cap.maxPayloadBytes;
    expect(typeof maxPayload).toBe("number");
    expect(maxPayload).toBeGreaterThan(1000);
    expect(cap.payloadOverheadBytes).toBe(66);
  });

  it("should perform complete hide -> save -> reveal round trip matching IPC payload flow", async () => {
    const tmpDir = os.tmpdir();
    const carrierPath = path.join(tmpDir, `abhedya_test_carrier_${Date.now()}.png`);
    const outputPath = path.join(tmpDir, `abhedya_test_output_${Date.now()}.png`);

    // 1. Generate clean carrier image
    await sharp({
      create: {
        width: 150,
        height: 150,
        channels: 4,
        background: { r: 64, g: 128, b: 192, alpha: 1 }
      }
    })
      .png()
      .toFile(carrierPath);

    expect(fs.existsSync(carrierPath)).toBe(true);

    const secretPassword = "HardenedVaultPassword#2026";
    const testSecret = "Classified intelligence payload concealed via Vishanti Cipher.";

    // 2. Hide message using core engine via file path
    const hideResult = await coreModule.hideMessage({
      imagePath: carrierPath,
      message: testSecret,
      password: secretPassword,
      mode: "scattered"
    });

    expect(hideResult.success).toBe(true);
    expect(Buffer.isBuffer(hideResult.pngBuffer)).toBe(true);

    // 3. Simulate image:save IPC handler writing bytes to disk
    const rawPayload = hideResult.pngBuffer;
    let buffer = null;
    if (Buffer.isBuffer(rawPayload)) {
      buffer = rawPayload;
    } else if (rawPayload instanceof Uint8Array || ArrayBuffer.isView(rawPayload)) {
      buffer = Buffer.from(rawPayload.buffer, rawPayload.byteOffset, rawPayload.byteLength);
    }
    fs.writeFileSync(outputPath, buffer);

    expect(fs.existsSync(outputPath)).toBe(true);
    expect(fs.statSync(outputPath).size).toBeGreaterThan(0);

    // 4. Reveal message from the saved output file path
    const revealResult = await coreModule.revealMessage({
      imagePath: outputPath,
      password: secretPassword,
      mode: "auto"
    });

    expect(revealResult.success).toBe(true);
    expect(revealResult.message).toBe(testSecret);

    // 5. Test wrong password failure
    let revealError = null;
    try {
      await coreModule.revealMessage({
        imagePath: outputPath,
        password: "WrongPassword999!",
        mode: "auto"
      });
    } catch (_err) {
      revealError = GENERIC_REVEAL_ERROR;
    }

    expect(revealError).toBe(GENERIC_REVEAL_ERROR);

    // 6. Test steganalysis execution on the output image
    const [chiResult, rsResult] = await Promise.all([
      coreModule.analyzeChiSquare(outputPath),
      coreModule.analyzeRS(outputPath)
    ]);

    expect(chiResult.test).toBe("ChiSquare");
    expect(Array.isArray(chiResult.channels)).toBe(true);
    expect(rsResult.test).toBe("RSAnalysis");
    expect(Array.isArray(rsResult.channels)).toBe(true);

    // Cleanup
    try {
      fs.unlinkSync(carrierPath);
      fs.unlinkSync(outputPath);
    } catch (_e) {}
  });
});
