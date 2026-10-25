import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Monitor } from "./Icons";

export default function ThemeSwitcher({ className = "" }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 cyber-cut-corner-sm border border-[var(--border-medium)] bg-[var(--bg-inset)] shadow-inner ${className}`}
      role="group"
      aria-label="Appearance Mode"
    >
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Dark Matrix HUD"
        aria-label="Dark Matrix HUD"
        className={`px-2.5 py-1 cyber-cut-corner-sm text-xs font-mono-technical flex items-center gap-1.5 transition-all duration-150 ${
          theme === "dark"
            ? "bg-[var(--accent-brass-bg)] text-[var(--accent-brass)] font-bold border border-[var(--accent-brass)] cyber-glow-green-sm"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
        }`}
      >
        <Moon size={12} className={theme === "dark" ? "text-[var(--accent-brass)]" : ""} />
        <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Cyber White Lab"
        aria-label="Cyber White Lab"
        className={`px-2.5 py-1 cyber-cut-corner-sm text-xs font-mono-technical flex items-center gap-1.5 transition-all duration-150 ${
          theme === "light"
            ? "bg-[var(--accent-brass-bg)] text-[var(--accent-brass)] font-bold border border-[var(--accent-brass)] cyber-glow-green-sm"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
        }`}
      >
        <Sun size={12} className={theme === "light" ? "text-[var(--accent-brass)]" : ""} />
        <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        title="System Link"
        aria-label="System Link"
        className={`px-2.5 py-1 cyber-cut-corner-sm text-xs font-mono-technical flex items-center gap-1.5 transition-all duration-150 ${
          theme === "system"
            ? "bg-[var(--accent-brass-bg)] text-[var(--accent-brass)] font-bold border border-[var(--accent-brass)] cyber-glow-green-sm"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
        }`}
      >
        <Monitor size={12} className={theme === "system" ? "text-[var(--accent-brass)]" : ""} />
        <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">Auto</span>
      </button>
    </div>
  );
}
