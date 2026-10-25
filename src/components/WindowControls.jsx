import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Minus, Square, X } from "./Icons";

export default function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (api.isElectron) {
      api.windowControl.isMaximized().then(setIsMaximized).catch(() => {});
    }
  }, []);

  const handleMinimize = () => {
    if (api.isElectron) {
      api.windowControl.minimize();
    }
  };

  const handleMaximize = async () => {
    if (api.isElectron) {
      const state = await api.windowControl.maximize();
      setIsMaximized(Boolean(state));
    }
  };

  const handleClose = () => {
    if (api.isElectron) {
      api.windowControl.close();
    }
  };

  return (
    <div className="flex items-center gap-1 app-no-drag">
      <button
        type="button"
        onClick={handleMinimize}
        title="Minimize window"
        aria-label="Minimize window"
        className="w-7 h-7 cyber-cut-corner-sm flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-brass)] hover:bg-[var(--accent-brass-bg)] hover:border hover:border-[var(--accent-brass)] active:scale-95 transition-all app-no-drag cursor-pointer"
      >
        <Minus size={13} />
      </button>

      <button
        type="button"
        onClick={handleMaximize}
        title={isMaximized ? "Restore window" : "Maximize window"}
        aria-label={isMaximized ? "Restore window" : "Maximize window"}
        className="w-7 h-7 cyber-cut-corner-sm flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-brass)] hover:bg-[var(--accent-brass-bg)] hover:border hover:border-[var(--accent-brass)] active:scale-95 transition-all app-no-drag cursor-pointer"
      >
        <Square size={11} />
      </button>

      <button
        type="button"
        onClick={handleClose}
        title="Close window"
        aria-label="Close window"
        className="w-7 h-7 cyber-cut-corner-sm flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--accent-crimson)] hover:border hover:border-[var(--accent-crimson)] active:scale-95 transition-all app-no-drag cursor-pointer"
      >
        <X size={13} />
      </button>
    </div>
  );
}
