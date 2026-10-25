import React, { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import PasswordInput from "../components/PasswordInput";
import OperationStatus from "../components/OperationStatus";
import { api } from "../services/api";
import { historyStore } from "../services/history";
import {
  UnlockIcon,
  CrosshairIcon,
  Layers,
  KeyIcon
} from "../components/Icons";

export default function RevealMessage() {
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("auto"); // 'auto' | 'scattered' | 'basic'

  const [status, setStatus] = useState("idle");
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
    setStatusPhase("Inspecting pixel bitstreams and extracting header payload...");
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
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1 pb-4 min-h-0 min-w-0">
      {/* Workspace Header - Clean & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-technical uppercase tracking-wider text-[var(--accent-brass)] font-bold">
              WORKSPACE 02
            </span>
            <span className="text-[var(--border-strong)]">/</span>
            <span className="text-[10px] font-mono-technical uppercase text-[var(--text-secondary)]">
              EXTRACTION
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)] tracking-wide uppercase mt-0.5 cyber-text-glow">
            Extract Hidden Message
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[var(--accent-brass-bg)] border border-[var(--accent-brass-border)] text-[10px] font-mono-technical text-[var(--accent-brass-text)] font-semibold uppercase">
            Poly1305 Authenticated
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Image Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="glass-panel p-4 border-[var(--border-medium)] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[var(--accent-brass)]" />
                1. Encoded PNG Vessel
              </span>
              {image && (
                <span className="text-[10px] font-mono-technical text-[var(--accent-brass-text)] flex items-center gap-1 font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] indicator-pulse" />
                  PNG Verified
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
          <div className="glass-panel p-4 border-[var(--border-medium)] space-y-2.5">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={14} className="text-[var(--accent-brass)]" />
              Extraction Mode
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  mode === "auto"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--text-primary)] font-bold shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                    : "bg-[var(--bg-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                }`}
              >
                <div className="text-xs font-hud font-bold uppercase">Auto-Detect</div>
                <div className="text-[10px] font-mono-technical text-[var(--text-muted)] mt-0.5 truncate">Auto scan</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("scattered")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  mode === "scattered"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--text-primary)] font-bold shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                    : "bg-[var(--bg-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                }`}
              >
                <div className="text-xs font-hud font-bold uppercase">Key-Seeded</div>
                <div className="text-[10px] font-mono-technical text-[var(--text-muted)] mt-0.5 truncate">PRNG Walk</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("basic")}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  mode === "basic"
                    ? "bg-[var(--accent-brass-bg)] border-[var(--accent-brass)] text-[var(--text-primary)] font-bold shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                    : "bg-[var(--bg-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] hover:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                }`}
              >
                <div className="text-xs font-hud font-bold uppercase">Sequential</div>
                <div className="text-[10px] font-mono-technical text-[var(--text-muted)] mt-0.5 truncate">Linear LSB</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Passphrase & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4 min-w-0">
          <div className="glass-panel p-4 border-[var(--border-medium)] space-y-3">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <KeyIcon size={14} className="text-[var(--accent-brass)]" />
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
            <div className="pt-1">
              <button
                type="button"
                disabled={!isFormValid || status === "processing"}
                onClick={handleStartReveal}
                className={`w-full py-3.5 px-4 rounded-xl font-display text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                  isFormValid && status !== "processing"
                    ? "cyber-btn-primary cursor-pointer active:scale-[0.99]"
                    : "bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-60"
                }`}
              >
                <UnlockIcon size={15} />
                <span>
                  {status === "processing"
                    ? "Authenticating Payload..."
                    : !image
                    ? "1. Select Encoded PNG"
                    : password.length === 0
                    ? "2. Enter Decryption Passphrase"
                    : "Extract & Decrypt Message"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
