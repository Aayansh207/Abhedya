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
    } catch (err) {
      console.error("[HideHandler] Failed to import core engine module:", err);
      coreModule = null;
    }
  }
  return coreModule;
}

/**
 * Fallback capacity estimation when core engine is in stub/WIP state
 */
function fallbackCapacityEstimate(dimensions, mode = "basic", partitions = 1) {
  const { width, height } = dimensions;
  if (!width || !height) {
    return { maxPayloadBytes: 0, totalBitsAvailable: 0, overheadBytes: 66, partitions: 1 };
  }
  // Standard RGB LSB: 1 bit per RGB channel = 3 bits per pixel
  const totalBitsAvailable = width * height * 3;
  const totalCapacityBytes = Math.floor(totalBitsAvailable / 8);
  const partCount = partitions > 1 ? partitions : (mode === "decoy" ? 2 : 1);
  const usableBytes = Math.floor(totalCapacityBytes / partCount);
  const overheadBytes = 66; // 50 bytes header + 16 bytes Poly1305 MAC tag
  const maxPayloadBytes = Math.max(0, usableBytes - overheadBytes);

  return {
    maxPayloadBytes,
    totalBitsAvailable,
    overheadBytes,
    width,
    height,
    partitions: partCount
  };
}

/**
 * Registers hide-message and capacity-estimation IPC handlers
 */
function registerHideHandlers() {
  // Estimate steganographic capacity
  ipcMain.handle("stego:estimateCapacity", async (_event, params = {}) => {
    const { imagePath, mode = "standard", partitions, entriesCount } = params;

    if (!imagePath || typeof imagePath !== "string") {
      return { success: false, error: "No image file provided for capacity calculation." };
    }

    const validation = validateImageFile(imagePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const effectiveMode = mode === "standard" ? "basic" : mode;
    const effectivePartitions = partitions || (effectiveMode === "decoy" ? 2 : effectiveMode === "multi" ? Math.max(2, entriesCount || 2) : 1);

    try {
      const core = await getCoreModule();
      if (core && typeof core.estimateCapacity === "function") {
        try {
          const coreResult = await core.estimateCapacity({
            imagePath: validation.details.filePath,
            width: validation.details.dimensions?.width,
            height: validation.details.dimensions?.height,
            mode: effectiveMode,
            partitions: effectivePartitions,
            entriesCount
          });
          const maxPayload = coreResult?.maxPlaintextBytes ?? coreResult?.maxPayloadBytes;
          const overhead = coreResult?.payloadOverheadBytes ?? coreResult?.overheadBytes ?? 66;
          if (coreResult && typeof maxPayload === "number") {
            return {
              success: true,
              ...coreResult,
              maxPayloadBytes: maxPayload,
              overheadBytes: overhead,
              width: validation.details.dimensions.width,
              height: validation.details.dimensions.height,
              partitions: effectivePartitions
            };
          }
        } catch (coreErr) {
          if (coreErr.message && coreErr.message.includes("TODO")) {
            const fallback = fallbackCapacityEstimate(validation.details.dimensions, effectiveMode, effectivePartitions);
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
      const fallback = fallbackCapacityEstimate(validation.details.dimensions, effectiveMode, effectivePartitions);
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
    const {
      imagePath,
      message,
      password,
      mode = "scattered",
      primary,
      decoy,
      entries
    } = params;

    // Strict image validation
    if (!imagePath || typeof imagePath !== "string") {
      return { success: false, error: "A carrier image is required." };
    }

    const validation = validateImageFile(imagePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const core = await getCoreModule();
    if (!core) {
      return {
        success: false,
        error: "Steganography engine is currently unavailable."
      };
    }

    try {
      // 1. DECOY MODE
      if (mode === "decoy") {
        if (!primary?.message || typeof primary.message !== "string") {
          return { success: false, error: "Primary secret message cannot be empty." };
        }
        if (!primary?.password || typeof primary.password !== "string" || primary.password.length < 8) {
          return { success: false, error: "Primary passphrase must be at least 8 characters long." };
        }
        if (!decoy?.message || typeof decoy.message !== "string") {
          return { success: false, error: "Decoy cover message cannot be empty." };
        }
        if (!decoy?.password || typeof decoy.password !== "string" || decoy.password.length < 8) {
          return { success: false, error: "Decoy passphrase must be at least 8 characters long." };
        }
        if (primary.password === decoy.password) {
          return { success: false, error: "Primary and Decoy passphrases must be distinct." };
        }

        const capacity = await core.estimateCapacity({
          imagePath: validation.details.filePath,
          width: validation.details.dimensions?.width,
          height: validation.details.dimensions?.height,
          mode: "decoy"
        });

        const primaryBytes = Buffer.byteLength(primary.message, "utf8");
        const decoyBytes = Buffer.byteLength(decoy.message, "utf8");
        const maxBytes = capacity.maxPlaintextBytes;

        if (primaryBytes > maxBytes) {
          return {
            success: false,
            error: `Primary message size (${primaryBytes} bytes) exceeds per-carrier capacity (${maxBytes} bytes).`
          };
        }
        if (decoyBytes > maxBytes) {
          return {
            success: false,
            error: `Decoy message size (${decoyBytes} bytes) exceeds per-carrier capacity (${maxBytes} bytes).`
          };
        }

        const result = await core.hideDecoyMessages({
          imagePath: validation.details.filePath,
          primary: { message: primary.message, password: primary.password },
          decoy: { message: decoy.message, password: decoy.password }
        });

        const previewDataUrl = result?.pngBuffer
          ? `data:image/png;base64,${result.pngBuffer.toString("base64")}`
          : null;

        return {
          success: true,
          ...result,
          pngBuffer: result.pngBuffer,
          previewDataUrl,
          suggestedName: `abhedya_decoy_${Date.now()}.png`,
          mode: "decoy"
        };
      }

      // 2. MULTI-CARRIER MODE
      if (mode === "multi") {
        if (!entries || !Array.isArray(entries) || entries.length < 2 || entries.length > 4) {
          return { success: false, error: "Multi-carrier mode requires between 2 and 4 messages." };
        }

        const usedPasswords = new Set();
        for (let i = 0; i < entries.length; i++) {
          const item = entries[i];
          if (!item.message || typeof item.message !== "string") {
            return { success: false, error: `Message #${i + 1} cannot be empty.` };
          }
          if (!item.password || typeof item.password !== "string" || item.password.length < 8) {
            return { success: false, error: `Passphrase for Message #${i + 1} must be at least 8 characters long.` };
          }
          if (usedPasswords.has(item.password)) {
            return { success: false, error: `Passphrase for Message #${i + 1} must be distinct from other passphrases.` };
          }
          usedPasswords.add(item.password);
        }

        const capacity = await core.estimateCapacity({
          imagePath: validation.details.filePath,
          width: validation.details.dimensions?.width,
          height: validation.details.dimensions?.height,
          mode: "multi",
          partitions: entries.length
        });
        const maxBytes = capacity.maxPlaintextBytes;

        for (let i = 0; i < entries.length; i++) {
          const byteLen = Buffer.byteLength(entries[i].message, "utf8");
          if (byteLen > maxBytes) {
            return {
              success: false,
              error: `Message #${i + 1} size (${byteLen} bytes) exceeds partition capacity (${maxBytes} bytes).`
            };
          }
        }

        const result = await core.hideMultipleMessages({
          imagePath: validation.details.filePath,
          entries: entries.map((e) => ({ message: e.message, password: e.password }))
        });

        const previewDataUrl = result?.pngBuffer
          ? `data:image/png;base64,${result.pngBuffer.toString("base64")}`
          : null;

        return {
          success: true,
          ...result,
          pngBuffer: result.pngBuffer,
          previewDataUrl,
          suggestedName: `abhedya_multi_${Date.now()}.png`,
          mode: "multi"
        };
      }

      // 3. SINGLE MESSAGE (SCATTERED OR BASIC)
      if (typeof message !== "string" || message.length === 0) {
        return { success: false, error: "Message cannot be empty." };
      }

      if (typeof password !== "string" || password.length < 8) {
        return { success: false, error: "Password must be at least 8 characters long." };
      }

      const coreMode = (mode === "standard" || mode === "basic") ? "basic" : "scattered";
      const messageSizeBytes = Buffer.byteLength(message, "utf8");

      const capacity = await core.estimateCapacity({
        imagePath: validation.details.filePath,
        width: validation.details.dimensions?.width,
        height: validation.details.dimensions?.height,
        mode: coreMode
      });
      const maxPayloadBytes = capacity.maxPlaintextBytes ?? fallbackCapacityEstimate(validation.details.dimensions).maxPayloadBytes;

      if (messageSizeBytes > maxPayloadBytes) {
        return {
          success: false,
          error: `Message size (${messageSizeBytes} bytes) exceeds image maximum payload capacity (${maxPayloadBytes} bytes).`
        };
      }

      const result = await core.hideMessage({
        imagePath: validation.details.filePath,
        message,
        password,
        mode: coreMode
      });

      const previewDataUrl = result?.pngBuffer
        ? `data:image/png;base64,${result.pngBuffer.toString("base64")}`
        : null;

      return {
        success: true,
        ...result,
        pngBuffer: result.pngBuffer,
        previewDataUrl,
        suggestedName: `abhedya_secret_${Date.now()}.png`,
        mode: coreMode
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
