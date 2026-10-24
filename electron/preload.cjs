/**
 * Abhedya - Secure Preload Bridge
 * Exposes a narrow, restricted API via contextBridge.
 * Does NOT expose raw ipcRenderer, Node.js modules, or direct filesystem access.
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "abhedya",
  Object.freeze({
    // Application information
    getAppInfo: () =>
      Promise.resolve({
        name: "Abhedya",
        version: "0.1.0",
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        chromeVersion: process.versions.chrome,
        platform: process.platform,
        isElectron: true
      }),

    // Native file dialogs & image inspection
    selectImage: (options = {}) => ipcRenderer.invoke("image:select", options),
    inspectImage: (filePath, options = {}) => ipcRenderer.invoke("image:inspect", filePath, options),
    saveOutput: (params = {}) => ipcRenderer.invoke("image:save", params),
    showInFolder: (filePath) => ipcRenderer.invoke("image:showInFolder", filePath),

    // Steganography operations
    estimateCapacity: (params = {}) => ipcRenderer.invoke("stego:estimateCapacity", params),
    hideMessage: (params = {}) => ipcRenderer.invoke("stego:hide", params),
    revealMessage: (params = {}) => ipcRenderer.invoke("stego:reveal", params),
    analyzeImage: (params = {}) => ipcRenderer.invoke("stego:analyze", params)
  })
);
