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
    <div className="w-full glass-panel overflow-hidden border border-[var(--border-subtle)] rounded-xl shadow-md">
      {/* HUD Header Bar */}
      <div className="px-4 py-2.5 bg-[var(--bg-inset)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <CrosshairIcon size={14} className="text-[var(--accent-brass)] shrink-0" />
          <span className="text-xs font-mono font-medium tracking-wider text-[var(--text-primary)] uppercase truncate">
            {title}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] uppercase shrink-0">
            {format || "IMG"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onChange && (
            <button
              type="button"
              onClick={onChange}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] rounded-md border border-[var(--border-subtle)] transition-colors"
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
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[var(--accent-crimson-text)] bg-[var(--accent-crimson-bg)] hover:bg-[var(--accent-crimson-bg)] rounded-md border border-[var(--accent-crimson-border)] transition-colors"
              title="Remove image"
            >
              <TrashIcon size={11} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage with Tactical HUD Reticle */}
      <div className="relative bg-[var(--bg-inset)] min-h-[180px] max-h-[300px] flex items-center justify-center p-3.5 overflow-hidden tactical-grid-overlay">
        {/* Corner HUD Markers */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[var(--accent-brass-border)] pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[var(--accent-brass-border)] pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[var(--accent-brass-border)] pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[var(--accent-brass-border)] pointer-events-none" />

        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt={fileName || "Selected preview"}
            className="max-h-[260px] w-auto max-w-full object-contain rounded-lg shadow-sm border border-[var(--border-subtle)]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[var(--text-muted)] gap-2 py-8">
            <ImageIcon size={40} />
            <span className="text-xs font-mono">NO RENDER PREVIEW</span>
          </div>
        )}

        {/* Live HUD Floating Tag */}
        {width && height && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] rounded text-[10px] font-mono text-[var(--text-secondary)]">
            {width} × {height}
          </div>
        )}
      </div>

      {/* Technical Metadata Matrix */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] text-xs">
        <div className="p-2.5 sm:p-3 min-w-0">
          <span className="block text-[9px] font-mono uppercase text-[var(--text-muted)] mb-0.5 truncate">
            Dimensions
          </span>
          <span className="font-mono font-medium text-[var(--text-primary)] text-xs truncate block">
            {width && height ? `${width} × ${height} px` : "Inspecting..."}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 min-w-0">
          <span className="block text-[9px] font-mono uppercase text-[var(--text-muted)] mb-0.5 truncate">
            File Size
          </span>
          <span className="font-mono font-medium text-[var(--text-primary)] text-xs truncate block">
            {formatBytes(fileSize)}
          </span>
        </div>

        <div className="p-2.5 sm:p-3 min-w-0">
          <span className="block text-[9px] font-mono uppercase text-[var(--text-muted)] mb-0.5 truncate">
            Discrete Pixels
          </span>
          <span className="font-mono font-medium text-[var(--text-primary)] text-xs truncate block">
            {totalPixels ? `${totalPixels.toLocaleString()} px` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
