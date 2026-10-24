const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { registerImageHandlers } = require("./ipc/imageHandlers.cjs");
const { registerHideHandlers } = require("./ipc/hideHandlers.cjs");
const { registerRevealHandlers } = require("./ipc/revealHandlers.cjs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 760,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  // Register secure IPC handlers connecting core engine to renderer
  registerImageHandlers(ipcMain);
  registerHideHandlers(ipcMain);
  registerRevealHandlers(ipcMain);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
