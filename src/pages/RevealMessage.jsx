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
  AlertCircleIcon,
  CrosshairIcon,
  Layers,
  KeyIcon,
  CheckCircle2,
  LockIcon
} from "../components/Icons";

export default function RevealMessage() {
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("auto"); // 'auto' | 'scattered' | 'basic'

  const [status, setStatus] = useState("idle"); // 'idle' | 'processing' | 'success' | 'error'
  const [statusPhase, setStatusPhase] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [revealResult, setRevealResult] = useState(null);

  const handleSelectImage = async () => {
    setStatus("idle");
    setErrorMessage("");
    setRevealResult(null);

    try {
      // Require lossless PNG for extraction
      const result = await api.selectImage({ requirePng: true });
      if (result.canceled) return;

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

        // Record in local history store
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
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#34d399]">
              WORKSPACE // 02
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-[10px] font-mono uppercase text-zinc-400">
              PAYLOAD EXTRACTION
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Extract Hidden Message
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/25 text-[11px] font-mono text-[#34d399] flex items-center gap-1.5">
            <UnlockIcon size={12} />
            <span>Lossless PNG Decoder</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-400">
            Strict MAC Tag Verify
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Image Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
                <CrosshairIcon size={14} className="text-[#34d399]" />
                1. Encoded PNG Vessel
              </span>
              {image && (
                <span className="text-[11px] font-mono text-[#34d399] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
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

          {/* Extraction Strategy Pill */}
          <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10 space-y-2.5">
            <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
              <Layers size={14} className="text-[#34d399]" />
              Extraction Mode
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === "auto"
                    ? "bg-[#10b981]/15 border-[#10b981]/60 text-white"
                    : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-mono font-bold">Auto-Detect</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Scattered + Sequential</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("scattered")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === "scattered"
                    ? "bg-[#10b981]/15 border-[#10b981]/60 text-white"
                    : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-mono font-bold">Key-Seeded</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">PRNG Pixel Walk</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("basic")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  mode === "basic"
                    ? "bg-[#10b981]/15 border-[#10b981]/60 text-white"
                    : "bg-black/30 border-white/10 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-mono font-bold">Sequential</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Contiguous LSB</div>
              </button>
            </div>
          </div>

          {/* Zero-Leakage Assurance Notice */}
          <div className="p-3.5 rounded-xl bg-[#101814]/70 border border-[#10b981]/20 flex items-start gap-3">
            <ShieldIcon size={16} className="text-[#10b981] shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 leading-relaxed">
              <strong className="text-white font-semibold">Zero-Leakage Guarantee:</strong> Plaintext data is never written to disk or surfaced in memory unless the Poly1305 MAC tag matches the ciphertext perfectly. Wrong passwords produce no output.
            </div>
          </div>
        </div>

        {/* Right Column: Passphrase & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-4 bg-[#0f1118]/85 border-white/10 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-zinc-300 flex items-center gap-2">
              <KeyIcon size={14} className="text-[#34d399]" />
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
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl ${
                  isFormValid && status !== "processing"
                    ? "bg-[#10b981] hover:bg-[#34d399] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.99] cursor-pointer"
                    : "bg-white/5 border border-white/5 text-zinc-600 cursor-not-allowed"
                }`}
              >
                <UnlockIcon size={16} />
                <span>
                  {status === "processing"
                    ? "Decrypting Payload..."
                    : "Extract & Decrypt Message"}
                </span>
              </button>

              {!image && (
                <p className="text-[11px] font-mono text-center text-zinc-500">
                  Select an encoded PNG image to begin extraction.
                </p>
              )}
              {image && password.length === 0 && (
                <p className="text-[11px] font-mono text-center text-zinc-500">
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
