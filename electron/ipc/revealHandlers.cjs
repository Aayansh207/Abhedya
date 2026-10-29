/**
 * Abhedya - Reveal Message IPC Handler
 * Validates inputs, requires lossless PNG images for steganographic recovery,
 * calls the core engine, and strictly returns a single generic failure message
 * upon any recovery error (wrong password, missing payload, corrupted bits).
 *
 * Never logs passwords, plaintext messages, or derived keys.
 */

const { ipcMain } = require("electron");
const path = require("node:path");
const { validateImageFile } = require("../security/fileValidation.cjs");

const { pathToFileURL } = require("node:url");

// Generic failure message mandated by event security rules
const GENERIC_REVEAL_ERROR =
  "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload.";

let coreModule = null;

async function getCoreModule() {
  if (!coreModule) {
    try {
      const corePath = path.resolve(__dirname, "../../core/index.js");
      coreModule = await import(pathToFileURL(corePath).href);
    } catch (err) {
      console.error("[RevealHandler] Failed to import core engine module:", err);
      coreModule = null;
    }
  }
  return coreModule;
}

/**
 * Registers reveal-message IPC handlers
 */
function registerRevealHandlers() {
  ipcMain.handle("stego:reveal", async (_event, params = {}) => {
    const { imagePath, password, mode = "auto" } = params;

    // Validate inputs
    if (!imagePath || typeof imagePath !== "string") {
      return { success: false, error: "Please select an image to inspect." };
    }

    if (typeof password !== "string" || password.length === 0) {
      return { success: false, error: "Please enter the decryption password." };
    }

    // Require PNG file
    const validation = validateImageFile(imagePath, { requirePng: true });
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const coreMode = mode === "standard" ? "basic" : (mode || "auto");

    try {
      const core = await getCoreModule();
      if (core && typeof core.revealMessage === "function") {
        try {
          const result = await core.revealMessage({
            imagePath: validation.details.filePath,
            password,
            mode: coreMode
          });

          if (result && typeof result.message === "string") {
            return {
              success: true,
              message: result.message,
              mode: result.mode || coreMode
            };
          }
          // If result does not contain a valid decrypted message, return generic error
          return {
            success: false,
            error: GENERIC_REVEAL_ERROR
          };
        } catch (coreErr) {
          // If core function is a TODO stub during Milestone 2
          if (coreErr.message && coreErr.message.includes("TODO")) {
            return {
              success: false,
              isMock: true,
              error: `${GENERIC_REVEAL_ERROR} (Note: Core engine pending Member 2 implementation)`
            };
          }
          // For any other error (wrong password, auth tag mismatch, corrupted bytes),
          // always mask with the generic failure error
          return {
            success: false,
            error: GENERIC_REVEAL_ERROR
          };
        }
      }

      return {
        success: false,
        error: GENERIC_REVEAL_ERROR
      };
    } catch (_err) {
      // Catch-all returns the same generic failure message
      return {
        success: false,
        error: GENERIC_REVEAL_ERROR
      };
    }
  });
}

module.exports = {
  registerRevealHandlers,
  GENERIC_REVEAL_ERROR
};
