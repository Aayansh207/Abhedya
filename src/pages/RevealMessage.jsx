import React, { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import PasswordInput from "../components/PasswordInput";
import OperationStatus from "../components/OperationStatus";
import { api } from "../services/api";
import { historyStore } from "../services/history";
import {
  UnlockIcon,
  ShieldIcon,
  CrosshairIcon,
  Layers,
  KeyIcon
} from "../components/Icons";

export default function RevealMessage() {
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("auto"); // 'auto' | 'scattered' | 'basic'

  const [status, setStatus] = useState("idle"); // 'idle' | 'processing' | 'success' | 'error'
  const [statusPhase, setStatusPhase] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [revealResult, setRevealResult] = useState(null);

  const handleSelectImage = async (directFileOrPath) => {
    setStatus("idle");
    setErrorMessage("");
    setRevealResult(null);

    try {
      const result = directFileOrPath
        ? await api.inspectImage(directFileOrPath, { requirePng: true })
        : await api.selectImage({ requirePng: true });
      if (!result || result.canceled) return;

      if (!result.success) {
        setErrorMessage(result.error || "Failed to inspect image file.");
        return;
      }

      setImage(result);
    } catch (_err) {
      setErrorMessage("Error selecting image file.");
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setStatus("idle");
    setRevealResult(null);
    setErrorMessage("");
  };

  const isFormValid = image && password.length > 0;

  const handleStartReveal = async () => {
    if (!isFormValid) return;

    setStatus("processing");
    setStatusPhase("Inspecting discrete pixel bitstreams and extracting header payload...");
    setErrorMessage("");
    setRevealResult(null);

    try {
      setTimeout(() => {
        setStatusPhase("Deriving keys and verifying Poly1305 authentication MAC tag...");
      }, 400);

      const result = await api.revealMessage({
        imagePath: image.filePath,
        password,
        mode
      });

      if (result.success && result.message) {
        setRevealResult(result);
        setStatus("success");

        historyStore.addEntry({
          type: "decode",
          fileName: image.fileName || "encoded.png",
          fileSize: image.fileSize,
          dimensions: { width: image.width, height: image.height },
          mode: result.mode || mode,
          payloadBytes: result.message.length,
          status: "success"
        });
      } else {
        setStatus("error");
        setErrorMessage(
          result.error ||
            "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."
        );

        historyStore.addEntry({
          type: "decode",
          fileName: image.fileName || "encoded.png",
          fileSize: image.fileSize,
          dimensions: { width: image.width, height: image.height },
          mode,
          payloadBytes: 0,
          status: "error"
        });
      }
    } catch (_err) {
      setStatus("error");
      setErrorMessage(
        "Decryption failed. The password may be incorrect, or the image does not contain a valid encrypted payload."
      );
    }
  };

  const handleReset = () => {
    setPassword("");
    setStatus("idle");
    setRevealResult(null);
    setErrorMessage("");
  };

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-jade)]">
              WORKSPACE // 02
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono uppercase text-[var(--text-secondary)]">
              PAYLOAD EXTRACTION
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
            Extract Hidden Message
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[var(--accent-jade-bg)] border border-[var(--accent-jade-border)] text-[11px] font-mono text-[var(--accent-jade-text)] flex items-center gap-1.5 font-semibold">
            <UnlockIcon size={12} />
            <span>Lossless PNG Decoder</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]">
            Strict MAC Tag Verify
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Image Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="glass-panel p-4 border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold uppercase text-[var(--text-primary)] flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[var(--accent-jade)]" />
                1. Encoded PNG Vessel
              </span>
              {image && (
                <span className="text-[11px] font-mono text-[var(--accent-jade-text)] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-jade)]" />
                  PNG VERIFIED
                </span>
              )}
            </div>

            {!image ? (
              <ImageUploader
                onSelect={handleSelectImage}
                requirePng={true}
                label="Select Encoded PNG Image"
                sublabel="Select the lossless PNG containing the concealed encrypted payload"
              />
            ) : (
              <ImagePreview
                image={image}
                onClear={handleClearImage}
                onChange={handleSelectImage}
                title="Target Encoded Image"
              />
            )}
          </div>

          {/* Extraction Strategy Selector */}
          <div className="glass-panel p-4 border-[var(--border-subtle)] space-y-2.5">
            <span className="text-xs font-mono font-semibold uppercase text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={14} className="text-[var(--accent-jade)]" />
              Extraction Mode
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === "auto"
                    ? "bg-[var(--accent-jade-bg)] border-[var(--accent-jade)] text-[var(--text-primary)] font-semibold shadow-sm"
                    : "bg-[var(--bg-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]"
                }`}
              >
                <div className="text-xs font-mono font-bold">Auto-Detect</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">Scattered + Sequential</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("scattered")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === "scattered"
                    ? "bg-[var(--accent-jade-bg)] border-[var(--accent-jade)] text-[var(--text-primary)] font-semibold shadow-sm"
                    : "bg-[var(--bg-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]"
                }`}
              >
                <div className="text-xs font-mono font-bold">Key-Seeded</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">PRNG Pixel Walk</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("basic")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === "basic"
                    ? "bg-[var(--accent-jade-bg)] border-[var(--accent-jade)] text-[var(--text-primary)] font-semibold shadow-sm"
                    : "bg-[var(--bg-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]"
                }`}
              >
                <div className="text-xs font-mono font-bold">Sequential</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">Contiguous LSB</div>
              </button>
            </div>
          </div>

          {/* Zero-Leakage Assurance Notice */}
          <div className="p-3.5 rounded-xl bg-[var(--accent-jade-bg)] border border-[var(--accent-jade-border)] flex items-start gap-3">
            <ShieldIcon size={16} className="text-[var(--accent-jade)] shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--text-primary)] leading-relaxed">
              <strong className="font-semibold">Zero-Leakage Guarantee:</strong> Plaintext data is never written to disk or surfaced in memory unless the Poly1305 MAC tag matches the ciphertext perfectly. Wrong passwords produce no output.
            </div>
          </div>
        </div>

        {/* Right Column: Passphrase & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <div className="glass-panel p-4 border-[var(--border-subtle)] space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-[var(--text-primary)] flex items-center gap-2">
              <KeyIcon size={14} className="text-[var(--accent-jade)]" />
              2. Decryption Passphrase
            </span>

            <PasswordInput
              password={password}
              onPasswordChange={setPassword}
              showConfirmation={false}
              label="Decryption Passphrase"
              idPrefix="reveal-pwd"
            />
          </div>

          {/* Operation Status Feedback */}
          <OperationStatus
            status={status}
            phase={statusPhase}
            error={errorMessage}
            output={revealResult}
            onReset={handleReset}
            type="reveal"
          />

          {/* Primary Action Button */}
          {status !== "success" && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartReveal}
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  isFormValid && status !== "processing"
                    ? "bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-white dark:text-black shadow-md active:scale-[0.99] cursor-pointer"
                    : "bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed"
                }`}
              >
                <UnlockIcon size={15} />
                <span>
                  {status === "processing"
                    ? "Decrypting Payload..."
                    : "Extract & Decrypt Message"}
                </span>
              </button>

              {!image && (
                <p className="text-[11px] font-mono text-center text-[var(--text-muted)]">
                  Select an encoded PNG image to begin extraction.
                </p>
              )}
              {image && password.length === 0 && (
                <p className="text-[11px] font-mono text-center text-[var(--text-muted)]">
                  Enter the passphrase used during message embedding.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
