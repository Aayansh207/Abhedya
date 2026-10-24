import React, { useState } from "react";
import {
  CheckIcon,
  AlertCircleIcon,
  DownloadIcon,
  CopyIcon,
  ShieldIcon,
  FolderOpenIcon,
  CheckCircle2,
  Terminal
} from "./Icons";

export default function OperationStatus({
  status, // 'idle' | 'processing' | 'success' | 'error'
  statusMessage,
  phase = "",
  error,
  output,
  onSave,
  onReset,
  type = "hide", // 'hide' | 'reveal'
  savedFilePath = null,
  onShowInFolder = null,
  saveError = null
}) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  if (status === "idle") return null;

  const handleCopyMessage = () => {
    if (output?.message) {
      navigator.clipboard.writeText(output.message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const handleCopyPath = () => {
    if (savedFilePath) {
      navigator.clipboard.writeText(savedFilePath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
  };

  return (
    <div className="w-full">
      {/* PROCESSING STATE */}
      {status === "processing" && (
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-brass-border)] shadow-md flex items-center gap-4">
          <div className="relative w-9 h-9 rounded-full border border-[var(--accent-brass-border)] flex items-center justify-center shrink-0">
            <div className="w-5 h-5 border-2 border-[var(--accent-brass)] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-mono font-semibold tracking-wider text-[var(--text-primary)] uppercase">
              {type === "hide"
                ? "Concealing Encrypted Payload..."
                : "Recovering & Authenticating Payload..."}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              {phase || "Executing cryptographic primitives and pixel channel modulation."}
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {status === "success" && (
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-jade-border)] shadow-md space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-jade-bg)] border border-[var(--accent-jade-border)] flex items-center justify-center text-[var(--accent-jade)] shrink-0 mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                {type === "hide"
                  ? "Carrier Encoding Completed Successfully"
                  : "Authenticated Message Recovered"}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {statusMessage ||
                  (type === "hide"
                    ? "Authenticated ciphertext has been embedded into lossless image pixels."
                    : "Cryptographic Poly1305 MAC tag matched ciphertext. Decrypted plaintext below.")}
              </p>
            </div>
          </div>

          {/* Decrypted Plaintext Result Card (Reveal Mode) */}
          {type === "reveal" && output?.message && (
            <div className="rounded-lg bg-[var(--bg-inset)] border border-[var(--border-medium)] overflow-hidden shadow-inner">
              <div className="px-3 py-2 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={13} className="text-[var(--accent-brass)]" />
                  <span className="text-[11px] font-mono uppercase text-[var(--text-secondary)] tracking-wider">
                    Recovered Plaintext ({output.message.length} chars)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
                >
                  {copiedMessage ? <CheckIcon size={12} className="text-[var(--accent-jade-text)]" /> : <CopyIcon size={12} />}
                  <span>{copiedMessage ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-3.5 max-h-56 overflow-y-auto">
                <pre className="text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap break-all leading-relaxed select-text">
                  {output.message}
                </pre>
              </div>
            </div>
          )}

          {/* Saved File Confirmation (Hide Mode) */}
          {savedFilePath && (
            <div className="p-3 rounded-lg bg-[var(--bg-inset)] border border-[var(--accent-jade-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <CheckIcon size={15} className="text-[var(--accent-jade)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-medium text-[var(--text-primary)] truncate">
                    Saved: {savedFilePath.split("/").pop()}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] truncate" title={savedFilePath}>
                    {savedFilePath}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="px-2 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded transition-colors"
                  title="Copy absolute path"
                >
                  {copiedPath ? "Copied" : "Copy Path"}
                </button>
                {onShowInFolder && (
                  <button
                    type="button"
                    onClick={() => onShowInFolder(savedFilePath)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[var(--accent-brass-text)] hover:text-[var(--accent-brass)] bg-[var(--accent-brass-bg)] hover:bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] rounded transition-colors"
                  >
                    <FolderOpenIcon size={12} />
                    <span>Locate</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-lg bg-[var(--accent-crimson-bg)] border border-[var(--accent-crimson-border)] text-xs text-[var(--accent-crimson-text)] flex items-center gap-2">
              <AlertCircleIcon size={14} className="shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {type === "hide" && onSave && (
              <button
                type="button"
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-[var(--accent-brass)] hover:bg-[var(--accent-brass-hover)] text-white dark:text-black transition-all shadow-sm active:scale-[0.98]"
              >
                <DownloadIcon size={14} />
                <span>{savedFilePath ? "Save Another Copy..." : "Export Lossless PNG"}</span>
              </button>
            )}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-2 text-xs font-mono font-medium rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-medium)] transition-colors"
              >
                {type === "hide" ? "Encode Another" : "Reveal Another"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {status === "error" && (
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--accent-crimson-bg)] border border-[var(--accent-crimson-border)] shadow-md space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)] shrink-0 mt-0.5">
              <AlertCircleIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Cryptographic Operation Failed
              </h4>
              <p className="text-xs text-[var(--accent-crimson-text)] mt-1 leading-relaxed">
                {error ||
                  "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg">
            <ShieldIcon size={13} className="text-[var(--accent-brass)] shrink-0" />
            <span>
              Security notice: Internal cryptographic exceptions are masked to prevent side-channel leakage.
            </span>
          </div>

          {onReset && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-1.5 text-xs font-mono rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
