/**
 * Abhedya Local Operation History Store
 * Tracks cryptographic operations locally in browser localStorage.
 * NEVER stores plaintext secrets, passwords, or derived keys.
 */

const STORAGE_KEY = "abhedya_operation_history";

export const historyStore = {
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  },

  addEntry({ type, fileName, fileSize, dimensions, mode, payloadBytes, status, note }) {
    try {
      const current = this.getHistory();
      const entry = {
        id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        type, // 'encode' | 'decode' | 'analysis'
        fileName: fileName || "unnamed_image.png",
        fileSize: fileSize || 0,
        dimensions: dimensions || { width: 0, height: 0 },
        mode: mode || "standard",
        payloadBytes: payloadBytes || 0,
        status: status || "success",
        note: note || ""
      };
      const updated = [entry, ...current].slice(0, 50); // keep last 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return entry;
    } catch (_err) {
      return null;
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (_err) {
      return false;
    }
  }
};
