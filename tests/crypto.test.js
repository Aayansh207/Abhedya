// tests/crypto.test.js
import { describe, it, expect } from "vitest";
import { deriveEncryptionKey, deriveEmbeddingKey, generateSalt, generateNonce } from "../core/crypto/keyDerivation.js";
import { encryptMessage, encryptRaw } from "../core/crypto/encryption.js";
import { decryptMessage, decryptRaw } from "../core/crypto/decryption.js";
import { AuthenticationError } from "../core/errors.js";

describe("Crypto Module", () => {
  const password = "correct-horse-battery-staple-2026!";
  const testMessage = "Abhedya secret message: The Vishanti Cipher protects this payload! 🕉️ ⚡ 🔒";

  it("should generate 16-byte salt and 24-byte nonce with uniqueness", async () => {
    const salt1 = await generateSalt();
    const salt2 = await generateSalt();
    const nonce1 = await generateNonce();
    const nonce2 = await generateNonce();

    expect(salt1.length).toBe(16);
    expect(salt2.length).toBe(16);
    expect(nonce1.length).toBe(24);
    expect(nonce2.length).toBe(24);

    expect(Buffer.from(salt1).equals(Buffer.from(salt2))).toBe(false);
    expect(Buffer.from(nonce1).equals(Buffer.from(nonce2))).toBe(false);
  });

  it("should derive deterministic 32-byte embedding key with domain separation", async () => {
    const key1 = await deriveEmbeddingKey(password, 800, 600);
    const key2 = await deriveEmbeddingKey(password, 800, 600);
    const keyDiffDim = await deriveEmbeddingKey(password, 1024, 768);
    const keyDiffPass = await deriveEmbeddingKey("different-password", 800, 600);

    expect(key1.length).toBe(32);
    expect(Buffer.from(key1).equals(Buffer.from(key2))).toBe(true);
    expect(Buffer.from(key1).equals(Buffer.from(keyDiffDim))).toBe(false);
    expect(Buffer.from(key1).equals(Buffer.from(keyDiffPass))).toBe(false);
  });

  it("should encrypt and decrypt a message with the correct password", async () => {
    const aad = new Uint8Array([1, 2, 3, 4]);
    const { ciphertext, salt, nonce } = await encryptMessage({
      message: testMessage,
      password,
      aad
    });

    expect(ciphertext.length).toBe(Buffer.byteLength(testMessage) + 16);

    const { plaintext } = await decryptMessage({
      ciphertext,
      password,
      salt,
      nonce,
      aad
    });

    expect(plaintext).toBe(testMessage);
  });

  it("should fail authentication when given an incorrect password", async () => {
    const { ciphertext, salt, nonce } = await encryptMessage({
      message: testMessage,
      password
    });

    await expect(
      decryptMessage({
        ciphertext,
        password: "incorrect-password",
        salt,
        nonce
      })
    ).rejects.toThrow(AuthenticationError);
  });

  it("should fail authentication when ciphertext is tampered", async () => {
    const { ciphertext, salt, nonce } = await encryptMessage({
      message: testMessage,
      password
    });

    const tampered = new Uint8Array(ciphertext);
    tampered[0] ^= 0x01; // flip 1 bit

    await expect(
      decryptMessage({
        ciphertext: tampered,
        password,
        salt,
        nonce
      })
    ).rejects.toThrow(AuthenticationError);
  });

  it("should fail authentication when AAD does not match", async () => {
    const aad1 = new Uint8Array([1, 2, 3, 4]);
    const aad2 = new Uint8Array([1, 2, 3, 5]);

    const { ciphertext, salt, nonce } = await encryptMessage({
      message: testMessage,
      password,
      aad: aad1
    });

    await expect(
      decryptMessage({
        ciphertext,
        password,
        salt,
        nonce,
        aad: aad2
      })
    ).rejects.toThrow(AuthenticationError);
  });

  it("should preserve multi-byte UTF-8 Unicode characters cleanly", async () => {
    const complexUnicode = "अभेद सुरक्षित संदेश — 🚀 Sanskrit, Hindi, Japanese (日本語), Arabic (العربية) & Emojis! 🛡️";
    const { ciphertext, salt, nonce } = await encryptMessage({
      message: complexUnicode,
      password
    });

    const { plaintext } = await decryptMessage({
      ciphertext,
      password,
      salt,
      nonce
    });

    expect(plaintext).toBe(complexUnicode);
  });
});
