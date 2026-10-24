import { describe, it, expect } from "vitest";
import { GENERIC_REVEAL_ERROR } from "../../electron/ipc/revealHandlers.cjs";

describe("IPC Security and Generic Error Contract", () => {
  it("enforces exact generic failure message for recovery failures", () => {
    // Event security requirement:
    // Display the same generic failure message when recovery fails, regardless of whether
    // the cause is a wrong password, absent payload, corrupted data, or failed authentication.
    expect(GENERIC_REVEAL_ERROR).toBe(
      "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."
    );
  });

  it("ensures generic error message does not leak implementation details", () => {
    // Should not contain cryptographic library names, key lengths, tag offsets, or internal stack terms
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/AES/i);
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/GCM/i);
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/PBKDF2/i);
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/Argon2/i);
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/tag/i);
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/nonce/i);
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/salt/i);
    expect(GENERIC_REVEAL_ERROR).not.toMatch(/stack/i);
  });
});
