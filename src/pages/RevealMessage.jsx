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
    <div className="h-full flex flex-col gap-4 sm:gap-5 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-medium)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[var(--accent-brass)]">
              WORKSPACE // 02
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono-technical uppercase text-[var(--text-secondary)]">
              PAYLOAD EXTRACTION
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] tracking-wider uppercase mt-0.5 cyber-text-glow">
            Extract Hidden Message
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 cyber-cut-corner-sm bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] text-[10px] font-mono-technical text-[var(--accent-brass-text)] flex items-center gap-1.5 font-bold uppercase">
            <UnlockIcon size={12} />
            <span>LOSSLESS PNG DECODER</span>
          </span>
          <span className="px-3 py-1 cyber-cut-corner-sm bg-[var(--bg-inset)] border border-[var(--border-medium)] text-[10px] font-mono-technical text-[var(--text-secondary)] uppercase">
            STRICT MAC TAG VERIFY
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Image Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="glass-panel cyber-cut-corner p-4 border-[var(--border-strong)] relative">
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[var(--accent-brass)]" />
                1. ENCODED PNG VESSEL
              </span>
              {image && (
                <span className="text-[10px] font-mono-technical text-[var(--accent-brass-text)] flex items-center gap-1.5 font-bold uppercase cyber-glow-green-sm px-2 py-0.5 cyber-cut-corner-sm bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
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
          <div className="glass-panel cyber-cut-corner p-4 border-[var(--border-strong)] space-y-2.5 relative">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={14} className="text-[var(--accent-brass)]" />
              EXTRACTION MODE
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`p-2.5 cyber-cut-corner-sm border text-left transition-all ${
                  mode === "auto"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--text-primary)] font-bold cyber-glow-green-sm"
                    : "bg-[var(--bg-inset)] border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-brass)]"
                }`}
              >
                <div className="text-xs font-hud font-bold uppercase">Auto-Detect</div>
                <div className="text-[10px] font-mono-technical text-[var(--text-muted)] mt-0.5 truncate">Scattered + Sequential</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("scattered")}
                className={`p-2.5 cyber-cut-corner-sm border text-left transition-all ${
                  mode === "scattered"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--text-primary)] font-bold cyber-glow-green-sm"
                    : "bg-[var(--bg-inset)] border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-brass)]"
                }`}
              >
                <div className="text-xs font-hud font-bold uppercase">Key-Seeded</div>
                <div className="text-[10px] font-mono-technical text-[var(--text-muted)] mt-0.5 truncate">PRNG Pixel Walk</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("basic")}
                className={`p-2.5 cyber-cut-corner-sm border text-left transition-all ${
                  mode === "basic"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--text-primary)] font-bold cyber-glow-green-sm"
                    : "bg-[var(--bg-inset)] border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-brass)]"
                }`}
              >
                <div className="text-xs font-hud font-bold uppercase">Sequential</div>
                <div className="text-[10px] font-mono-technical text-[var(--text-muted)] mt-0.5 truncate">Contiguous LSB</div>
              </button>
            </div>
          </div>

          {/* Zero-Leakage Assurance Notice */}
          <div className="p-3.5 cyber-cut-corner-sm bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] flex items-start gap-3">
            <ShieldIcon size={16} className="text-[var(--accent-brass)] shrink-0 mt-0.5" />
            <div className="text-xs font-hud text-[var(--text-primary)] leading-relaxed">
              <strong className="font-bold text-[var(--accent-brass)]">ZERO-LEAKAGE GUARANTEE:</strong> Plaintext data is never written to disk or surfaced in memory unless the Poly1305 MAC tag matches the ciphertext perfectly. Incorrect passwords yield zero plaintext remnants.
            </div>
          </div>
        </div>

        {/* Right Column: Passphrase & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <div className="glass-panel cyber-cut-corner p-4 border-[var(--border-strong)] space-y-3 relative">
            <div className="corner-bracket-tl" />
            <div className="corner-bracket-tr" />
            <div className="corner-bracket-bl" />
            <div className="corner-bracket-br" />

            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <KeyIcon size={14} className="text-[var(--accent-brass)]" />
              2. DECRYPTION PASSPHRASE
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

          {/* Primary Action Button (Styled like "CALL" in reference) */}
          {status !== "success" && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartReveal}
                className={`w-full py-3.5 px-4 font-display text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                  isFormValid && status !== "processing"
                    ? "cyber-btn-primary cursor-pointer active:scale-[0.99]"
                    : "bg-[var(--bg-inset)] border border-[var(--border-subtle)] cyber-cut-corner-sm text-[var(--text-muted)] cursor-not-allowed opacity-60"
                }`}
              >
                <UnlockIcon size={16} />
                <span>
                  {status === "processing"
                    ? "DECRYPTING PAYLOAD..."
                    : "EXTRACT & DECRYPT MESSAGE"}
                </span>
              </button>

              {!image && (
                <p className="text-[10px] font-mono-technical text-center text-[var(--text-muted)] uppercase">
                  [ STEP 1 ]: Select an encoded PNG image to begin extraction.
                </p>
              )}
              {image && password.length === 0 && (
                <p className="text-[10px] font-mono-technical text-center text-[var(--text-muted)] uppercase">
                  [ STEP 2 ]: Enter the passphrase used during message embedding.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
