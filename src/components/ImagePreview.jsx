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
    <div className="w-full glass-panel overflow-hidden border border-white/10 rounded-xl bg-[#0f1118]/80 shadow-2xl">
      {/* HUD Header Bar */}
      <div className="px-4 py-2.5 bg-[#141620] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <CrosshairIcon size={14} className="text-[#c5a059] shrink-0" />
          <span className="text-xs font-mono font-medium tracking-wider text-zinc-300 uppercase truncate">
            {title}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c5a059]/20 text-[#e5be6b] border border-[#c5a059]/30 uppercase shrink-0">
            {format || "IMG"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onChange && (
            <button
              type="button"
              onClick={onChange}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-colors"
              title="Replace image"
            >
              <RefreshIcon size={12} />
              <span>Change</span>
            </button>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 rounded-md border border-rose-500/20 transition-colors"
              title="Remove image"
            >
              <TrashIcon size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage with Tactical HUD Reticle */}
      <div className="relative bg-[#07080c] min-h-[200px] max-h-[340px] flex items-center justify-center p-4 overflow-hidden tactical-grid-overlay">
        {/* Corner HUD Markers */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#c5a059]/40 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#c5a059]/40 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#c5a059]/40 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#c5a059]/40 pointer-events-none" />

        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt={fileName || "Selected preview"}
            className="max-h-[300px] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-white/5"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600 gap-2 py-10">
            <ImageIcon size={44} />
            <span className="text-xs font-mono">NO RENDER PREVIEW</span>
          </div>
        )}

        {/* Live HUD Floating Tag */}
        {width && height && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded text-[11px] font-mono text-zinc-300">
            {width} × {height}
          </div>
        )}
      </div>

      {/* Technical Metadata Matrix */}
      <div className="grid grid-cols-3 divide-x divide-white/5 bg-[#12141d] border-t border-white/5 text-xs">
        <div className="p-3">
          <span className="block text-[10px] font-mono uppercase text-zinc-500 mb-0.5">
            Dimensions
          </span>
          <span className="font-mono font-medium text-zinc-200">
            {width && height ? `${width} × ${height} px` : "Inspecting..."}
          </span>
        </div>

        <div className="p-3">
          <span className="block text-[10px] font-mono uppercase text-zinc-500 mb-0.5">
            File Size
          </span>
          <span className="font-mono font-medium text-zinc-200">
            {formatBytes(fileSize)}
          </span>
        </div>

        <div className="p-3">
          <span className="block text-[10px] font-mono uppercase text-zinc-500 mb-0.5">
            Discrete Pixels
          </span>
          <span className="font-mono font-medium text-zinc-200">
            {totalPixels ? `${totalPixels.toLocaleString()} px` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
