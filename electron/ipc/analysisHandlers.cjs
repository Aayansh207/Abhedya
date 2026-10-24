/**
 * Abhedya - Steganalysis IPC Handler
 * Validates target image and executes Chi-Square and RS Steganalysis
 * via the core engine.
 */

const { ipcMain } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { validateImageFile } = require("../security/fileValidation.cjs");

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

function registerAnalysisHandlers() {
  ipcMain.handle("stego:analyze", async (_event, params = {}) => {
    const { imagePath } = params;

    if (!imagePath || typeof imagePath !== "string") {
      return { success: false, error: "An image file path is required for steganalysis." };
    }

    const validation = validateImageFile(imagePath);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      const core = await getCoreModule();
      if (!core) {
        return { success: false, error: "Core engine module not loaded." };
      }

      const filePath = validation.details.filePath;
      const [chiSquareResult, rsResult] = await Promise.all([
        core.analyzeChiSquare(filePath),
        core.analyzeRS(filePath)
      ]);

      return {
        success: true,
        filePath,
        fileName: validation.details.fileName,
        dimensions: validation.details.dimensions,
        chiSquare: chiSquareResult,
        rsAnalysis: rsResult
      };
    } catch (err) {
      return {
        success: false,
        error: "Failed to perform statistical steganalysis on this image."
      };
    }
  });
}

module.exports = { registerAnalysisHandlers };
