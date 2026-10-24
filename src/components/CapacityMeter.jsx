import React from "react";
import { CheckIcon, AlertCircleIcon, ActivityIcon, Layers } from "./Icons";

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "0 B";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function CapacityMeter({
  messageBytes = 0,
  maxPayloadBytes = 0,
  overheadBytes = 64,
  isLoading = false
}) {
  const safeMax = Math.max(0, maxPayloadBytes);
  const fits = safeMax > 0 && messageBytes <= safeMax;
  const isOversized = safeMax > 0 && messageBytes > safeMax;
  const percentage = safeMax > 0 ? Math.min(100, (messageBytes / safeMax) * 100) : 0;

  // Gauge bar color
  let barColorClass = "bg-[#10b981]";
  let textColorClass = "text-[#34d399]";
  if (isOversized || percentage > 90) {
    barColorClass = "bg-rose-500";
    textColorClass = "text-rose-400";
  } else if (percentage > 70) {
    barColorClass = "bg-amber-500";
    textColorClass = "text-amber-400";
  }

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-[#0f1118]/80 border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ActivityIcon size={14} className="text-[#c5a059] animate-spin" />
            <span>Calculating Carrier Payload Capacity...</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#c5a059]/50 w-1/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isOversized
        ? "bg-rose-950/20 border-rose-800/40"
        : "bg-[#0f1118]/85 border-white/10"
    }`}>
      {/* Header telemetry */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ActivityIcon size={14} className="text-[#c5a059]" />
          <span className="text-xs font-mono font-medium tracking-wide text-zinc-200">
            PAYLOAD ALLOCATION
          </span>
        </div>

        <div>
          {messageBytes === 0 ? (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 text-zinc-400 border border-white/10">
              IDLE
            </span>
          ) : fits ? (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30 flex items-center gap-1 font-semibold">
              <CheckIcon size={11} /> FITS CARRIER
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-semibold">
              <AlertCircleIcon size={11} /> OVERSIZED
            </span>
          )}
        </div>
      </div>

      {/* Numerical readout */}
      <div className="flex items-baseline justify-between text-xs font-mono mb-2">
        <span className="text-zinc-400">
          <strong className="text-zinc-100 font-semibold">{formatBytes(messageBytes)}</strong> consumed
        </span>
        <span className="text-zinc-500">
          Max: <span className="text-zinc-300 font-medium">{formatBytes(safeMax)}</span>
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full bg-[#0a0c10] border border-white/5 rounded-full overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
          style={{ width: `${Math.max(percentage, messageBytes > 0 ? 2 : 0)}%` }}
        />
      </div>

      {/* Sub-telemetry breakdown */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span className={textColorClass}>
          {percentage.toFixed(1)}% utilized
        </span>
        <span className="text-[10px] text-zinc-500">
          Header: ~{overheadBytes}B (Salt, IV, Poly1305 MAC)
        </span>
      </div>

      {isOversized && (
        <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-lg flex items-start gap-2 text-xs text-rose-300">
          <AlertCircleIcon size={15} className="text-rose-400 shrink-0 mt-0.5" />
          <span>
            Payload exceeds carrier limits by {formatBytes(messageBytes - safeMax)}. Shorten text or select a higher-resolution image.
          </span>
        </div>
      )}
    </div>
  );
}
