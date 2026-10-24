import React, { useState } from "react";
import {
  CheckIcon,
  AlertCircleIcon,
  DownloadIcon,
  CopyIcon,
  ShieldIcon,
  FolderOpenIcon,
  CheckCircle2,
  LockIcon,
  UnlockIcon,
  Terminal,
  ActivityIcon
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
        <div className="p-5 rounded-xl bg-[#0f1118]/90 border border-[#c5a059]/30 shadow-2xl flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-full border border-[#c5a059]/20 flex items-center justify-center shrink-0">
            <div className="w-5 h-5 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-semibold tracking-wider text-zinc-100 uppercase">
              {type === "hide"
                ? "Concealing Encrypted Payload..."
                : "Recovering & Authenticating Payload..."}
            </h4>
            <p className="text-xs text-zinc-400 font-mono">
              {phase || "Executing cryptographic primitives and pixel channel modulation."}
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS STATE */}
      {status === "success" && (
        <div className="p-5 rounded-xl bg-[#0e1411]/90 border border-[#10b981]/30 shadow-2xl space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#10b981]/15 border border-[#10b981]/40 flex items-center justify-center text-[#34d399] shrink-0 mt-0.5">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-zinc-100">
                {type === "hide"
                  ? "Carrier Encoding Completed Successfully"
                  : "Authenticated Message Recovered"}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {statusMessage ||
                  (type === "hide"
                    ? "Authenticated ciphertext has been embedded into lossless image pixels."
                    : "Cryptographic Poly1305 MAC tag matched ciphertext. Decrypted plaintext below.")}
              </p>
            </div>
          </div>

          {/* Decrypted Plaintext Result Card (Reveal Mode) */}
          {type === "reveal" && output?.message && (
            <div className="rounded-lg bg-[#07080b] border border-white/10 overflow-hidden shadow-inner">
              <div className="px-3 py-2 bg-[#10121a] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={13} className="text-[#c5a059]" />
                  <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                    Recovered Plaintext ({output.message.length} chars)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                >
                  {copiedMessage ? <CheckIcon size={12} className="text-[#34d399]" /> : <CopyIcon size={12} />}
                  <span>{copiedMessage ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-3.5 max-h-60 overflow-y-auto">
                <pre className="text-xs font-mono text-zinc-200 whitespace-pre-wrap break-all leading-relaxed select-text">
                  {output.message}
                </pre>
              </div>
            </div>
          )}

          {/* Saved File Confirmation (Hide Mode) */}
          {savedFilePath && (
            <div className="p-3 rounded-lg bg-black/40 border border-[#10b981]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <CheckIcon size={16} className="text-[#34d399] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-medium text-zinc-200 truncate">
                    Saved: {savedFilePath.split("/").pop()}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 truncate" title={savedFilePath}>
                    {savedFilePath}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="px-2 py-1 text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                  title="Copy absolute path"
                >
                  {copiedPath ? "Copied" : "Copy Path"}
                </button>
                {onShowInFolder && (
                  <button
                    type="button"
                    onClick={() => onShowInFolder(savedFilePath)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-[#d8b671] hover:text-white bg-[#c5a059]/15 hover:bg-[#c5a059]/30 border border-[#c5a059]/30 rounded transition-colors"
                  >
                    <FolderOpenIcon size={12} />
                    <span>Locate</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircleIcon size={14} className="text-rose-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {type === "hide" && onSave && (
              <button
                type="button"
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-[#c5a059] hover:bg-[#d8b671] text-black transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] active:scale-[0.98]"
              >
                <DownloadIcon size={14} />
                <span>{savedFilePath ? "Save Another Copy..." : "Export Lossless PNG"}</span>
              </button>
            )}

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-2 text-xs font-mono font-medium rounded-lg text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {type === "hide" ? "Encode New Message" : "Extract Another Image"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {status === "error" && (
        <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-800/40 shadow-2xl space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <AlertCircleIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-rose-200">
                Cryptographic Operation Failed
              </h4>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                {error ||
                  "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-black/40 border border-white/5 px-3 py-2 rounded-lg">
            <ShieldIcon size={13} className="text-[#c5a059] shrink-0" />
            <span>
              Security notice: Internal cryptographic exceptions are masked to prevent side-channel leakage.
            </span>
          </div>

          {onReset && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onReset}
                className="px-3.5 py-1.5 text-xs font-mono rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-colors"
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
