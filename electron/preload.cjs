// electron/preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("abhedya", Object.freeze({
  appVersion: () => "0.1.0",
  selectImage: () => ipcRenderer.invoke("abhedya:select-image"),
  selectSavePath: (defaultName) => ipcRenderer.invoke("abhedya:select-save-path", defaultName),
  estimateCapacity: (options) => ipcRenderer.invoke("abhedya:estimate-capacity", options),
  hideMessage: (params) => ipcRenderer.invoke("abhedya:hide-message", params),
  revealMessage: (params) => ipcRenderer.invoke("abhedya:reveal-message", params),
  hideDecoy: (params) => ipcRenderer.invoke("abhedya:hide-decoy", params),
  revealDecoy: (params) => ipcRenderer.invoke("abhedya:reveal-decoy", params)
}));
