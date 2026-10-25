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
  status,
  statusMessage,
  phase = "",
  error,
  output,
  onSave,
  onReset,
  type = "hide",
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
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-brass)] shadow-md flex items-center gap-4">
          <div className="relative w-9 h-9 cyber-hex bg-[var(--bg-inset)] border border-[var(--accent-brass)] flex items-center justify-center shrink-0">
            <div className="w-5 h-5 border-2 border-[var(--accent-brass)] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-display font-bold tracking-wider text-[var(--accent-brass)] uppercase cyber-text-glow truncate">
              {type === "hide"
                ? "Concealing Encrypted Payload..."
                : "Authenticating & Decrypting..."}
            </h4>
            <p className="text-xs font-mono-technical text-[var(--text-secondary)]">
              {phase || "Executing cryptographic primitives and pixel channel modulation."}
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {status === "success" && (
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border-2 border-[var(--accent-brass)] shadow-[0_0_20px_rgba(0,255,136,0.15)] space-y-3.5 relative">
          <div className="corner-bracket-tl" />
          <div className="corner-bracket-tr" />
          <div className="corner-bracket-bl" />
          <div className="corner-bracket-br" />

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 cyber-hex bg-[var(--accent-brass-bg)] border border-[var(--accent-brass)] flex items-center justify-center text-[var(--accent-brass)] shrink-0 mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-display font-bold text-[var(--text-primary)] uppercase tracking-wider cyber-text-glow">
                {type === "hide"
                  ? "Carrier Encoding Completed"
                  : "Authenticated Message Recovered"}
              </h4>
              <p className="text-xs font-hud text-[var(--text-secondary)] mt-0.5">
                {statusMessage ||
                  (type === "hide"
                    ? "Authenticated ciphertext has been embedded into lossless image pixels."
                    : "Poly1305 MAC tag verified successfully. Decrypted plaintext below.")}
              </p>
            </div>
          </div>

          {/* Decrypted Plaintext Result Card (Reveal Mode) */}
          {type === "reveal" && output?.message && (
            <div className="rounded-lg bg-[var(--bg-inset)] border border-[var(--border-strong)] overflow-hidden shadow-inner">
              <div className="px-3.5 py-2 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-medium)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={13} className="text-[var(--accent-brass)]" />
                  <span className="text-[10px] font-mono-technical uppercase text-[var(--text-secondary)] tracking-wider">
                    RECOVERED PLAINTEXT ({output.message.length} CHARS)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-technical rounded bg-[var(--bg-surface)] hover:bg-[var(--accent-brass-bg)] text-[var(--accent-brass)] border border-[var(--accent-brass-border)] transition-colors cursor-pointer"
                >
                  {copiedMessage ? <CheckIcon size={12} className="text-[var(--accent-brass)]" /> : <CopyIcon size={12} />}
                  <span className="font-bold">{copiedMessage ? "COPIED" : "COPY"}</span>
                </button>
              </div>
              <div className="p-3.5 max-h-56 overflow-y-auto font-mono-technical">
                <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap break-all leading-relaxed select-text">
                  {output.message}
                </pre>
              </div>
            </div>
          )}

          {/* Saved File Confirmation (Hide Mode) */}
          {savedFilePath && (
            <div className="p-3 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-strong)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckIcon size={15} className="text-[var(--accent-brass)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-mono-technical font-bold text-[var(--text-primary)] truncate">
                    Saved: {savedFilePath.split("/").pop()}
                  </p>
                  <p className="text-[10px] font-mono-technical text-[var(--text-muted)] truncate" title={savedFilePath}>
                    {savedFilePath}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="px-2.5 py-1 text-xs font-mono-technical text-[var(--text-secondary)] hover:text-[var(--accent-brass)] bg-[var(--bg-surface)] rounded border border-[var(--border-medium)] transition-colors cursor-pointer"
                  title="Copy absolute path"
                >
                  {copiedPath ? "COPIED" : "COPY PATH"}
                </button>
                {onShowInFolder && (
                  <button
                    type="button"
                    onClick={() => onShowInFolder(savedFilePath)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono-technical text-[var(--accent-brass)] bg-[var(--accent-brass-bg)] border border-[var(--accent-brass)] rounded transition-colors cursor-pointer"
                  >
                    <FolderOpenIcon size={12} />
                    <span className="font-bold">LOCATE</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-lg bg-[var(--accent-crimson-bg)] border border-[var(--accent-crimson-border)] text-xs font-mono-technical text-[var(--accent-crimson-text)] flex items-center gap-2">
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
                className="cyber-btn-primary py-2 px-4 text-xs flex items-center gap-2 cursor-pointer"
              >
                <DownloadIcon size={14} />
                <span>{savedFilePath ? "SAVE ANOTHER COPY..." : "EXPORT LOSSLESS PNG"}</span>
              </button>
            )}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-2 text-xs font-mono-technical font-bold uppercase rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-brass)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-medium)] transition-colors cursor-pointer"
              >
                {type === "hide" ? "Encode Another" : "Reveal Another"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {status === "error" && (
        <div className="p-4 sm:p-5 rounded-xl bg-[var(--accent-crimson-bg)] border-2 border-[var(--accent-crimson)] shadow-[0_0_20px_rgba(255,42,85,0.15)] space-y-3 relative">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 cyber-hex bg-[var(--bg-surface)] border border-[var(--accent-crimson)] flex items-center justify-center text-[var(--accent-crimson)] shrink-0 mt-0.5">
              <AlertCircleIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-display font-bold text-[var(--text-primary)] uppercase tracking-wider cyber-text-glow-red">
                Cryptographic Operation Failed
              </h4>
              <p className="text-xs font-hud text-[var(--accent-crimson-text)] mt-0.5 leading-relaxed">
                {error ||
                  "Decryption failed. Passphrase incorrect or carrier image contains corrupted payload."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono-technical text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-medium)] px-3 py-2 rounded-lg">
            <ShieldIcon size={13} className="text-[var(--accent-brass)] shrink-0" />
            <span>
              Exceptions are masked to prevent side-channel timing analysis.
            </span>
          </div>

          {onReset && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onReset}
                className="cyber-btn-danger py-1.5 px-3.5 text-xs cursor-pointer"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
