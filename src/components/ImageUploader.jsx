import React, { useState } from "react";
import { UploadIcon, AlertCircleIcon, ImageIcon } from "./Icons";

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
        className={`relative group cursor-pointer rounded-xl border border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center text-center overflow-hidden ${
          isDragging
            ? "border-[#c5a059] bg-[#c5a059]/5 shadow-[0_0_24px_rgba(197,160,89,0.15)]"
            : "border-white/10 hover:border-[#c5a059]/50 bg-[#0e1015]/60 hover:bg-[#14161f]/80"
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
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 group-hover:border-[#c5a059]/60 transition-colors" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20 group-hover:border-[#c5a059]/60 transition-colors" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20 group-hover:border-[#c5a059]/60 transition-colors" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 group-hover:border-[#c5a059]/60 transition-colors" />

        {/* Tactical Icon Node */}
        <div className="w-14 h-14 rounded-full bg-[#181a24] border border-white/10 flex items-center justify-center text-white/60 group-hover:text-[#c5a059] group-hover:border-[#c5a059]/40 group-hover:scale-105 transition-all duration-200 mb-4 shadow-inner">
          <UploadIcon size={24} />
        </div>

        <div className="space-y-1 mb-4">
          <p className="text-sm font-semibold tracking-wide text-zinc-100 group-hover:text-[#d8b671] transition-colors">
            {label}
          </p>
          <p className="text-xs text-zinc-400 max-w-sm">
            {sublabel}
          </p>
        </div>

        {/* Technical specs pill row */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {requirePng ? (
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-wider font-semibold rounded bg-[#c5a059]/15 text-[#e5be6b] border border-[#c5a059]/30">
              LOSSLESS PNG REQUIRED
            </span>
          ) : (
            <>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-white/5 text-zinc-300 border border-white/10">
                PNG
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-white/5 text-zinc-300 border border-white/10">
                JPEG
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-white/5 text-zinc-300 border border-white/10">
                WEBP
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-white/5 text-zinc-300 border border-white/10">
                BMP
              </span>
            </>
          )}
          <span className="px-2 py-0.5 text-[10px] font-mono text-zinc-500 rounded bg-black/30 border border-white/5">
            MAX 50MB · UP TO 8192×8192
          </span>
        </div>
      </div>

      {dragError && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-2 rounded-lg">
          <AlertCircleIcon size={14} className="shrink-0" />
          <span>{dragError}</span>
        </div>
      )}
    </div>
  );
}
