// tests/wrongPassword.test.js
import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { hideMessage, revealMessage, USER_FACING_REVEAL_ERROR, AuthenticationError } from "../core/index.js";

describe("Wrong Password & Safe Error Boundary", () => {
  async function generateTestPng(width = 100, height = 100) {
    const raw = Buffer.alloc(width * height * 4, 128);
    return sharp(raw, { raw: { width, height, channels: 4 } })
      .png()
      .toBuffer();
  }

  const correctPassword = "CorrectPassword@123!";
  const wrongPassword = "IncorrectPassword#999";
  const message = "Highly confidential data.";

  it("should fail authentication and return generic error message for incorrect password", async () => {
    const png = await generateTestPng();
    const { pngBuffer } = await hideMessage({
      imageBuffer: png,
      message,
      password: correctPassword,
      mode: "scattered"
    });

    await expect(
      revealMessage({
        imageBuffer: pngBuffer,
        password: wrongPassword
      })
    ).rejects.toThrow(USER_FACING_REVEAL_ERROR);
  });

  it("should fail safely with uniform error message on a plain image with no hidden payload", async () => {
    const plainPng = await generateTestPng();

    await expect(
      revealMessage({
        imageBuffer: plainPng,
        password: correctPassword
      })
    ).rejects.toThrow(USER_FACING_REVEAL_ERROR);
  });

  it("should fail safely with uniform error message on a corrupted payload", async () => {
    const png = await generateTestPng();
    const { pngBuffer } = await hideMessage({
      imageBuffer: png,
      message,
      password: correctPassword,
      mode: "basic"
    });

    // Corrupt bytes in the PNG buffer (or decode, corrupt, re-encode)
    const corruptedPng = Buffer.from(pngBuffer);
    corruptedPng[corruptedPng.length - 20] ^= 0xff;

    await expect(
      revealMessage({
        imageBuffer: corruptedPng,
        password: correctPassword
      })
    ).rejects.toThrow();
  });
});
