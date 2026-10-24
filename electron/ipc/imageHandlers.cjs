// electron/ipc/imageHandlers.cjs
const { dialog } = require("electron");
const { validateFilePath } = require("../security/fileValidation.cjs");

function registerImageHandlers(ipcMain) {
  ipcMain.handle("abhedya:select-image", async () => {
    const result = await dialog.showOpenDialog({
      title: "Select Image Carrier",
      properties: ["openFile"],
      filters: [
        { name: "Supported Images", extensions: ["png", "jpg", "jpeg", "webp", "bmp", "tiff", "avif"] },
        { name: "PNG Images", extensions: ["png"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    validateFilePath(filePath);
    return { canceled: false, filePath };
  });

  ipcMain.handle("abhedya:select-save-path", async (_event, defaultName = "abhedya-encoded.png") => {
    const result = await dialog.showSaveDialog({
      title: "Save Encoded Image",
      defaultPath: defaultName,
      filters: [
        { name: "PNG Lossless Image", extensions: ["png"] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    return { canceled: false, filePath: result.filePath };
  });

  ipcMain.handle("abhedya:estimate-capacity", async (_event, options) => {
    const { estimateCapacity } = await import("../../core/index.js");
    if (options.imagePath) {
      validateFilePath(options.imagePath);
    }
    return estimateCapacity(options);
  });
}

module.exports = { registerImageHandlers };
