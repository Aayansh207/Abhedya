/**
 * Abhedya - Hide Message IPC Handler
 * Validates renderer inputs, manages capacity estimation, and connects to the core engine.
 * Never logs plaintext messages, passwords, or derived keys.
 */

const { ipcMain } = require("electron");
const path = require("node:path");
const { validateImageFile } = require("../security/fileValidation.cjs");

const { pathToFileURL } = require("node:url");

// Cached reference to core module
let coreModule = null;

async function getCoreModule() {
  if (!coreModule) {
    try {
      const corePath = path.resolve(__dirname, "../../core/index.js");
      coreModule = await import(pathToFileURL(corePath).href);
    } catch (_err) {
      coreModule = null;
    }
  }
  return coreModule;
}

/**
 * Fallback capacity estimation when core engine is in stub/WIP state
 */
function fallbackCapacityEstimate(dimensions) {
  const { width, height } = dimensions;
  if (!width || !height) {
    return { maxPayloadBytes: 0, totalBitsAvailable: 0, overheadBytes: 64 };
  }
  // Standard RGB LSB: 1 bit per RGB channel = 3 bits per pixel
  const totalBitsAvailable = width * height * 3;
  const totalCapacityBytes = Math.floor(totalBitsAvailable / 8);
  const overheadBytes = 64; // Reserved for magic, salt, iv, len, auth tag
  const maxPayloadBytes = Math.max(0, totalCapacityBytes - overheadBytes);

  return {
    maxPayloadBytes,
    totalBitsAvailable,
    overheadBytes,
    width,
    height
  };
}

/**
 * Registers hide-message and capacity-estimation IPC handlers
 */
function registerHideHandlers() {
  // Estimate steganographic capacity
  ipcMain.handle("stego:estimateCapacity", async (_event, params = {}) => {
    const { imagePath, mode = "standard" } = params;

    if (!imagePath || typeof imagePath !== "string") {
      return { success: false, error: "No image file provided for capacity calculation." };
    }

    const validation = validateImageFile(imagePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const core = await getCoreModule();
      if (core && typeof core.estimateCapacity === "function") {
        try {
          const coreResult = await core.estimateCapacity({
            imagePath: validation.details.filePath,
            mode,
            dimensions: validation.details.dimensions
          });
          if (coreResult && typeof coreResult.maxPayloadBytes === "number") {
            return {
              success: true,
              ...coreResult,
              width: validation.details.dimensions.width,
              height: validation.details.dimensions.height
            };
          }
        } catch (coreErr) {
          // If core function is a TODO stub, fall back to standard estimation calculation
          if (coreErr.message && coreErr.message.includes("TODO")) {
            const fallback = fallbackCapacityEstimate(validation.details.dimensions);
            return {
              success: true,
              ...fallback,
              isMockEstimate: true
            };
          }
          throw coreErr;
        }
      }

      // Default fallback estimation
      const fallback = fallbackCapacityEstimate(validation.details.dimensions);
      return {
        success: true,
        ...fallback,
        isMockEstimate: true
      };
    } catch (_err) {
      return {
        success: false,
        error: "Unable to calculate steganographic capacity for this image."
      };
    }
  });

  // Hide message into image
  ipcMain.handle("stego:hide", async (_event, params = {}) => {
    const { imagePath, message, password, mode = "standard" } = params;

    // Strict input validation
    if (!imagePath || typeof imagePath !== "string") {
      return { success: false, error: "A carrier image is required." };
    }

    if (typeof message !== "string" || message.length === 0) {
      return { success: false, error: "Message cannot be empty." };
    }

    if (typeof password !== "string" || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const validation = validateImageFile(imagePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Capacity verification
    const messageSizeBytes = Buffer.byteLength(message, "utf8");
    const capacityInfo = fallbackCapacityEstimate(validation.details.dimensions);
    if (messageSizeBytes > capacityInfo.maxPayloadBytes) {
      return {
        success: false,
        error: `Message size (${messageSizeBytes} bytes) exceeds image maximum payload capacity (${capacityInfo.maxPayloadBytes} bytes).`
      };
    }

    try {
      const core = await getCoreModule();
      if (core && typeof core.hideMessage === "function") {
        try {
          const result = await core.hideMessage({
            imagePath: validation.details.filePath,
            message,
            password,
            mode
          });
          return { success: true, ...result };
        } catch (coreErr) {
          if (coreErr.message && coreErr.message.includes("TODO")) {
            // Milestone 2 Mock Response when Member 2 core is still a stub
            return {
              success: true,
              isMock: true,
              suggestedName: `abhedya_secret_${Date.now()}.png`,
              messageBytes: messageSizeBytes,
              mode,
              note: "Core steganography engine is pending Member 2 implementation."
            };
          }
          throw coreErr;
        }
      }

      return {
        success: false,
        error: "Steganography engine is currently unavailable."
      };
    } catch (_err) {
      return {
        success: false,
        error: "Encoding failed. Could not embed message into image."
      };
    }
  });
}

module.exports = { registerHideHandlers };
