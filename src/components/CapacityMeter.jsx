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
  let barColorClass = "bg-[var(--accent-jade)]";
  let textColorClass = "text-[var(--accent-jade-text)]";
  if (isOversized || percentage > 90) {
    barColorClass = "bg-[var(--accent-crimson)]";
    textColorClass = "text-[var(--accent-crimson-text)]";
  } else if (percentage > 70) {
    barColorClass = "bg-[var(--accent-amber)]";
    textColorClass = "text-[var(--accent-amber-text)]";
  }

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <ActivityIcon size={14} className="text-[var(--accent-brass)] animate-spin" />
            <span>Calculating Carrier Payload Capacity...</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-inset)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent-brass)]/50 w-1/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isOversized
        ? "bg-[var(--accent-crimson-bg)] border-[var(--accent-crimson-border)]"
        : "bg-[var(--bg-surface)] border-[var(--border-subtle)]"
    }`}>
      {/* Header telemetry */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ActivityIcon size={13} className="text-[var(--accent-brass)]" />
          <span className="text-xs font-mono font-medium tracking-wide text-[var(--text-primary)]">
            PAYLOAD ALLOCATION
          </span>
        </div>

        <div>
          {messageBytes === 0 ? (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-semibold">
              IDLE
            </span>
          ) : fits ? (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--accent-jade-bg)] text-[var(--accent-jade-text)] border border-[var(--accent-jade-border)] flex items-center gap-1 font-semibold">
              <CheckIcon size={11} /> FITS CARRIER
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[var(--accent-crimson-bg)] text-[var(--accent-crimson-text)] border border-[var(--accent-crimson-border)] flex items-center gap-1 font-semibold">
              <AlertCircleIcon size={11} /> OVERSIZED
            </span>
          )}
        </div>
      </div>

      {/* Numerical readout */}
      <div className="flex items-baseline justify-between text-xs font-mono mb-2">
        <span className="text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)] font-semibold">{formatBytes(messageBytes)}</strong> consumed
        </span>
        <span className="text-[var(--text-muted)]">
          Max: <span className="text-[var(--text-primary)] font-medium">{formatBytes(safeMax)}</span>
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full bg-[var(--bg-inset)] border border-[var(--border-subtle)] rounded-full overflow-hidden p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
          style={{ width: `${Math.max(percentage, messageBytes > 0 ? 2 : 0)}%` }}
        />
      </div>

      {/* Sub-telemetry breakdown */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
        <span className={textColorClass}>
          {percentage.toFixed(1)}% utilized
        </span>
        <span className="text-[10px]">
          Header: ~{overheadBytes}B (Salt, IV, Poly1305 MAC)
        </span>
      </div>

      {isOversized && (
        <div className="mt-3 p-2.5 bg-[var(--bg-surface)] border border-[var(--accent-crimson-border)] rounded-lg flex items-start gap-2 text-xs text-[var(--accent-crimson-text)]">
          <AlertCircleIcon size={14} className="shrink-0 mt-0.5" />
          <span>
            Payload exceeds carrier capacity by {formatBytes(messageBytes - safeMax)}. Shorten text or select a higher-resolution image.
          </span>
        </div>
      )}
    </div>
  );
}
