// electron/ipc/revealHandlers.cjs
const { validateFilePath } = require("../security/fileValidation.cjs");

function registerRevealHandlers(ipcMain) {
  ipcMain.handle("abhedya:reveal-message", async (_event, params) => {
    const { revealMessage, USER_FACING_REVEAL_ERROR } = await import("../../core/index.js");

    if (params.imagePath) {
      validateFilePath(params.imagePath);
    }
    if (!params.password || typeof params.password !== "string") {
      return {
        success: false,
        error: "Password is required"
      };
    }

    try {
      const result = await revealMessage(params);
      return {
        success: true,
        message: result.message,
        mode: result.mode
      };
    } catch (_err) {
      // Map all failures to the generic safe error string
      return {
        success: false,
        error: USER_FACING_REVEAL_ERROR
      };
    }
  });

  ipcMain.handle("abhedya:reveal-decoy", async (_event, params) => {
    const { revealDecoyMessage, USER_FACING_REVEAL_ERROR } = await import("../../core/index.js");

    if (params.imagePath) {
      validateFilePath(params.imagePath);
    }

    try {
      const result = await revealDecoyMessage(params);
      return {
        success: true,
        message: result.message,
        carrierType: result.carrierType
      };
    } catch (_err) {
      return {
        success: false,
        error: USER_FACING_REVEAL_ERROR
      };
    }
  });
}

module.exports = { registerRevealHandlers };
