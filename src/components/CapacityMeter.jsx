import React from "react";
import { CheckIcon, AlertCircleIcon, ActivityIcon } from "./Icons";

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
  let barColorClass = "bg-[var(--accent-brass)] shadow-[0_0_10px_var(--accent-brass)]";
  let textColorClass = "text-[var(--accent-brass-text)]";
  if (isOversized || percentage > 90) {
    barColorClass = "bg-[var(--accent-crimson)] shadow-[0_0_10px_var(--accent-crimson)]";
    textColorClass = "text-[var(--accent-crimson-text)]";
  } else if (percentage > 70) {
    barColorClass = "bg-[var(--accent-amber)] shadow-[0_0_10px_var(--accent-amber)]";
    textColorClass = "text-[var(--accent-amber-text)]";
  }

  if (isLoading) {
    return (
      <div className="p-4 cyber-cut-corner bg-[var(--bg-surface)] border border-[var(--border-medium)] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono-technical text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <ActivityIcon size={14} className="text-[var(--accent-brass)] animate-spin" />
            <span className="uppercase">Calculating Carrier Payload Capacity...</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-inset)] cyber-cut-corner-sm overflow-hidden border border-[var(--border-subtle)]">
          <div className="h-full bg-[var(--accent-brass)] w-1/3 animate-pulse shadow-[0_0_8px_var(--accent-brass)]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 cyber-cut-corner border transition-all ${
      isOversized
        ? "bg-[var(--accent-crimson-bg)] border-[var(--accent-crimson-border)]"
        : "bg-[var(--bg-surface)] border-[var(--border-strong)]"
    }`}>
      {/* Header telemetry */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ActivityIcon size={13} className="text-[var(--accent-brass)]" />
          <span className="text-xs font-display font-bold tracking-wider text-[var(--text-primary)] uppercase">
            PAYLOAD ALLOCATION
          </span>
        </div>

        <div>
          {messageBytes === 0 ? (
            <span className="px-2 py-0.5 text-[10px] font-mono-technical cyber-cut-corner-sm bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-bold uppercase">
              BUFFER IDLE
            </span>
          ) : fits ? (
            <span className="px-2 py-0.5 text-[10px] font-mono-technical cyber-cut-corner-sm bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] flex items-center gap-1 font-bold uppercase cyber-glow-green-sm">
              <CheckIcon size={11} /> FITS VESSEL
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-mono-technical cyber-cut-corner-sm bg-[var(--accent-crimson-bg)] text-[var(--accent-crimson-text)] border border-[var(--accent-crimson-border)] flex items-center gap-1 font-bold uppercase cyber-glow-red">
              <AlertCircleIcon size={11} /> OVERSIZED
            </span>
          )}
        </div>
      </div>

      {/* Numerical readout */}
      <div className="flex items-baseline justify-between text-xs font-mono-technical mb-2">
        <span className="text-[var(--text-secondary)]">
          CONSUMED: <strong className="text-[var(--text-primary)] font-bold">{formatBytes(messageBytes)}</strong>
        </span>
        <span className="text-[var(--text-muted)]">
          MAX CEILING: <span className="text-[var(--accent-brass)] font-bold">{formatBytes(safeMax)}</span>
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2.5 w-full bg-[var(--bg-inset)] cyber-cut-corner-sm border border-[var(--border-subtle)] overflow-hidden p-[1px]">
        <div
          className={`h-full transition-all duration-300 rounded-[1px] ${barColorClass}`}
          style={{ width: `${Math.max(percentage, messageBytes > 0 ? 2 : 0)}%` }}
        />
      </div>

      {/* Sub-telemetry breakdown */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono-technical text-[var(--text-muted)]">
        <span className={`font-bold ${textColorClass}`}>
          {percentage.toFixed(1)}% ALLOCATED
        </span>
        <span>
          HEADER OVERHEAD: ~{overheadBytes}B (SALT, NONCE, MAC)
        </span>
      </div>

      {isOversized && (
        <div className="mt-3 p-2.5 bg-[var(--bg-inset)] border border-[var(--accent-crimson-border)] cyber-cut-corner-sm flex items-start gap-2 text-xs font-mono-technical text-[var(--accent-crimson-text)]">
          <AlertCircleIcon size={14} className="shrink-0 mt-0.5" />
          <span>
            Payload exceeds carrier capacity by {formatBytes(messageBytes - safeMax)}. Shorten text or select a higher-resolution image.
          </span>
        </div>
      )}
    </div>
  );
}
