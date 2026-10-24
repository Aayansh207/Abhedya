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
        className={`relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-7 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden ${
          isDragging
            ? "border-[var(--accent-brass)] bg-[var(--accent-brass-bg)] shadow-md"
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
        {/* Subtle tactical corner markers */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--border-strong)] group-hover:border-[var(--accent-brass)] transition-colors pointer-events-none" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[var(--border-strong)] group-hover:border-[var(--accent-brass)] transition-colors pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[var(--border-strong)] group-hover:border-[var(--accent-brass)] transition-colors pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--border-strong)] group-hover:border-[var(--accent-brass)] transition-colors pointer-events-none" />

        {/* Tactical Icon Node */}
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-brass)] group-hover:border-[var(--accent-brass-border)] group-hover:scale-105 transition-all duration-200 mb-3.5 shadow-sm">
          <UploadIcon size={22} />
        </div>

        <div className="space-y-1 mb-3.5">
          <p className="text-sm font-semibold tracking-wide text-[var(--text-primary)] group-hover:text-[var(--accent-brass)] transition-colors">
            {label}
          </p>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm">
            {sublabel}
          </p>
        </div>

        {/* Technical specs pill row */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {requirePng ? (
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-wider font-semibold rounded bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)]">
              LOSSLESS PNG REQUIRED
            </span>
          ) : (
            <>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                PNG
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                JPEG
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                WEBP
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                BMP
              </span>
            </>
          )}
          <span className="px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            MAX 50MB · UP TO 8192×8192
          </span>
        </div>
      </div>

      {dragError && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-[var(--accent-crimson-text)] bg-[var(--accent-crimson-bg)] border border-[var(--accent-crimson-border)] px-3 py-2 rounded-lg">
          <AlertCircleIcon size={14} className="shrink-0" />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
}
