/**
 * Abhedya - Native Image Dialog and Validation Handlers
 * Handles safe file selection, metadata inspection, thumbnail preview generation,
 * and secure PNG save dialogs via Electron's native dialog APIs.
 */

const { dialog, ipcMain, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { validateImageFile, validateOutputPath } = require("../security/fileValidation.cjs");

/**
 * Registers image dialog and validation IPC handlers
 * @param {import('electron').BrowserWindow | (() => import('electron').BrowserWindow)} getMainWindow
 */
function registerImageHandlers(getMainWindow) {
  // Select image via native dialog
  ipcMain.handle("image:select", async (_event, options = {}) => {
    const mainWindow = typeof getMainWindow === "function" ? getMainWindow() : getMainWindow;
    const { requirePng = false } = options;

    const filters = requirePng
      ? [{ name: "PNG Images (*.png)", extensions: ["png"] }]
      : [
          { name: "Supported Images (*.png;*.jpg;*.jpeg;*.webp;*.bmp)", extensions: ["png", "jpg", "jpeg", "webp", "bmp"] },
          { name: "PNG Images (*.png)", extensions: ["png"] },
          { name: "JPEG Images (*.jpg;*.jpeg)", extensions: ["jpg", "jpeg"] },
          { name: "WebP Images (*.webp)", extensions: ["webp"] },
          { name: "BMP Images (*.bmp)", extensions: ["bmp"] }
        ];

    const result = await dialog.showOpenDialog(mainWindow, {
      title: requirePng ? "Select Encoded PNG Image" : "Select Carrier Image",
      buttonLabel: "Select Image",
      properties: ["openFile"],
      filters
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const selectedPath = result.filePaths[0];
    const validation = validateImageFile(selectedPath, { requirePng });

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "Selected file failed validation."
      };
    }

    // Generate safe base64 preview URL for renderer
    try {
      const fileData = fs.readFileSync(validation.details.filePath);
      const mimeType =
        validation.details.format === "png"
          ? "image/png"
          : validation.details.format === "jpeg"
          ? "image/jpeg"
          : validation.details.format === "webp"
          ? "image/webp"
          : "image/bmp";
      const base64Data = fileData.toString("base64");
      const previewDataUrl = `data:${mimeType};base64,${base64Data}`;

      return {
        success: true,
        filePath: validation.details.filePath,
        fileName: validation.details.fileName,
        fileSize: validation.details.fileSize,
        format: validation.details.format,
        width: validation.details.dimensions.width,
        height: validation.details.dimensions.height,
        previewDataUrl
      };
    } catch (_err) {
      return {
        success: false,
        error: "Unable to read image file data."
      };
    }
  });

  // Save image via native dialog
  ipcMain.handle("image:save", async (_event, params = {}) => {
    const mainWindow = typeof getMainWindow === "function" ? getMainWindow() : getMainWindow;
    const {
      suggestedName = "abhedya_encoded.png",
      fileData,
      dataUrl,
      bytes,
      sourcePath,
      imagePath
    } = params;

    const defaultFilename = suggestedName.toLowerCase().endsWith(".png")
      ? suggestedName
      : `${suggestedName}.png`;

    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Save Encoded PNG Image",
      defaultPath: defaultFilename,
      filters: [{ name: "PNG Lossless Image (*.png)", extensions: ["png"] }]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    const pathValidation = validateOutputPath(result.filePath);
    if (!pathValidation.valid) {
      return { success: false, error: pathValidation.error };
    }

    try {
      const rawPayload = bytes || pngBuffer || fileData || dataUrl;
      let buffer = null;

      if (rawPayload) {
        if (Buffer.isBuffer(rawPayload)) {
          buffer = rawPayload;
        } else if (rawPayload instanceof Uint8Array || ArrayBuffer.isView(rawPayload)) {
          buffer = Buffer.from(rawPayload.buffer, rawPayload.byteOffset, rawPayload.byteLength);
        } else if (Array.isArray(rawPayload)) {
          buffer = Buffer.from(rawPayload);
        } else if (typeof rawPayload === "string" && rawPayload.startsWith("data:")) {
          const parts = rawPayload.split(",");
          const base64Content = parts.length > 1 ? parts[1] : parts[0];
          buffer = Buffer.from(base64Content, "base64");
        } else if (typeof rawPayload === "string") {
          buffer = Buffer.from(rawPayload, "base64");
        }
      }

      // Fallback: copy or read directly from source file if provided
      if (!buffer && (sourcePath || imagePath)) {
        const src = sourcePath || imagePath;
        if (typeof src === "string" && fs.existsSync(src)) {
          buffer = fs.readFileSync(src);
        }
      }

      if (!buffer || buffer.length === 0) {
        return {
          success: false,
          error: "No image data was provided to save."
        };
      }

      fs.writeFileSync(pathValidation.safePath, buffer);

      if (!fs.existsSync(pathValidation.safePath) || fs.statSync(pathValidation.safePath).size === 0) {
        return {
          success: false,
          error: "Failed to verify saved image file on disk."
        };
      }

      return {
        success: true,
        filePath: pathValidation.safePath,
        fileName: path.basename(pathValidation.safePath),
        bytesWritten: buffer.length
      };
    } catch (_err) {
      return {
        success: false,
        error: "Failed to write output image to disk."
      };
    }
  });

  // Reveal saved file in native file manager (Finder / File Explorer)
  ipcMain.handle("image:showInFolder", async (_event, targetPath) => {
    if (typeof targetPath === "string" && fs.existsSync(targetPath)) {
      shell.showItemInFolder(targetPath);
      return { success: true };
    }
    return { success: false, error: "File does not exist." };
  });

  // Inspect file path metadata directly (e.g. for drag and drop)
  ipcMain.handle("image:inspect", async (_event, filePath, options = {}) => {
    const validation = validateImageFile(filePath, options);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const fileData = fs.readFileSync(validation.details.filePath);
      const mimeType =
        validation.details.format === "png"
          ? "image/png"
          : validation.details.format === "jpeg"
          ? "image/jpeg"
          : validation.details.format === "webp"
          ? "image/webp"
          : "image/bmp";
      const previewDataUrl = `data:${mimeType};base64,${fileData.toString("base64")}`;

      return {
        success: true,
        filePath: validation.details.filePath,
        fileName: validation.details.fileName,
        fileSize: validation.details.fileSize,
        format: validation.details.format,
        width: validation.details.dimensions.width,
        height: validation.details.dimensions.height,
        previewDataUrl
      };
    } catch (_err) {
      return { success: false, error: "Failed to read image data." };
    }
  });
}

module.exports = { registerImageHandlers };
