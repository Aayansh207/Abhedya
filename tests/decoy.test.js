// tests/decoy.test.js
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import {
  hideDecoyMessages,
  revealDecoyMessage,
  revealMessage,
  embedMultipleMessages,
  extractMultipleMessage
} from "../core/index.js";
import { AuthenticationError } from "../core/errors.js";

describe("Decoy Mode & Multi-Message Functionality", () => {
  async function generateTestPng(width = 150, height = 150) {
    const raw = Buffer.alloc(width * height * 4, 150);
    return sharp(raw, { raw: { width, height, channels: 4 } })
      .png()
      .toBuffer();
  }

  const primaryMessage = "Top Secret: Launch coordinates are 28.6139° N, 77.2090° E.";
  const primaryPassword = "PrimaryCommanderPassword#1";

  const decoyMessage = "Shopping List: 2 cartons of milk, bread, butter, and coffee beans.";
  const decoyPassword = "InnocentDecoyPassword#2";

  it("should embed two distinct payloads and recover each with its respective password", async () => {
    const sourcePng = await generateTestPng(150, 150);

    const { pngBuffer } = await hideDecoyMessages({
      imageBuffer: sourcePng,
      primary: {
        message: primaryMessage,
        password: primaryPassword
      },
      decoy: {
        message: decoyMessage,
        password: decoyPassword
      }
    });

    // 1. Reveal using Primary password
    const primaryResult = await revealDecoyMessage({
      imageBuffer: pngBuffer,
      password: primaryPassword
    });

    expect(primaryResult.message).toBe(primaryMessage);
    expect(primaryResult.carrierType).toBe("primary");

    // 2. Reveal using Decoy password
    const decoyResult = await revealDecoyMessage({
      imageBuffer: pngBuffer,
      password: decoyPassword
    });

    expect(decoyResult.message).toBe(decoyMessage);
    expect(decoyResult.carrierType).toBe("decoy");
  });

  it("should seamlessly recover primary or decoy via auto-detect in standard revealMessage", async () => {
    const sourcePng = await generateTestPng(150, 150);

    const { pngBuffer } = await hideDecoyMessages({
      imageBuffer: sourcePng,
      primary: {
        message: primaryMessage,
        password: primaryPassword
      },
      decoy: {
        message: decoyMessage,
        password: decoyPassword
      }
    });

    // Standard reveal with primary password
    const res1 = await revealMessage({
      imageBuffer: pngBuffer,
      password: primaryPassword
    });
    expect(res1.message).toBe(primaryMessage);

    // Standard reveal with decoy password
    const res2 = await revealMessage({
      imageBuffer: pngBuffer,
      password: decoyPassword
    });
    expect(res2.message).toBe(decoyMessage);
  });

  it("should fail safely when an unauthorized third password is provided", async () => {
    const sourcePng = await generateTestPng(150, 150);

    const { pngBuffer } = await hideDecoyMessages({
      imageBuffer: sourcePng,
      primary: {
        message: primaryMessage,
        password: primaryPassword
      },
      decoy: {
        message: decoyMessage,
        password: decoyPassword
      }
    });

    await expect(
      revealDecoyMessage({
        imageBuffer: pngBuffer,
        password: "AttackerThirdPassword#999"
      })
    ).rejects.toThrow(AuthenticationError);
  });

  it("should support 3-message multi-carrier embedding and distinct extraction", async () => {
    const width = 180;
    const height = 180;
    const pixelBuffer = Buffer.alloc(width * height * 4, 180);

    const entries = [
      { message: "Agent Alpha Report", password: "PasswordAlpha#1" },
      { message: "Agent Beta Report", password: "PasswordBeta#2" },
      { message: "Agent Gamma Report", password: "PasswordGamma#3" }
    ];

    const modified = await embedMultipleMessages({
      pixelBuffer,
      width,
      height,
      entries
    });

    // Extract each independently
    const resA = await extractMultipleMessage({
      pixelBuffer: modified,
      width,
      height,
      password: "PasswordAlpha#1",
      maxPartitions: 3
    });
    expect(resA.plaintext).toBe("Agent Alpha Report");

    const resB = await extractMultipleMessage({
      pixelBuffer: modified,
      width,
      height,
      password: "PasswordBeta#2",
      maxPartitions: 3
    });
    expect(resB.plaintext).toBe("Agent Beta Report");

    const resC = await extractMultipleMessage({
      pixelBuffer: modified,
      width,
      height,
      password: "PasswordGamma#3",
      maxPartitions: 3
    });
    expect(resC.plaintext).toBe("Agent Gamma Report");
  });
});
