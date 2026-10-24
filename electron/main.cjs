/**
 * Abhedya - Electron Main Process Entry
 * Creates the application window with a hardened security posture and
 * registers validated IPC handlers for file operations and steganography.
 */

const { app, BrowserWindow, session, ipcMain } = require("electron");
const path = require("node:path");
const { registerImageHandlers } = require("./ipc/imageHandlers.cjs");
const { registerHideHandlers } = require("./ipc/hideHandlers.cjs");
const { registerRevealHandlers } = require("./ipc/revealHandlers.cjs");
const { registerAnalysisHandlers } = require("./ipc/analysisHandlers.cjs");

function registerWindowControlHandlers(getMainWindow) {
  ipcMain.handle("window:minimize", () => {
    const win = getMainWindow();
    if (win) win.minimize();
  });
  ipcMain.handle("window:maximize", () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
        return false;
      } else {
        win.maximize();
        return true;
      }
    }
    return false;
  });
  ipcMain.handle("window:close", () => {
    const win = getMainWindow();
    if (win) win.close();
  });
  ipcMain.handle("window:isMaximized", () => {
    const win = getMainWindow();
    return win ? win.isMaximized() : false;
  });
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 840,
    minWidth: 840,
    minHeight: 640,
    backgroundColor: "#0d0d15",
    title: "Abhedya — The Vishanti Cipher",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Allows preload to access contextBridge and safe Node APIs while renderer stays completely isolated
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Security: Prevent renderer from opening new popups or arbitrary windows
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  // Security: Restrict navigation away from the application
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const isLocalDev = process.env.VITE_DEV_SERVER_URL && url.startsWith(process.env.VITE_DEV_SERVER_URL);
    const isLocalFile = url.startsWith("file://");
    if (!isLocalDev && !isLocalFile) {
      event.preventDefault();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Set Content Security Policy for additional defense in depth
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' data: blob:; img-src 'self' data: blob:;"
        ]
      }
    });
  });

  // Register all validated IPC handlers
  registerImageHandlers(() => mainWindow);
  registerHideHandlers();
  registerRevealHandlers();
  registerAnalysisHandlers();
  registerWindowControlHandlers(() => mainWindow);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
