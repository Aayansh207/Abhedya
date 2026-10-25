import React, { useState } from "react";
import { UploadIcon, AlertCircleIcon } from "./Icons";

export default function ImageUploader({
  onSelect,
  requirePng = false,
  label = "Select Carrier Image",
  sublabel = "Drop image here or click to browse filesystem"
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragError("");

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (requirePng && !file.name.toLowerCase().endsWith(".png")) {
      setDragError("The target image must be a lossless PNG file.");
      return;
    }

    const pathOrFile = file.path || file;
    if (onSelect) {
      onSelect(pathOrFile);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-6 sm:p-7 flex flex-col items-center justify-center text-center overflow-hidden ${
          isDragging
            ? "border-[var(--accent-brass)] bg-[var(--accent-brass-bg)] shadow-[0_0_16px_rgba(0,255,136,0.25)]"
            : "border-[var(--border-medium)] hover:border-[var(--accent-brass)] bg-[var(--bg-inset)] hover:bg-[var(--bg-surface-hover)]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => onSelect && onSelect()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelect && onSelect();
          }
        }}
      >
        {/* Subtle Reticle in dropzone */}
        <div className="absolute inset-0 tactical-grid-overlay opacity-30 pointer-events-none" />

        {/* Tactical Corner Markers */}
        <div className="corner-bracket-tl" />
        <div className="corner-bracket-tr" />
        <div className="corner-bracket-bl" />
        <div className="corner-bracket-br" />

        {/* Hexagonal Cyber Icon */}
        <div className="relative w-11 h-11 mb-3 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 cyber-hex bg-[var(--accent-brass)]/20 group-hover:bg-[var(--accent-brass)]/30 transition-colors" />
          <div className="absolute inset-[2px] cyber-hex bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] group-hover:border-[var(--accent-brass)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:scale-105 transition-all duration-200 shadow-sm">
            <UploadIcon size={18} />
          </div>
        </div>

        <div className="space-y-1 mb-3 relative z-10">
          <p className="text-sm font-display font-bold tracking-wider uppercase text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors">
            {label}
          </p>
          <p className="text-xs font-hud text-[var(--text-secondary)] max-w-sm">
            {sublabel}
          </p>
        </div>

        {/* Technical specs badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 relative z-10">
          {requirePng ? (
            <span className="px-2.5 py-0.5 text-[10px] font-mono-technical tracking-wider font-bold rounded bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] uppercase">
              LOSSLESS PNG REQUIRED
            </span>
          ) : (
            <>
              <span className="px-2 py-0.5 text-[9px] font-mono-technical font-semibold rounded bg-[var(--bg-surface)] text-[var(--accent-brass)] border border-[var(--border-subtle)]">
                PNG
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono-technical font-semibold rounded bg-[var(--bg-surface)] text-[var(--accent-brass)] border border-[var(--border-subtle)]">
                JPEG
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono-technical font-semibold rounded bg-[var(--bg-surface)] text-[var(--accent-brass)] border border-[var(--border-subtle)]">
                WEBP
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono-technical font-semibold rounded bg-[var(--bg-surface)] text-[var(--accent-brass)] border border-[var(--border-subtle)]">
                BMP
              </span>
            </>
          )}
          <span className="px-2 py-0.5 text-[9px] font-mono-technical text-[var(--text-muted)] rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            UP TO 50MB
          </span>
        </div>
      </div>

      {dragError && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-mono-technical text-[var(--accent-crimson-text)] bg-[var(--accent-crimson-bg)] border border-[var(--accent-crimson-border)] px-3 py-2 rounded-lg">
          <AlertCircleIcon size={14} className="shrink-0" />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
}
