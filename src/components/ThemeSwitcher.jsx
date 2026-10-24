import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Monitor } from "./Icons";

export default function ThemeSwitcher({ className = "" }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inset)] shadow-inner ${className}`}
      role="group"
      aria-label="Appearance Mode"
    >
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Dark theme"
        aria-label="Dark theme"
        className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all duration-150 ${
          theme === "dark"
            ? "bg-[var(--bg-surface-elevated)] text-[var(--accent-brass)] font-semibold shadow-sm border border-[var(--border-medium)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
        }`}
      >
        <Moon size={12} />
        <span className="hidden sm:inline text-[11px]">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Light theme"
        aria-label="Light theme"
        className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all duration-150 ${
          theme === "light"
            ? "bg-[var(--bg-surface-elevated)] text-[var(--accent-brass)] font-semibold shadow-sm border border-[var(--border-medium)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
        }`}
      >
        <Sun size={12} />
        <span className="hidden sm:inline text-[11px]">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        title="System theme"
        aria-label="System theme"
        className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all duration-150 ${
          theme === "system"
            ? "bg-[var(--bg-surface-elevated)] text-[var(--accent-brass)] font-semibold shadow-sm border border-[var(--border-medium)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
        }`}
      >
        <Monitor size={12} />
        <span className="hidden sm:inline text-[11px]">System</span>
      </button>
    </div>
  );
}
