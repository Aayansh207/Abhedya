/**
 * Abhedya Frontend API Service Adapter
 * Encapsulates calls to Electron's preload bridge (window.abhedya)
 * with robust error handling and browser-friendly fallbacks for preview environments.
 */

const isElectron = typeof window !== "undefined" && Boolean(window.abhedya);

export const api = {
  isElectron,

  /**
   * Retrieves application metadata
   */
  async getAppInfo() {
    if (isElectron && window.abhedya.getAppInfo) {
      return window.abhedya.getAppInfo();
    }
    return {
      name: "Abhedya",
      version: "0.1.0",
      electronVersion: "Browser Preview",
      nodeVersion: "N/A",
      platform: typeof navigator !== "undefined" ? navigator.platform : "web",
      isElectron: false
    };
  },

  /**
   * Opens native file dialog or browser fallback to select an image
   * @param {Object} options
   * @param {boolean} [options.requirePng=false]
   */
  async selectImage(options = {}) {
    if (isElectron && window.abhedya.selectImage) {
      return window.abhedya.selectImage(options);
    }

    // Web fallback for browser testing / dev mode
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = options.requirePng ? "image/png" : "image/png,image/jpeg,image/webp,image/bmp";
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
          resolve({ canceled: true });
          return;
        }

        if (options.requirePng && !file.type.includes("png") && !file.name.endsWith(".png")) {
          resolve({
            success: false,
            error: "The encoded file must be a lossless PNG image."
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              success: true,
              filePath: file.name,
              fileName: file.name,
              fileSize: file.size,
              format: file.name.split(".").pop()?.toLowerCase() || "png",
              width: img.naturalWidth,
              height: img.naturalHeight,
              previewDataUrl: event.target.result
            });
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  },

  /**
   * Calculates steganographic capacity of selected image
   */
  async estimateCapacity(params = {}) {
    if (isElectron && window.abhedya.estimateCapacity) {
      return window.abhedya.estimateCapacity(params);
    }

    // Web mock estimation
    const { width = 1920, height = 1080 } = params;
    const totalBitsAvailable = width * height * 3;
    const totalBytes = Math.floor(totalBitsAvailable / 8);
    const maxPayloadBytes = Math.max(0, totalBytes - 64);
    return {
      success: true,
      maxPayloadBytes,
      totalBitsAvailable,
      overheadBytes: 64,
      width,
      height,
      isMockEstimate: true
    };
  },

  /**
   * Embeds encrypted message into image
   */
  async hideMessage(params = {}) {
    if (isElectron && window.abhedya.hideMessage) {
      return window.abhedya.hideMessage(params);
    }

    // Browser simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          suggestedName: `abhedya_secret_${Date.now()}.png`,
          messageBytes: new Blob([params.message || ""]).size,
          mode: params.mode || "standard",
          isMock: true
        });
      }, 700);
    });
  },

  /**
   * Extracts and decrypts hidden message from PNG
   */
  async revealMessage(params = {}) {
    if (isElectron && window.abhedya.revealMessage) {
      return window.abhedya.revealMessage(params);
    }

    // Browser simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          error:
            "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."
        });
      }, 700);
    });
  },

  /**
   * Saves encoded PNG to user's disk
   */
  async saveOutput(params = {}) {
    if (isElectron && window.abhedya.saveOutput) {
      return window.abhedya.saveOutput(params);
    }

    // Browser fallback download
    const { suggestedName = "abhedya_secret.png", dataUrl, fileData } = params;
    const downloadPayload = dataUrl || fileData;
    if (downloadPayload) {
      const a = document.createElement("a");
      a.href = downloadPayload;
      a.download = suggestedName.endsWith(".png") ? suggestedName : `${suggestedName}.png`;
      a.click();
      return { success: true, filePath: a.download };
    }
    return { success: true, filePath: suggestedName };
  },

  /**
   * Opens containing folder in native file manager
   */
  async showInFolder(filePath) {
    if (isElectron && window.abhedya.showInFolder) {
      return window.abhedya.showInFolder(filePath);
    }
    return { success: false };
  }
};
