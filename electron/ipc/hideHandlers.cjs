// electron/ipc/hideHandlers.cjs
const { validateFilePath } = require("../security/fileValidation.cjs");

function registerHideHandlers(ipcMain) {
  ipcMain.handle("abhedya:hide-message", async (_event, params) => {
    const { hideMessage } = await import("../../core/index.js");

    if (params.imagePath) {
      validateFilePath(params.imagePath);
    }
    if (!params.message || typeof params.message !== "string") {
      throw new Error("Message must be a non-empty string");
    }
    if (!params.password || typeof params.password !== "string") {
      throw new Error("Password must be a non-empty string");
    }

    try {
      const result = await hideMessage(params);
      return {
        success: true,
        outputPath: result.outputPath,
        width: result.width,
        height: result.height,
        bytesEmbedded: result.bytesEmbedded
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  });

  ipcMain.handle("abhedya:hide-decoy", async (_event, params) => {
    const { hideDecoyMessages } = await import("../../core/index.js");

    if (params.imagePath) {
      validateFilePath(params.imagePath);
    }

    try {
      const result = await hideDecoyMessages(params);
      return {
        success: true,
        outputPath: result.outputPath,
        width: result.width,
        height: result.height
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  });
}

module.exports = { registerHideHandlers };
