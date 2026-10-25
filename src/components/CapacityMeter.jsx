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

  let barColorClass = "bg-[var(--accent-brass)] shadow-[0_0_8px_var(--accent-brass)]";
  let textColorClass = "text-[var(--accent-brass-text)]";
  if (isOversized || percentage > 90) {
    barColorClass = "bg-[var(--accent-crimson)] shadow-[0_0_8px_var(--accent-crimson)]";
    textColorClass = "text-[var(--accent-crimson-text)]";
  } else if (percentage > 70) {
    barColorClass = "bg-[var(--accent-amber)] shadow-[0_0_8px_var(--accent-amber)]";
    textColorClass = "text-[var(--accent-amber-text)]";
  }

  if (isLoading) {
    return (
      <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-medium)] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono-technical text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <ActivityIcon size={14} className="text-[var(--accent-brass)] animate-spin" />
            <span>Calculating Carrier Payload Capacity...</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-inset)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div className="h-full bg-[var(--accent-brass)] w-1/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
      isOversized
        ? "bg-[var(--accent-crimson-bg)] border-[var(--accent-crimson-border)]"
        : "bg-[var(--bg-surface)] border-[var(--border-medium)]"
    }`}>
      {/* Header telemetry */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ActivityIcon size={13} className="text-[var(--accent-brass)]" />
          <span className="text-xs font-mono-technical font-bold tracking-wide text-[var(--text-primary)] uppercase">
            PAYLOAD ALLOCATION
          </span>
        </div>

        <div>
          {messageBytes === 0 ? (
            <span className="px-2 py-0.5 text-[9px] font-mono-technical rounded bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-bold uppercase">
              BUFFER IDLE
            </span>
          ) : fits ? (
            <span className="px-2 py-0.5 text-[9px] font-mono-technical rounded bg-[var(--accent-brass-bg)] text-[var(--accent-brass-text)] border border-[var(--accent-brass-border)] flex items-center gap-1 font-bold uppercase">
              <CheckIcon size={11} /> FITS VESSEL
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[9px] font-mono-technical rounded bg-[var(--accent-crimson-bg)] text-[var(--accent-crimson-text)] border border-[var(--accent-crimson-border)] flex items-center gap-1 font-bold uppercase">
              <AlertCircleIcon size={11} /> OVERSIZED
            </span>
          )}
        </div>
      </div>

      {/* Numerical readout */}
      <div className="flex items-baseline justify-between text-xs font-mono-technical mb-2">
        <span className="text-[var(--text-secondary)]">
          Consumed: <strong className="text-[var(--text-primary)] font-bold">{formatBytes(messageBytes)}</strong>
        </span>
        <span className="text-[var(--text-muted)]">
          Max: <span className="text-[var(--accent-brass)] font-bold">{formatBytes(safeMax)}</span>
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full bg-[var(--bg-inset)] rounded-full border border-[var(--border-subtle)] overflow-hidden p-[1px]">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColorClass}`}
          style={{ width: `${Math.max(percentage, messageBytes > 0 ? 2 : 0)}%` }}
        />
      </div>

      {/* Sub-telemetry breakdown */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono-technical text-[var(--text-muted)]">
        <span className={`font-semibold ${textColorClass}`}>
          {percentage.toFixed(1)}% utilized
        </span>
        <span>
          Header: ~{overheadBytes}B (Salt, Nonce, MAC)
        </span>
      </div>

      {isOversized && (
        <div className="mt-2.5 p-2 rounded-lg bg-[var(--bg-inset)] border border-[var(--accent-crimson-border)] flex items-start gap-2 text-xs font-mono-technical text-[var(--accent-crimson-text)]">
          <AlertCircleIcon size={13} className="shrink-0 mt-0.5" />
          <span>
            Payload exceeds carrier capacity by {formatBytes(messageBytes - safeMax)}. Shorten text or select a higher-resolution image.
          </span>
        </div>
      )}
    </div>
  );
}
