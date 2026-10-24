const { contextBridge } = require("electron");

// Keep this API narrow. Add methods only when their IPC handlers exist.
contextBridge.exposeInMainWorld("abhedya", Object.freeze({
  appVersion: () => "0.1.0"
}));
