import React from "react";
import { ImageIcon, TrashIcon, RefreshIcon, CrosshairIcon } from "./Icons";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function ImagePreview({ image, onClear, onChange, title = "Carrier Image" }) {
  if (!image) return null;

  const { fileName, fileSize, width, height, format, previewDataUrl } = image;
  const totalPixels = width && height ? width * height : null;

  return (
    <div className="w-full glass-panel overflow-hidden border border-[var(--border-strong)] rounded-xl shadow-md relative">
      {/* HUD Header Bar */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-inset)] border-b border-[var(--border-medium)] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <CrosshairIcon size={14} className="text-[var(--accent-brass)] shrink-0" />
          <span className="text-xs font-display font-bold tracking-wider text-[var(--text-primary)] uppercase truncate">
            {title}
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono-technical font-bold bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] uppercase shrink-0">
            {format || "IMG"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onChange && (
            <button
              type="button"
              onClick={onChange}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-technical text-[var(--text-secondary)] hover:text-[var(--accent-brass)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded border border-[var(--border-medium)] transition-colors cursor-pointer"
              title="Replace image"
            >
              <RefreshIcon size={11} />
              <span>Change</span>
            </button>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-technical text-[var(--accent-crimson-text)] bg-[var(--accent-crimson-bg)] hover:bg-[var(--accent-crimson-bg)] rounded border border-[var(--accent-crimson-border)] transition-colors cursor-pointer"
              title="Remove image"
            >
              <TrashIcon size={11} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage with Tactical HUD Reticle */}
      <div className="relative bg-[var(--bg-inset)] min-h-[190px] max-h-[280px] flex items-center justify-center p-3.5 overflow-hidden tactical-grid-overlay">
        <div className="corner-bracket-tl" />
        <div className="corner-bracket-tr" />
        <div className="corner-bracket-bl" />
        <div className="corner-bracket-br" />

        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt={fileName || "Selected preview"}
            className="max-h-[240px] w-auto max-w-full object-contain rounded shadow-sm border border-[var(--border-medium)]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[var(--text-muted)] gap-2 py-8">
            <ImageIcon size={36} className="text-[var(--text-dim)]" />
            <span className="text-xs font-mono-technical">NO PREVIEW AVAILABLE</span>
          </div>
        )}

        {/* Live HUD Floating Dimension Tag */}
        {width && height && (
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-[var(--bg-inset)]/90 backdrop-blur-md border border-[var(--border-strong)] rounded text-[10px] font-mono-technical text-[var(--accent-brass)] shadow-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)]" />
            <span>{width} × {height} PX</span>
          </div>
        )}
      </div>

      {/* Technical Metadata Matrix */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border-medium)] bg-[var(--bg-surface)] border-t border-[var(--border-medium)] text-xs">
        <div className="p-2.5 sm:p-3 min-w-0">
          <span className="block text-[9px] font-mono-technical uppercase text-[var(--text-muted)] mb-0.5 truncate tracking-wider">
            DIMENSIONS
          </span>
          <span className="font-mono-technical font-bold text-[var(--text-primary)] text-xs truncate block">
            {width && height ? `${width} × ${height}` : "Inspecting..."}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 min-w-0">
          <span className="block text-[9px] font-mono-technical uppercase text-[var(--text-muted)] mb-0.5 truncate tracking-wider">
            FILE SIZE
          </span>
          <span className="font-mono-technical font-bold text-[var(--text-primary)] text-xs truncate block">
            {formatBytes(fileSize)}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 min-w-0">
          <span className="block text-[9px] font-mono-technical uppercase text-[var(--text-muted)] mb-0.5 truncate tracking-wider">
            PIXEL MATRIX
          </span>
          <span className="font-mono-technical font-bold text-[var(--accent-brass)] text-xs truncate block">
            {totalPixels ? `${totalPixels.toLocaleString()} PX` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
